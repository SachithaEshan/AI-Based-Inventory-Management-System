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
}

const runARIMAForecast = async (salesData: { date: Date; quantity: number }[]): Promise<{ forecast: number; confidence: number }> => {
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

        console.log(`[ARIMA] Successfully parsed forecast: ${forecast}, confidence: ${confidence}`);
        
        resolve({
          forecast,
          confidence
        });
      } catch (error: any) {
        console.error('[ARIMA] Failed to parse Python output:', error);
        console.error('[ARIMA] Raw output was:', result);
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });
  });
};

export const forecastDemand = async (userId: string, productId: string): Promise<DemandForecast> => {
  // Get the last 30 days of sales data for the product
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const sales = await Sale.find({
    user: new Types.ObjectId(userId),
    product: new Types.ObjectId(productId),
    date: { $gte: thirtyDaysAgo }
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
      const { forecast, confidence } = await runARIMAForecast(salesData);
      return {
        productId: product._id.toString(),
        productName: product.name,
        currentStock: product.stock,
        forecastedDemand: Math.ceil(forecast),
        confidence,
        method: 'ARIMA'
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