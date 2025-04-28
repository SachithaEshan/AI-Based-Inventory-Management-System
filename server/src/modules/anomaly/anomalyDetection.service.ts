import { Order } from '../order/order.model';
import Product from '../product/product.model';
import { AnomalyAlert } from './anomalyAlert.model';
import { IOrder } from '../order/order.interface';
import { IProduct } from '../product/product.interface';

// Utility functions for statistical calculations
const calculateMean = (numbers: number[]): number => {
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const calculateStd = (numbers: number[]): number => {
  const mean = calculateMean(numbers);
  const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return Math.sqrt(calculateMean(squareDiffs));
};

export class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;

  private constructor() {}

  public static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }

  private calculateSeverity(zScore: number): 'Low' | 'Medium' | 'High' {
    if (Math.abs(zScore) > 3) return 'High';
    if (Math.abs(zScore) > 2) return 'Medium';
    return 'Low';
  }

  private async checkExistingAlert(productId: string, type: string): Promise<boolean> {
    const existingAlert = await AnomalyAlert.findOne({
      productId,
      type,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
    });
    return !!existingAlert;
  }

  private async detectDemandAnomalies(): Promise<void> {
    // Get historical order data
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(1000)
      .populate('product');

    // Group orders by product and calculate daily demand
    const productDemand = new Map<string, number[]>();
    orders.forEach((order: IOrder) => {
      const productId = order.product.toString();
      if (!productDemand.has(productId)) {
        productDemand.set(productId, []);
      }
      productDemand.get(productId)?.push(order.quantity);
    });

    // Detect anomalies for each product
    for (const [productId, demands] of productDemand) {
      if (demands.length < 10) continue; // Skip products with insufficient data

      const mean = calculateMean(demands);
      const std = calculateStd(demands);
      const latestDemand = demands[demands.length - 1];
      const zScore = (latestDemand - mean) / std;

      if (Math.abs(zScore) > 2) { // Anomaly threshold
        // Check if there's already an alert for this product in the last 24 hours
        const hasExistingAlert = await this.checkExistingAlert(productId, 'Abnormal Demand');
        if (hasExistingAlert) continue;

        const severity = this.calculateSeverity(zScore);

        await AnomalyAlert.create({
          type: 'Abnormal Demand',
          productId,
          description: `Unusual demand spike detected with z-score ${zScore.toFixed(2)}`,
          severity,
          value: latestDemand,
          threshold: mean + 2 * std
        });
      }
    }
  }

  private async detectStockAnomalies(): Promise<void> {
    const products = await Product.find();
    
    for (const product of products) {
      const stock = product.stock;
      if (typeof stock !== 'number') continue;

      const reorderThreshold = product.reorder_threshold || 10;
      if (stock < reorderThreshold) {
        // Check if there's already an alert for this product in the last 24 hours
        const hasExistingAlert = await this.checkExistingAlert(product._id.toString(), 'Unusual Stock Drop');
        if (hasExistingAlert) continue;

        const severity = this.calculateSeverity((reorderThreshold - stock) / reorderThreshold);

        await AnomalyAlert.create({
          type: 'Unusual Stock Drop',
          productId: product._id.toString(),
          description: `Stock level below reorder threshold`,
          severity,
          value: stock,
          threshold: reorderThreshold
        });
      }
    }
  }

  public async detectAnomalies(): Promise<void> {
    // Clear old alerts (older than 7 days)
    await AnomalyAlert.deleteMany({
      timestamp: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    await this.detectDemandAnomalies();
    await this.detectStockAnomalies();
  }
} 