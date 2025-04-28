import { Types } from 'mongoose';
import Sale from '../sale/sale.model';
import Product from './product.model';

interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number;
  confidence: number;
}

export const forecastDemand = async (userId: string, productId: string): Promise<DemandForecast> => {
  // Get the last 30 days of sales data for the product
  //const thirtyDaysAgo = new Date();
  //thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  //Get the 5 days of sales data for the product for test
  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const sales = await Sale.find({
    user: new Types.ObjectId(userId),
    product: new Types.ObjectId(productId),
    //createdAt: { $gte: thirtyDaysAgo }    
    createdAt: { $gte: fiveDaysAgo }
  }).sort({ createdAt: 1 });

  // Get product details
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Simple moving average for the last 7 days
  const last7DaysSales = sales.slice(-7);
  const totalSales = last7DaysSales.reduce((sum: number, sale: { quantity: number }) => sum + sale.quantity, 0);
  const averageDailySales = totalSales / 7;

  // Forecast for next 7 days
  const forecastedDemand = Math.ceil(averageDailySales * 7);

  // Calculate confidence based on data points
  const confidence = Math.min(100, (sales.length / 30) * 100);

  return {
    productId: product._id.toString(),
    productName: product.name,
    currentStock: product.stock,
    forecastedDemand,
    confidence
  };
}; 