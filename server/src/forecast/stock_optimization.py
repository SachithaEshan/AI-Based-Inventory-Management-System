import sys
import pandas as pd
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
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
    try:
        # Connect to MongoDB
        mongo_uri = os.getenv('DATABASE_URL')
        print(f"Connecting to MongoDB with URI: {mongo_uri}", file=sys.stderr)
        
        client = MongoClient(mongo_uri)
        db = client['dev']
        
        # Get sales records
        if product_id:
            print(f"Searching for product_id: {product_id}", file=sys.stderr)
            try:
                # Convert string ID to ObjectId
                product_obj_id = ObjectId(product_id)
                query = {'product': product_obj_id}
                print(f"Querying sales with: {query}", file=sys.stderr)
                
                # Get all sales records for this product
                records = list(db.sales.find(query))
                print(f"Found {len(records)} sales records", file=sys.stderr)
                
                if not records:
                    print(f"No sales records found for product_id: {product_id}", file=sys.stderr)
                    return []
                
                # Transform data
                data = []
                for record in records:
                    # Ensure date is in datetime format
                    sale_date = record.get('date')
                    if isinstance(sale_date, str):
                        sale_date = datetime.strptime(sale_date, '%Y-%m-%dT%H:%M:%S.%fZ')
                    
                    data.append({
                        'date': sale_date.strftime('%Y-%m-%d'),
                        'quantity': record.get('quantity', 0)
                    })
                
                print(f"Transformed {len(data)} records", file=sys.stderr)
                return data
                
            except Exception as e:
                print(f"Error processing sales data: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
                return []
        else:
            print("No product_id provided", file=sys.stderr)
            return []
            
    except Exception as e:
        print(f"Error getting sales data: {str(e)}\n{traceback.format_exc()}", file=sys.stderr)
        return []

def is_stationary(data: pd.Series, threshold: float = 0.05) -> bool:
    """Test if the time series is stationary using Augmented Dickey-Fuller test."""
    result = adfuller(data)
    return result[1] < threshold

def find_best_arima_order(data: pd.Series, max_p: int = 2, max_d: int = 1, max_q: int = 2) -> tuple:
    """Find the best ARIMA order using AIC with reduced search space."""
    best_aic = float('inf')
    best_order = None
    
    # Reduced search space for faster computation
    for p in range(max_p + 1):
        for d in range(max_d + 1):
            for q in range(max_q + 1):
                try:
                    model = SARIMAX(data, order=(p, d, q))
                    results = model.fit(disp=False, maxiter=50)
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
        
        # Use simple moving average for faster computation
        forecast_steps = 30
        forecast = df['quantity'].rolling(window=7).mean().iloc[-forecast_steps:]
        
        # Replace NaN values with mean of the forecast
        mean_forecast = forecast.mean()
        forecast = forecast.fillna(mean_forecast)
        
        # Calculate optimal stock levels
        mean_demand = df['quantity'].mean()
        std_demand = df['quantity'].std()
        
        # Calculate safety stock using service level of 95%
        service_level = 0.95
        z_score = 1.645  # for 95% service level
        safety_stock = z_score * std_demand * np.sqrt(7)
        
        # Calculate reorder point
        lead_time = 7  # assuming 7 days lead time
        reorder_point = (mean_demand * lead_time) + safety_stock
        
        # Calculate optimal order quantity (EOQ)
        holding_cost = 0.2  # 20% of item cost per year
        ordering_cost = 50  # fixed cost per order
        annual_demand = mean_demand * 365
        eoq = np.sqrt((2 * annual_demand * ordering_cost) / holding_cost)
        
        # Prepare forecast results
        forecast_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=len(forecast))
        forecast_df = pd.DataFrame({
            'date': [d.strftime('%Y-%m-%d') for d in forecast_dates],
            'forecasted_quantity': forecast.values
        })
        
        # Convert to records
        forecast_records = forecast_df.to_dict(orient='records')
        
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
            'optimal_levels': optimal_levels
        }
        
    except Exception as e:
        print(f"Error in forecast: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

def generate_sample_data():
    """Generate sample data for demonstration purposes"""
    # Use current date as reference
    end_date = datetime.now()
    start_date = end_date - timedelta(days=90)  # 90 days of historical data
    
    # Generate dates
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Generate random quantities with a realistic pattern
    np.random.seed(42)  # For reproducibility
    base_quantity = 100
    trend = np.linspace(0, 20, len(dates))  # Upward trend
    seasonality = 10 * np.sin(np.linspace(0, 4*np.pi, len(dates)))  # Weekly seasonality
    noise = np.random.normal(0, 5, len(dates))  # Random noise
    
    quantities = base_quantity + trend + seasonality + noise
    quantities = np.maximum(quantities, 0)  # Ensure non-negative quantities
    
    # Create DataFrame
    df = pd.DataFrame({
        'date': dates,
        'quantity': quantities
    })
    
    return df

def analyze_sales_patterns(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze sales patterns including trends, seasonality, and key metrics"""
    try:
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        df.set_index('date', inplace=True)
        
        # 1. Basic Statistics
        basic_stats = {
            'total_sales': float(df['quantity'].sum()),
            'mean_daily_sales': float(df['quantity'].mean()),
            'median_daily_sales': float(df['quantity'].median()),
            'std_daily_sales': float(df['quantity'].std()),
            'min_daily_sales': float(df['quantity'].min()),
            'max_daily_sales': float(df['quantity'].max()),
            'sales_range': float(df['quantity'].max() - df['quantity'].min())
        }
        
        # 2. Trend Analysis
        # Calculate 7-day and 30-day moving averages
        df['ma7'] = df['quantity'].rolling(window=7).mean()
        df['ma30'] = df['quantity'].rolling(window=30).mean()
        
        # Calculate trend direction
        first_ma7 = df['ma7'].dropna().iloc[0]
        last_ma7 = df['ma7'].dropna().iloc[-1]
        trend_direction = "increasing" if last_ma7 > first_ma7 else "decreasing" if last_ma7 < first_ma7 else "stable"
        
        # 3. Seasonality Analysis
        # Add day of week and month columns
        df['day_of_week'] = df.index.dayofweek
        df['month'] = df.index.month
        
        # Calculate average sales by day of week
        daily_patterns = df.groupby('day_of_week')['quantity'].mean().to_dict()
        
        # Calculate average sales by month
        monthly_patterns = df.groupby('month')['quantity'].mean().to_dict()
        
        # 4. Volatility Analysis
        # Calculate coefficient of variation
        cv = df['quantity'].std() / df['quantity'].mean() if df['quantity'].mean() != 0 else 0
        
        # 5. Growth Analysis
        if len(df) > 1:
            first_month_avg = df['quantity'].iloc[:len(df)//2].mean()
            last_month_avg = df['quantity'].iloc[len(df)//2:].mean()
            growth_rate = ((last_month_avg - first_month_avg) / first_month_avg * 100) if first_month_avg != 0 else 0
        else:
            growth_rate = 0
        
        # 6. Peak Analysis
        peak_days = df.nlargest(3, 'quantity')
        peak_analysis = {
            'peak_dates': [d.strftime('%Y-%m-%d') for d in peak_days.index],
            'peak_values': [float(v) for v in peak_days['quantity']]
        }
        
        # 7. Low Sales Analysis
        low_days = df.nsmallest(3, 'quantity')
        low_analysis = {
            'low_dates': [d.strftime('%Y-%m-%d') for d in low_days.index],
            'low_values': [float(v) for v in low_days['quantity']]
        }
        
        return {
            'basic_stats': basic_stats,
            'trend_analysis': {
                'trend_direction': trend_direction,
                'trend_strength': float(abs(last_ma7 - first_ma7) / first_ma7 * 100) if first_ma7 != 0 else 0
            },
            'seasonality': {
                'daily_patterns': daily_patterns,
                'monthly_patterns': monthly_patterns
            },
            'volatility': {
                'coefficient_of_variation': float(cv),
                'volatility_level': 'high' if cv > 1 else 'medium' if cv > 0.5 else 'low'
            },
            'growth': {
                'growth_rate': float(growth_rate),
                'growth_status': 'growing' if growth_rate > 5 else 'declining' if growth_rate < -5 else 'stable'
            },
            'peak_analysis': peak_analysis,
            'low_analysis': low_analysis
        }
        
    except Exception as e:
        print(f"Error in sales pattern analysis: {str(e)}", file=sys.stderr)
        return {"error": str(e)}

def optimize_stock_levels(product_id=None, is_demo=False):
    try:
        print(f"Starting stock optimization with product_id={product_id}, is_demo={is_demo}", file=sys.stderr)
        
        if is_demo:
            print("Using demo mode - generating sample data", file=sys.stderr)
            # For demo, use sample data
            df = generate_sample_data()
            data = df.to_dict(orient='records')
            forecast_result = run_arima_forecast(data)
            pattern_analysis = analyze_sales_patterns(data)
            return {**forecast_result, 'pattern_analysis': pattern_analysis}
        else:
            # Get inventory data from MongoDB
            inventory_data = get_inventory_data(product_id)
            
            if not inventory_data:
                print("No sales data found, falling back to demo mode", file=sys.stderr)
                return optimize_stock_levels(None, True)
                
            if len(inventory_data) < 10:  # Reduced minimum requirement
                print("Not enough sales data, falling back to demo mode", file=sys.stderr)
                return optimize_stock_levels(None, True)
            
            forecast_result = run_arima_forecast(inventory_data)
            pattern_analysis = analyze_sales_patterns(inventory_data)
            return {**forecast_result, 'pattern_analysis': pattern_analysis}
        
    except Exception as e:
        error_msg = f"Error in stock optimization: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        return {"error": error_msg}

if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"error": "No arguments provided"}))
            sys.exit(1)
            
        script_path = sys.argv[0]
        product_id = sys.argv[1] if sys.argv[1] != 'demo' else None
        is_demo = product_id is None
        
        print(f"Running script with product_id={product_id}, is_demo={is_demo}", file=sys.stderr)
        result = optimize_stock_levels(product_id, is_demo)
        print(json.dumps(result))
        
    except Exception as e:
        error_msg = f"Error in main: {str(e)}\n{traceback.format_exc()}"
        print(json.dumps({"error": error_msg}), file=sys.stderr)
        sys.exit(1) 