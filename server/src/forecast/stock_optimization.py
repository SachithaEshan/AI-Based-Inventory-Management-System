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

def run_arima_forecast(data):
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
        
        # Fit ARIMA model
        model = ARIMA(df['quantity'], order=(5,1,0))  # ARIMA(5,1,0) - can be tuned based on data
        model_fit = model.fit()
        
        # Forecast next 30 days
        forecast_steps = 30
        forecast = model_fit.forecast(steps=forecast_steps)
        
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
        
        # Prepare results
        forecast_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=forecast_steps)
        forecast_df = pd.DataFrame({
            'date': forecast_dates,
            'forecasted_quantity': forecast
        })
        
        # Convert datetime objects to ISO format strings for JSON serialization
        forecast_records = forecast_df.to_dict(orient='records')
        for record in forecast_records:
            record['date'] = record['date'].isoformat()
        
        optimization_results = {
            'forecast': forecast_records,
            'optimal_levels': {
                'safety_stock': round(safety_stock, 2),
                'reorder_point': round(reorder_point, 2),
                'economic_order_quantity': round(eoq, 2),
                'mean_demand': round(mean_demand, 2),
                'std_demand': round(std_demand, 2)
            }
        }
        
        return optimization_results
        
    except Exception as e:
        error_msg = f"Error in ARIMA forecast: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        return {"error": error_msg}

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
    try:
        if len(sys.argv) > 1:
            if sys.argv[1] == 'demo':
                result = optimize_stock_levels(is_demo=True)
            elif sys.argv[1] == 'forecast':
                # Parse the sales data from the second argument
                sales_data = json.loads(sys.argv[2])
                result = run_arima_forecast(sales_data)
            else:
                result = optimize_stock_levels(product_id=sys.argv[1])
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "Product ID, forecast mode, or demo mode required"}))
    except Exception as e:
        error_msg = f"Error in main: {str(e)}\n{traceback.format_exc()}"
        print(json.dumps({"error": error_msg})) 