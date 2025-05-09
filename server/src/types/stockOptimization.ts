export interface StockOptimizationForecast {
    date: string;
    forecasted_quantity: number;
}

export interface OptimalLevels {
    safety_stock: number;
    reorder_point: number;
    economic_order_quantity: number;
    mean_demand: number;
    std_demand: number;
}

export interface StockOptimizationResult {
    forecast: StockOptimizationForecast[];
    optimal_levels: OptimalLevels;
}

export interface StockOptimizationError {
    error: string;
} 