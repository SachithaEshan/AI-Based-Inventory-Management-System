# New file: server/src/anomaly/arima_anomaly_detector.py
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.stattools import adfuller
import warnings
import sys
import json

warnings.filterwarnings('ignore')

class ARIMAAnomalyDetector:
    def __init__(self):
        self.model = None
        self.model_fit = None
        self.residuals = None
        self.threshold = None
        
    def prepare_data(self, sales_data):
        """
        Convert sales data to time series format
        """
        df = pd.DataFrame(sales_data)
        df['date'] = pd.to_datetime(df['date'])
        # Aggregate by date
        ts = df.groupby('date')['quantity'].sum()
        return ts
        
    def find_best_parameters(self, time_series):
        """
        Find optimal ARIMA parameters using AIC
        """
        best_aic = float('inf')
        best_params = None
        best_model = None
        
        # Try different combinations of p, d, q
        for p in range(3):
            for d in range(2):
                for q in range(3):
                    try:
                        model = ARIMA(time_series, order=(p, d, q))
                        results = model.fit()
                        if results.aic < best_aic:
                            best_aic = results.aic
                            best_params = (p, d, q)
                            best_model = results
                    except:
                        continue
                        
        return best_params, best_model
        
    def fit_model(self, sales_data):
        """
        Fit ARIMA model to the data
        """
        # Prepare time series
        time_series = self.prepare_data(sales_data)
        
        # Find best parameters and fitted model
        (p, d, q), self.model_fit = self.find_best_parameters(time_series)
        
        if self.model_fit is None:
            raise Exception("Failed to fit ARIMA model")
        
        # Store model parameters
        self.model = ARIMA(time_series, order=(p, d, q))
        
        # Calculate residuals
        self.residuals = self.model_fit.resid
        
        # Calculate threshold (1.5 standard deviations for more sensitivity)
        self.threshold = 1.5 * np.std(self.residuals)
        
        return {
            'parameters': {'p': p, 'd': d, 'q': q},
            'aic': self.model_fit.aic,
            'bic': self.model_fit.bic
        }
        
    def detect_anomalies(self, sales_data):
        """
        Detect anomalies in the sales data
        """
        if self.model_fit is None:
            self.fit_model(sales_data)
            
        # Prepare time series
        time_series = self.prepare_data(sales_data)
        
        # Get model predictions
        predictions = self.model_fit.predict(start=time_series.index[0], end=time_series.index[-1])
        
        # Calculate residuals
        residuals = time_series - predictions
        
        # Calculate rolling mean and std for dynamic threshold
        rolling_mean = time_series.rolling(window=5, min_periods=1).mean()
        rolling_std = time_series.rolling(window=5, min_periods=1).std()
        
        # Detect anomalies using both residual and value-based methods
        residual_anomalies = np.abs(residuals) > self.threshold
        value_anomalies = np.abs(time_series - rolling_mean) > (2 * rolling_std)
        
        # Combine both methods
        anomalies = residual_anomalies | value_anomalies
        
        # Prepare results
        results = []
        for date, is_anomaly in zip(time_series.index, anomalies):
            if is_anomaly:
                actual_value = float(time_series[date])
                predicted_value = float(predictions[date])
                residual = float(residuals[date])
                
                # Calculate severity based on multiple factors
                residual_severity = np.abs(residual) / self.threshold
                value_severity = np.abs(actual_value - predicted_value) / np.mean(time_series)
                combined_severity = (residual_severity + value_severity) / 2
                
                severity = 'High' if combined_severity > 2 else 'Medium'
                
                results.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'actual_value': actual_value,
                    'predicted_value': predicted_value,
                    'residual': residual,
                    'severity': severity
                })
        
        return {
            'anomalies': results,
            'model_parameters': {
                'p': self.model.order[0],
                'd': self.model.order[1],
                'q': self.model.order[2]
            },
            'threshold': float(self.threshold)
        }

if __name__ == "__main__":
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        sales_data = json.loads(input_data)
        
        # Initialize detector
        detector = ARIMAAnomalyDetector()
        
        # Detect anomalies
        results = detector.detect_anomalies(sales_data)
        
        # Print results as JSON
        print(json.dumps(results))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)