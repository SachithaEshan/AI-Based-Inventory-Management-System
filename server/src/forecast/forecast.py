import sys
import pandas as pd
from prophet import Prophet
from pymongo import MongoClient
import os
from datetime import datetime, timedelta
import pathlib
import json
import traceback
from bson import ObjectId

def get_mongodb_connection():
    try:
        mongo_uri = os.getenv('DATABASE_URL', 'mongodb://localhost:27017')
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test the connection
        client.server_info()
        return client
    except Exception as e:
        print(f"MongoDB connection error: {str(e)}", file=sys.stderr)
        return None

def get_sales_data(product_id=None):
    client = get_mongodb_connection()
    if not client:
        print("Failed to connect to MongoDB", file=sys.stderr)
        return []
        
    try:
        # List all databases
        print("Available databases:", client.list_database_names(), file=sys.stderr)
        
        # Use the 'dev' database instead of 'inventory_management'
        db = client['dev']
        # List all collections
        print("Available collections:", db.list_collection_names(), file=sys.stderr)
        
        collection = db['sales']
        
        # Count total documents in sales collection
        total_sales = collection.count_documents({})
        print(f"Total sales documents: {total_sales}", file=sys.stderr)
        
        query = {}
        if product_id:
            # Convert string product_id to ObjectId if needed
            try:
                product_id = ObjectId(product_id)
            except:
                print(f"Invalid product ID format: {product_id}", file=sys.stderr)
                return []
            
            query['product'] = product_id
            print(f"Querying sales for product: {product_id}", file=sys.stderr)
            
            # Count documents matching the query
            matching_sales = collection.count_documents(query)
            print(f"Sales matching query: {matching_sales}", file=sys.stderr)
            
            # Print a sample document to see the structure
            sample = collection.find_one({})
            if sample:
                print(f"Sample document structure: {sample}", file=sys.stderr)
        
        # Print the query for debugging
        print(f"MongoDB query: {query}", file=sys.stderr)
        
        # Find all matching documents
        cursor = collection.find(query)
        sales_data = list(cursor)
        
        print(f"Found {len(sales_data)} sales records", file=sys.stderr)
        
        if len(sales_data) > 0:
            print(f"Sample sales record: {sales_data[0]}", file=sys.stderr)
            # Transform the data to match expected format
            transformed_data = []
            for sale in sales_data:
                transformed_data.append({
                    'date': sale['date'],
                    'quantity': sale['quantity']
                })
            return transformed_data
        
        return []
    except Exception as e:
        print(f"Error fetching sales data: {str(e)}", file=sys.stderr)
        return []
    finally:
        if client:
            client.close()

def forecast(product_id=None, is_demo=False):
    try:
        if is_demo:
            # For demo, use the CSV file
            current_dir = pathlib.Path(__file__).parent.parent.parent
            csv_path = current_dir / 'csv' / 'retail_store_inventory.csv'
            
            if not csv_path.exists():
                print(f"CSV file not found at {csv_path}", file=sys.stderr)
                return {"error": f"CSV file not found at {csv_path}"}
                
            print(f"Reading CSV file from {csv_path}", file=sys.stderr)
            df = pd.read_csv(csv_path)
            print(f"CSV columns: {df.columns.tolist()}", file=sys.stderr)
            
            # Check if required columns exist
            if 'Date' not in df.columns or 'Units Sold' not in df.columns:
                print(f"Required columns not found. Available columns: {df.columns.tolist()}", file=sys.stderr)
                return {"error": "CSV file does not contain required columns (Date, Units Sold)"}
                
            # Aggregate sales by date
            product_df = df.groupby('Date')['Units Sold'].sum().reset_index()
            product_df = product_df.rename(columns={'Date': 'ds', 'Units Sold': 'y'})
            
            # Convert date to datetime
            product_df['ds'] = pd.to_datetime(product_df['ds'])
        else:
            # Get sales data from MongoDB
            sales_data = get_sales_data(product_id)
            
            if not sales_data:
                return {"error": "No sales data found for this product."}
                
            if len(sales_data) < 10:
                return {"error": "Not enough sales data to forecast. Minimum 10 sales records required."}
                
            # Convert MongoDB data to DataFrame
            df = pd.DataFrame(sales_data)
            df['date'] = pd.to_datetime(df['date'])
            product_df = df[['date', 'quantity']]
            product_df = product_df.rename(columns={'date': 'ds', 'quantity': 'y'})
        
        # Train model
        model = Prophet()
        model.fit(product_df)
        
        # Make future dataframe (e.g., 30 days)
        future = model.make_future_dataframe(periods=60)
        forecast = model.predict(future)
        
        # Select only important columns
        result = forecast[['ds', 'yhat']]
        
        # Convert dates to string format for JSON serialization
        result['ds'] = result['ds'].dt.strftime('%Y-%m-%d')
        
        # Return results as JSON
        return result.to_dict(orient='records')
        
    except Exception as e:
        error_msg = f"Error in forecast: {str(e)}\n{traceback.format_exc()}"
        print(error_msg, file=sys.stderr)
        return {"error": error_msg}

if __name__ == "__main__":
    try:
        if len(sys.argv) > 1:
            if sys.argv[1] == 'demo':
                result = forecast(is_demo=True)
            else:
                result = forecast(product_id=sys.argv[1])
            print(json.dumps(result))
        else:
            print(json.dumps({"error": "Product ID or demo mode required"}))
    except Exception as e:
        error_msg = f"Error in main: {str(e)}\n{traceback.format_exc()}"
        print(json.dumps({"error": error_msg}))