import numpy as np
import pandas as pd
from arima_forecast import forecast_demand

def generate_test_data(n_days=365, trend='increasing', seasonality=True, noise_level=0.1):
    """Generate synthetic sales data with specified characteristics"""
    # Base trend
    if trend == 'increasing':
        base = np.linspace(100, 200, n_days)
    elif trend == 'decreasing':
        base = np.linspace(200, 100, n_days)
    else:  # stable
        base = np.ones(n_days) * 150
    
    # Add seasonality (weekly pattern)
    if seasonality:
        season = 20 * np.sin(np.linspace(0, 4*np.pi, n_days))
    else:
        season = np.zeros(n_days)
    
    # Add noise
    noise = np.random.normal(0, noise_level * np.mean(base), n_days)
    
    # Combine components
    data = base + season + noise
    
    # Ensure non-negative values
    data = np.maximum(data, 0)
    
    return data

def main():
    # Generate test data for different scenarios
    scenarios = {
        'increasing_trend': generate_test_data(trend='increasing'),
        'decreasing_trend': generate_test_data(trend='decreasing'),
        'stable_trend': generate_test_data(trend='stable'),
        'seasonal': generate_test_data(seasonality=True),
        'non_seasonal': generate_test_data(seasonality=False)
    }
    
    # Test each scenario
    for scenario_name, data in scenarios.items():
        print(f"\nTesting {scenario_name} scenario:")
        print("-" * 50)
        
        # Run forecast
        forecast_results = forecast_demand(data)
        
        # Print summary
        print(f"\nSummary for {scenario_name}:")
        print(f"Mean forecast: {np.mean(forecast_results['forecast']):.2f}")
        print(f"Forecast std: {np.std(forecast_results['forecast']):.2f}")
        print(f"MAE: {forecast_results['diagnostics']['mae']:.2f}")
        print(f"RMSE: {forecast_results['diagnostics']['rmse']:.2f}")

if __name__ == "__main__":
    main() 