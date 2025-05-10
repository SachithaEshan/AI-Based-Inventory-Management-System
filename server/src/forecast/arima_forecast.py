import numpy as np
import pandas as pd
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller, acf, pacf
from statsmodels.tsa.seasonal import seasonal_decompose
from sklearn.metrics import mean_absolute_error, mean_squared_error
import warnings
warnings.filterwarnings('ignore')

def check_stationarity(data):
    """Check if the time series is stationary using Augmented Dickey-Fuller test"""
    result = adfuller(data)
    return result[1] < 0.05  # p-value < 0.05 indicates stationarity

def make_stationary(data):
    """Transform non-stationary data to stationary using differencing"""
    diff_data = data
    d = 0
    while not check_stationarity(diff_data) and d < 2:
        diff_data = np.diff(diff_data)
        d += 1
    return diff_data, d

def determine_acf_pacf_order(data, max_lag=20):
    """Determine p and q orders using ACF and PACF"""
    acf_vals = acf(data, nlags=max_lag)
    pacf_vals = pacf(data, nlags=max_lag)
    
    # Find significant lags
    p = len([x for x in pacf_vals[1:] if abs(x) > 1.96/np.sqrt(len(data))])
    q = len([x for x in acf_vals[1:] if abs(x) > 1.96/np.sqrt(len(data))])
    
    return min(p, 5), min(q, 5)  # Cap at 5 to avoid overfitting

def find_optimal_order(data, max_p=5, max_d=2, max_q=5):
    """Find optimal ARIMA order using AIC"""
    best_aic = float('inf')
    best_order = None
    
    # Make data stationary
    stationary_data, d = make_stationary(data)
    
    # Get initial p, q estimates from ACF/PACF
    p, q = determine_acf_pacf_order(stationary_data)
    
    # Search around the initial estimates
    for p_val in range(max(0, p-1), min(p+2, max_p + 1)):
        for q_val in range(max(0, q-1), min(q+2, max_q + 1)):
            try:
                model = SARIMAX(data, order=(p_val, d, q_val),
                              enforce_stationarity=True,
                              enforce_invertibility=True)
                results = model.fit(disp=False, maxiter=50)
                if results.aic < best_aic:
                    best_aic = results.aic
                    best_order = (p_val, d, q_val)
            except:
                continue
    
    return best_order or (1, d, 1)  # Fallback to simple model if optimization fails

def calculate_inventory_metrics(forecast, historical_data):
    """Calculate inventory optimization metrics"""
    mean_demand = np.mean(historical_data)
    std_demand = np.std(historical_data)
    
    # Safety stock calculation (95% service level)
    safety_stock = 1.645 * std_demand
    
    # Reorder point calculation (7 days lead time)
    lead_time = 7
    reorder_point = (mean_demand * lead_time) + safety_stock
    
    # Economic Order Quantity calculation
    annual_demand = mean_demand * 365
    ordering_cost = 50  # Example fixed cost per order
    holding_cost = 0.2  # 20% of item cost per year
    eoq = np.sqrt((2 * annual_demand * ordering_cost) / holding_cost)
    
    return {
        'mean_demand': mean_demand,
        'std_demand': std_demand,
        'safety_stock': safety_stock,
        'reorder_point': reorder_point,
        'economic_order_quantity': eoq
    }

def forecast_demand(historical_data, forecast_period=30):
    """Generate demand forecast using ARIMA"""
    # Convert to numpy array and ensure positive values
    data = np.array(historical_data)
    data = np.maximum(data, 0)
    
    # Find optimal order
    order = find_optimal_order(data)
    print(f"Best ARIMA order: {order}")
    
    # Fit ARIMA model with constraints
    model = SARIMAX(data, order=order,
                   enforce_stationarity=True,
                   enforce_invertibility=True)
    results = model.fit(disp=False, maxiter=50)
    
    # Generate forecast
    forecast = results.forecast(steps=forecast_period)
    
    # Ensure non-negative forecasts
    forecast = np.maximum(forecast, 0)
    
    # Calculate model diagnostics
    predictions = results.predict(start=0, end=len(data)-1)
    predictions = np.maximum(predictions, 0)
    mae = mean_absolute_error(data, predictions)
    rmse = np.sqrt(mean_squared_error(data, predictions))
    
    # Calculate inventory metrics
    metrics = calculate_inventory_metrics(forecast, data)
    
    # Prepare forecast dates
    last_date = pd.Timestamp.now()
    forecast_dates = pd.date_range(start=last_date, periods=forecast_period, freq='D')
    
    # Print forecast results
    print("\nForecast for next 30 days:")
    for date, value in zip(forecast_dates, forecast):
        print(f"Date: {date}, Forecasted Quantity: {value:.2f}")
    
    # Print model diagnostics
    print("\nModel Diagnostics:")
    print(f"mae: {mae:.2f}")
    print(f"rmse: {rmse:.2f}")
    print(f"aic: {results.aic:.2f}")
    print(f"bic: {results.bic:.2f}")
    print(f"residuals_mean: {np.mean(results.resid):.2f}")
    print(f"residuals_std: {np.std(results.resid):.2f}")
    
    # Print inventory metrics
    print("\nOptimal Levels:")
    for key, value in metrics.items():
        print(f"{key}: {value:.2f}")
    
    return {
        'forecast': forecast,
        'dates': forecast_dates,
        'metrics': metrics,
        'diagnostics': {
            'mae': mae,
            'rmse': rmse,
            'aic': results.aic,
            'bic': results.bic,
            'residuals_mean': np.mean(results.resid),
            'residuals_std': np.std(results.resid)
        }
    } 