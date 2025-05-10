import { Types } from 'mongoose';
import Sale from '../sale/sale.model';
import Product from './product.model';
import { spawn } from 'child_process';
import path from 'path';

interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number;
  confidence: number;
  method: 'ARIMA' | 'Moving Average';
  forecastDetails?: {
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: boolean;
    forecastPeriod: number;
    historicalAccuracy: number;
  };
}

const runARIMAForecast = async (salesData: { date: Date; quantity: number }[]): Promise<{ 
  forecast: number; 
  confidence: number;
  forecastDetails: {
    trend: 'increasing' | 'decreasing' | 'stable';
    seasonality: boolean;
    forecastPeriod: number;
    historicalAccuracy: number;
  };
}> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '../../../src/forecast/stock_optimization.py');
    console.log(`[ARIMA] Running Python script at: ${scriptPath}`);
    console.log(`[ARIMA] Input data points: ${salesData.length}`);

    const pythonProcess = spawn('python3', [scriptPath, 'forecast', JSON.stringify(salesData)]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[ARIMA] Python stdout: ${output}`);
      result += output;
    });

    pythonProcess.stderr.on('data', (data) => {
      const errorOutput = data.toString();
      console.error(`[ARIMA] Python stderr: ${errorOutput}`);
      error += errorOutput;
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[ARIMA] Python process exited with code ${code}`);
        console.error(`[ARIMA] Error output: ${error}`);
        reject(new Error(`Python process failed: ${error}`));
        return;
      }

      try {
        console.log(`[ARIMA] Raw Python output: ${result}`);
        const parsedResult = JSON.parse(result);
        
        if (!parsedResult.forecast || !Array.isArray(parsedResult.forecast) || parsedResult.forecast.length === 0) {
          throw new Error('Invalid forecast data structure');
        }

        const forecast = parsedResult.forecast[0].forecasted_quantity;
        const confidence = parsedResult.optimal_levels?.mean_demand > 0 
          ? Math.min(100, (parsedResult.optimal_levels.mean_demand / parsedResult.optimal_levels.std_demand) * 100)
          : 50;

        // Analyze trend and seasonality
        const trend = analyzeTrend(salesData);
        const seasonality = detectSeasonality(salesData);
        const historicalAccuracy = calculateHistoricalAccuracy(salesData, parsedResult.forecast);

        console.log(`[ARIMA] Successfully parsed forecast: ${forecast}, confidence: ${confidence}`);
        
        resolve({
          forecast,
          confidence,
          forecastDetails: {
            trend,
            seasonality,
            forecastPeriod: 30, // 30 days forecast
            historicalAccuracy
          }
        });
      } catch (error: any) {
        console.error('[ARIMA] Failed to parse Python output:', error);
        console.error('[ARIMA] Raw output was:', result);
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });
  });
};

// Helper function to analyze trend
const analyzeTrend = (salesData: { date: Date; quantity: number }[]): 'increasing' | 'decreasing' | 'stable' => {
  if (salesData.length < 2) return 'stable';
  
  const firstHalf = salesData.slice(0, Math.floor(salesData.length / 2));
  const secondHalf = salesData.slice(Math.floor(salesData.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, sale) => sum + sale.quantity, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, sale) => sum + sale.quantity, 0) / secondHalf.length;
  
  const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  if (percentChange > 10) return 'increasing';
  if (percentChange < -10) return 'decreasing';
  return 'stable';
};

// Helper function to detect seasonality
const detectSeasonality = (salesData: { date: Date; quantity: number }[]): boolean => {
  if (salesData.length < 14) return false; // Need at least 2 weeks of data
  
  // Group sales by day of week
  const dailyAverages = new Array(7).fill(0);
  const dailyCounts = new Array(7).fill(0);
  
  salesData.forEach(sale => {
    const dayOfWeek = sale.date.getDay();
    dailyAverages[dayOfWeek] += sale.quantity;
    dailyCounts[dayOfWeek]++;
  });
  
  // Calculate average for each day
  for (let i = 0; i < 7; i++) {
    if (dailyCounts[i] > 0) {
      dailyAverages[i] /= dailyCounts[i];
    }
  }
  
  // Calculate variance of daily averages
  const mean = dailyAverages.reduce((sum, val) => sum + val, 0) / 7;
  const variance = dailyAverages.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / 7;
  
  // If variance is high, there's likely seasonality
  return variance > (mean * 0.2); // 20% threshold
};

// Helper function to calculate historical accuracy
const calculateHistoricalAccuracy = (
  historicalData: { date: Date; quantity: number }[],
  forecastData: { date: string; forecasted_quantity: number }[]
): number => {
  if (historicalData.length < 2 || forecastData.length < 2) return 0;
  
  // Use the last few historical points to compare with forecast
  const lastHistoricalPoints = historicalData.slice(-5);
  const firstForecastPoints = forecastData.slice(0, 5);
  
  let totalError = 0;
  let totalActual = 0;
  
  for (let i = 0; i < Math.min(lastHistoricalPoints.length, firstForecastPoints.length); i++) {
    const actual = lastHistoricalPoints[i].quantity;
    const predicted = firstForecastPoints[i].forecasted_quantity;
    totalError += Math.abs(actual - predicted);
    totalActual += actual;
  }
  
  if (totalActual === 0) return 0;
  
  // Calculate accuracy as percentage
  const accuracy = 100 - ((totalError / totalActual) * 100);
  return Math.max(0, Math.min(100, accuracy)); // Ensure between 0 and 100
};

export const forecastDemand = async (userId: string, productId: string): Promise<DemandForecast> => {
  // Get the last 90 days of sales data for better pattern analysis
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const sales = await Sale.find({
    user: new Types.ObjectId(userId),
    product: new Types.ObjectId(productId),
    date: { $gte: ninetyDaysAgo }
  }).sort({ date: 1 });

  // Get product details
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  console.log(`[Demand Forecast] Product: ${product.name}, Sales data points: ${sales.length}`);

  // Prepare data for ARIMA
  const salesData = sales.map(sale => ({
    date: sale.date,
    quantity: sale.quantity
  }));

  // If we have enough data, use ARIMA
  if (salesData.length >= 10) {
    try {
      console.log(`[Demand Forecast] Using ARIMA for ${product.name}`);
      const { forecast, confidence, forecastDetails } = await runARIMAForecast(salesData);
      return {
        productId: product._id.toString(),
        productName: product.name,
        currentStock: product.stock,
        forecastedDemand: Math.ceil(forecast),
        confidence,
        method: 'ARIMA',
        forecastDetails
      };
    } catch (error) {
      console.error(`[Demand Forecast] ARIMA forecast failed for ${product.name}:`, error);
    }
  } else {
    console.log(`[Demand Forecast] Not enough data for ARIMA (${salesData.length} points), using Moving Average for ${product.name}`);
  }

  // Fallback to simple moving average if ARIMA fails or not enough data
  const last7DaysSales = sales.slice(-7);
  const totalSales = last7DaysSales.reduce((sum: number, sale: { quantity: number }) => sum + sale.quantity, 0);
  const averageDailySales = totalSales / 7;
  const forecastedDemand = Math.ceil(averageDailySales * 7);
  const confidence = Math.min(100, (sales.length / 30) * 100);

  return {
    productId: product._id.toString(),
    productName: product.name,
    currentStock: product.stock,
    forecastedDemand,
    confidence,
    method: 'Moving Average'
  };
}; 