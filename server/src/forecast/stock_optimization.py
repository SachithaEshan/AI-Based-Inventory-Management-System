import sys
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
import json
import traceback
from bson import ObjectId
from statsmodels.tsa.stattools import adfuller
from typing import Dict, List, Union, Any

def get_mongodb_connection():
    try:
        mongo_uri = os.getenv('DATABASE_URL', 'mongodb://localhost:27017')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.server_info()
        return client
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}", file=sys.stderr)
        return None

def get_inventory_data(product_id=None):
    client = get_mongodb_connection()
    if not client:
        print("Failed to connect to MongoDB", file=sys.stderr)
        return []
        
    try:
        db = client['dev']
        collection = db['inventory']
        
        query = {}
        if product_id:
            try:
                product_id = ObjectId(product_id)
                query['product'] = product_id
            except:
                print(f"Invalid product ID format: {product_id}", file=sys.stderr)
                return []
        
        cursor = collection.find(query)
        inventory_data = list(cursor)
        
        if len(inventory_data) > 0:
            transformed_data = []
            for record in inventory_data:
                transformed_data.append({
                    'date': record['date'],
                    'quantity': record['quantity'],
                    'reorder_point': record.get('reorderPoint', 0),
                    'safety_stock': record.get('safetyStock', 0)
                })
            return transformed_data
        
        return []
    except Exception as e:
        print(f"Error fetching inventory data: {str(e)}", file=sys.stderr)
        return []
    finally:
        if client:
            client.close()

def is_stationary(data: pd.Series, threshold: float = 0.05) -> bool:
    """Test if the time series is stationary using Augmented Dickey-Fuller test."""
    result = adfuller(data)
    return result[1] < threshold

def find_best_arima_order(data: pd.Series, max_p: int = 5, max_d: int = 2, max_q: int = 5) -> tuple:
    """Find the best ARIMA order using AIC."""
    best_aic = float('inf')
    best_order = None
    
    for p in range(max_p + 1):
        for d in range(max_d + 1):
            for q in range(max_q + 1):
                try:
                    model = ARIMA(data, order=(p, d, q))
                    results = model.fit()
                    if results.aic < best_aic:
                        best_aic = results.aic
                        best_order = (p, d, q)
                except:
                    continue
    
    return best_order if best_order else (1, 1, 1)

def run_arima_forecast(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    try:
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        
        # Convert date strings to datetime objects
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df.set_index('date', inplace=True)
        
        # Ensure we have enough data points
        if len(df) < 10:
            return {"error": "Not enough data points for ARIMA forecast. Minimum 10 points required."}
        
        # Check for stationarity and difference if necessary
        if not is_stationary(df['quantity']):
            df['quantity'] = df['quantity'].diff().dropna()
        
        # Find best ARIMA order
        best_order = find_best_arima_order(df['quantity'])
        print(f"Best ARIMA order: {best_order}")
        
        # Fit ARIMA model
        model = ARIMA(df['quantity'], order=best_order)
        model_fit = model.fit()
        
        # Forecast next 30 days
        forecast_steps = 30
        forecast = model_fit.forecast(steps=forecast_steps)
        
        # Calculate model diagnostics
        residuals = model_fit.resid
        mae = np.mean(np.abs(residuals))
        rmse = np.sqrt(np.mean(residuals**2))
        
        # Calculate optimal stock levels
        mean_demand = df['quantity'].mean()
        std_demand = df['quantity'].std()
        
        # Calculate safety stock using service level of 95%
        service_level = 0.95
        z_score = 1.645  # for 95% service level
        safety_stock = z_score * std_demand
        
        # Calculate reorder point
        lead_time = 7  # assuming 7 days lead time
        reorder_point = (mean_demand * lead_time) + safety_stock
        
        # Calculate optimal order quantity (EOQ)
        holding_cost = 0.2  # 20% of item cost per year
        ordering_cost = 50  # fixed cost per order
        annual_demand = mean_demand * 365
        eoq = np.sqrt((2 * annual_demand * ordering_cost) / holding_cost)
        
        # Prepare forecast results
        forecast_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=forecast_steps)
        forecast_df = pd.DataFrame({
            'date': forecast_dates,
            'forecasted_quantity': forecast
        })
        
        # Convert datetime objects to ISO format strings for JSON serialization
        forecast_records = forecast_df.to_dict(orient='records')
        
        # Prepare model diagnostics
        diagnostics = {
            'mae': float(mae),
            'rmse': float(rmse),
            'aic': float(model_fit.aic),
            'bic': float(model_fit.bic),
            'residuals_mean': float(residuals.mean()),
            'residuals_std': float(residuals.std())
        }
        
        # Prepare optimal levels
        optimal_levels = {
            'mean_demand': float(mean_demand),
            'std_demand': float(std_demand),
            'safety_stock': float(safety_stock),
            'reorder_point': float(reorder_point),
            'economic_order_quantity': float(eoq)
        }
        
        return {
            'forecast': forecast_records,
            'model_diagnostics': diagnostics,
            'optimal_levels': optimal_levels
        }
        
    except Exception as e:
        print(f"Error in ARIMA forecast: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

def optimize_stock_levels(product_id=None, is_demo=False):
    try:
        if is_demo:
            # For demo, use sample data
            dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
            np.random.seed(42)
            quantities = np.random.normal(100, 20, len(dates))
            df = pd.DataFrame({'date': dates, 'quantity': quantities})
            return run_arima_forecast(df.to_dict(orient='records'))
        else:
            # Get inventory data from MongoDB
            inventory_data = get_inventory_data(product_id)
            
            if not inventory_data:
                return {"error": "No inventory data found for this product."}
                
            if len(inventory_data) < 30:
                return {"error": "Not enough inventory data to optimize. Minimum 30 records required."}
                
            return run_arima_forecast(inventory_data)
        
    except Exception as e:
        error_msg = f"Error in stock optimization: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        return {"error": error_msg}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No data provided"}))
        sys.exit(1)
        
    try:
        data = json.loads(sys.argv[1])
        result = run_arima_forecast(data)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1) 