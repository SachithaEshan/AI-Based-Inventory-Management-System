// import { Order } from '../order/order.model';
// import Product from '../product/product.model';
// import { AnomalyAlert } from './anomalyAlert.model';
// import { IOrder } from '../order/order.interface';
// import { IProduct } from '../product/product.interface';

// // Utility functions for statistical calculations
// const calculateMean = (numbers: number[]): number => {
//   return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
// };

// const calculateStd = (numbers: number[]): number => {
//   const mean = calculateMean(numbers);
//   const squareDiffs = numbers.map(num => Math.pow(num - mean, 2));
//   return Math.sqrt(calculateMean(squareDiffs));
// };

// export class AnomalyDetectionService {
//   private static instance: AnomalyDetectionService;

//   private constructor() {}

//   public static getInstance(): AnomalyDetectionService {
//     if (!AnomalyDetectionService.instance) {
//       AnomalyDetectionService.instance = new AnomalyDetectionService();
//     }
//     return AnomalyDetectionService.instance;
//   }

//   private calculateSeverity(zScore: number): 'Low' | 'Medium' | 'High' {
//     if (Math.abs(zScore) > 3) return 'High';
//     if (Math.abs(zScore) > 2) return 'Medium';
//     return 'Low';
//   }

//   private async checkExistingAlert(productId: string, type: string): Promise<boolean> {
//     const existingAlert = await AnomalyAlert.findOne({
//       productId,
//       type,
//       timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24 hours
//     });
//     return !!existingAlert;
//   }

//   private async detectDemandAnomalies(): Promise<void> {
//     // Get historical order data
//     const orders = await Order.find()
//       .sort({ createdAt: -1 })
//       .limit(1000)
//       .populate('product');

//     // Group orders by product and calculate daily demand
//     const productDemand = new Map<string, number[]>();
//     orders.forEach((order: IOrder) => {
//       const productId = order.product.toString();
//       if (!productDemand.has(productId)) {
//         productDemand.set(productId, []);
//       }
//       productDemand.get(productId)?.push(order.quantity);
//     });

//     // Detect anomalies for each product
//     for (const [productId, demands] of productDemand) {
//       if (demands.length < 10) continue; // Skip products with insufficient data

//       const mean = calculateMean(demands);
//       const std = calculateStd(demands);
//       const latestDemand = demands[demands.length - 1];
//       const zScore = (latestDemand - mean) / std;

//       if (Math.abs(zScore) > 2) { // Anomaly threshold
//         // Check if there's already an alert for this product in the last 24 hours
//         const hasExistingAlert = await this.checkExistingAlert(productId, 'Abnormal Demand');
//         if (hasExistingAlert) continue;

//         const severity = this.calculateSeverity(zScore);

//         await AnomalyAlert.create({
//           type: 'Abnormal Demand',
//           productId,
//           description: `Unusual demand spike detected with z-score ${zScore.toFixed(2)}`,
//           severity,
//           value: latestDemand,
//           threshold: mean + 2 * std
//         });
//       }
//     }
//   }

//   private async detectStockAnomalies(): Promise<void> {
//     const products = await Product.find();
    
//     for (const product of products) {
//       const stock = product.stock;
//       if (typeof stock !== 'number') continue;

//       const reorderThreshold = product.reorder_threshold || 10;
//       if (stock < reorderThreshold) {
//         // Check if there's already an alert for this product in the last 24 hours
//         const hasExistingAlert = await this.checkExistingAlert(product._id.toString(), 'Unusual Stock Drop');
//         if (hasExistingAlert) continue;

//         const severity = this.calculateSeverity((reorderThreshold - stock) / reorderThreshold);

//         await AnomalyAlert.create({
//           type: 'Unusual Stock Drop',
//           productId: product._id.toString(),
//           description: `Stock level below reorder threshold`,
//           severity,
//           value: stock,
//           threshold: reorderThreshold
//         });
//       }
//     }
//   }

//   public async detectAnomalies(): Promise<void> {
//     // Clear old alerts (older than 7 days)
//     await AnomalyAlert.deleteMany({
//       timestamp: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
//     });

