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
    forecast: Array<{
        date: string;
        forecasted_quantity: number;
    }>;
    optimal_levels: {
        safety_stock: number;
        reorder_point: number;
        economic_order_quantity: number;
        mean_demand: number;
        std_demand: number;
    };
    pattern_analysis?: {
        basic_stats: {
            total_sales: number;
            mean_daily_sales: number;
            median_daily_sales: number;
            std_daily_sales: number;
            min_daily_sales: number;
            max_daily_sales: number;
            sales_range: number;
        };
        trend_analysis: {
            trend_direction: string;
            trend_strength: number;
        };
        seasonality: {
            daily_patterns: Record<string, number>;
            monthly_patterns: Record<string, number>;
        };
        volatility: {
            coefficient_of_variation: number;
            volatility_level: string;
        };
        growth: {
            growth_rate: number;
            growth_status: string;
        };
        peak_analysis: {
            peak_dates: string[];
            peak_values: number[];
        };
        low_analysis: {
            low_dates: string[];
            low_values: number[];
        };
    };
}

export interface StockOptimizationError {
    error: string;
} 