//     await this.detectDemandAnomalies();
//     await this.detectStockAnomalies();
//   }
// } 

// server/src/modules/anomaly/anomalyDetection.service.ts// server/src/modules/anomaly/anomalyDetection.service.ts
import { spawn } from 'child_process';
import path from 'path';
import { AnomalyAlert } from './anomalyAlert.model';
import Sale from '../sale/sale.model';
import Product from '../product/product.model';
import { Types } from 'mongoose';

// Ensure Product model is registered
require('../product/product.model');

interface ProductSales {
  productName: string;
  sales: Array<{
    date: Date;
    quantity: number;
  }>;
}

interface SalesByProduct {
  [key: string]: ProductSales;
}

export class AnomalyDetectionService {
  private static instance: AnomalyDetectionService;
  
  private constructor() {}
  
  static getInstance(): AnomalyDetectionService {
    if (!AnomalyDetectionService.instance) {
      AnomalyDetectionService.instance = new AnomalyDetectionService();
    }
    return AnomalyDetectionService.instance;
  }
  
  async detectAnomalies(): Promise<void> {
    try {
      // Get sales data with product information
      const sales = await Sale.find()
        .sort({ date: 1 })
        .populate({
          path: 'product',
          model: 'Product',
          select: 'name _id'
        })
        .select('date quantity product')
        .lean();
      
      console.log('Retrieved sales data:', sales);
      
      if (!sales || sales.length < 10) {
        throw new Error('Insufficient sales data for anomaly detection');
      }
      
      // Group sales by product, filtering out sales with null products
      const salesByProduct = sales.reduce<SalesByProduct>((acc, sale) => {
        // Skip sales with null products
        if (!sale.product) {
          console.log('Skipping sale with null product:', sale);
          return acc;
        }

        const productId = sale.product._id.toString();
        if (!acc[productId]) {
          acc[productId] = {
            productName: (sale.product as any).name,
            sales: []
          };
        }
        acc[productId].sales.push({
          date: sale.date,
          quantity: sale.quantity
        });
        return acc;
      }, {});
      
      // Clear old alerts
      await AnomalyAlert.deleteMany({
        timestamp: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      // Detect anomalies for each product
      for (const [productId, data] of Object.entries(salesByProduct)) {
        if (data.sales.length < 10) {
          console.log(`Skipping product ${data.productName} due to insufficient data (${data.sales.length} records)`);
          continue;
        }
        
        // Run ARIMA anomaly detection for this product
        const anomalies = await this.runARIMADetection(data.sales);
        console.log(`Anomaly detection results for product ${data.productName}:`, anomalies);
        
        if (anomalies && anomalies.anomalies && anomalies.anomalies.length > 0) {
          for (const anomaly of anomalies.anomalies) {
            await AnomalyAlert.create({
              type: 'ARIMA Anomaly',
              productId: productId,
              description: `Sales anomaly detected for ${data.productName} (actual: ${anomaly.actual_value.toFixed(2)}, predicted: ${anomaly.predicted_value.toFixed(2)})`,
              severity: anomaly.severity,
              value: anomaly.actual_value,
              threshold: anomalies.threshold,
              timestamp: new Date(anomaly.date)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
      throw error;
    }
  }
  
  private runARIMADetection(salesData: Array<{ date: Date; quantity: number }>): Promise<any> {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, 'arima_anomaly_detector.py');
      console.log('Running Python script at:', scriptPath);
      
      const process = spawn('python3', [scriptPath]);
      
      let output = '';
      let error = '';
      
      // Send data to Python script
      process.stdin.write(JSON.stringify(salesData));
      process.stdin.end();
      
      process.stdout.on('data', (data) => {
        output += data.toString();
        console.log('Python script output:', data.toString());
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
        console.error('Python script error:', data.toString());
      });
      
      process.on('close', (code) => {
        if (code !== 0) {
          console.error('Python script failed with code:', code);
          console.error('Error output:', error);
          reject(new Error(`Script failed with code ${code}: ${error}`));
        } else {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            console.error('Failed to parse Python output:', output);
            reject(new Error('Failed to parse anomaly detection results'));
          }
        }
      });
    });
  }
}