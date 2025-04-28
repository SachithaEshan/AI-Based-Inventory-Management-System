import { Types } from 'mongoose';
import Product from './product.model';
import { Order } from '../order/order.model';
import Seller from '../seller/seller.model';
import cron from 'node-cron';
import { NotificationService } from '../../services/notification.service';
import { forecastDemand } from './demandForecast.service';

let notificationService: NotificationService;

export const setNotificationService = (service: NotificationService) => {
  notificationService = service;
};

export const checkStockLevels = async (userId: string) => {
  const lowStockProducts = await Product.find({
    user: new Types.ObjectId(userId),
    $expr: { $lt: ['$stock', '$reorder_threshold'] }
  }).populate('seller');

  const reorderRequests = await Promise.all(
    lowStockProducts.map(async (product) => {
      // Check if there's already a pending order for this product
      const existingOrder = await Order.findOne({
        user: userId,
        product: product._id,
        status: 'pending'
      });

      if (existingOrder) {
        console.log(`Pending order already exists for product: ${product.name}`);
        return null;
      }

      // Get demand forecast
      const forecast = await forecastDemand(userId, product._id.toString());
      
      // Calculate suggested reorder quantity based on forecast
      const suggestedReorderQuantity = Math.max(
        product.reorder_threshold! * 2, // Minimum reorder quantity
        forecast.forecastedDemand // Forecasted demand
      );

      // Send low stock alert with forecast information
      await notificationService?.sendLowStockAlert(userId, product.name, {
        currentStock: product.stock,
        reorderThreshold: product.reorder_threshold!,
        forecastedDemand: forecast.forecastedDemand,
        confidence: forecast.confidence
      });

      const seller = await Seller.findById(product.seller);

      const order = await Order.create({
        user: userId,
        seller: product.seller,
        product: product._id,
        sellerName: seller?.name,
        productName: product.name,
        quantity: suggestedReorderQuantity,
        totalPrice: suggestedReorderQuantity * product.price,
        status: 'pending',
        eta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default ETA: 7 days from now
        forecastData: {
          forecastedDemand: forecast.forecastedDemand,
          confidence: forecast.confidence
        }
      });

      // Send reorder alert with forecast information
      await notificationService?.sendReorderAlert(userId, order);

      return {
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        reorderThreshold: product.reorder_threshold,
        reorderQuantity: suggestedReorderQuantity,
        orderId: order._id,
        forecastData: {
          forecastedDemand: forecast.forecastedDemand,
          confidence: forecast.confidence
        }
      };
    })
  );

  return reorderRequests.filter(request => request !== null);
};

//Schedule stock level check every hour
export const scheduleStockCheck = (userId: string) => {
  // Run immediately when initialized
  checkStockLevels(userId).catch(console.error);
  
  // Then schedule regular checks
  cron.schedule('*/5 * * * *', async () => {
    try {
      await checkStockLevels(userId);
    } catch (error) {
      console.error('Error in scheduled stock check:', error);
    }
  });
};

// Schedule stock level check every 10 minutes
// export const scheduleStockCheck = (userId: string) => {
//   cron.schedule('*/10 * * * *', async () => {
//     try {
//       console.log('Running scheduled stock check...');
//       const reorderRequests = await checkStockLevels(userId);
//       if (reorderRequests.length > 0) {
//         console.log('Generated reorder requests:', reorderRequests);
//       }
//     } catch (error) {
//       console.error('Error in scheduled stock check:', error);
//     }
//   });
// };
// export const scheduleStockCheck = (userId: string) => {
//   cron.schedule('*/3 * * * *', async () => {
//     try {
//       console.log('Running scheduled stock check...');
//       const reorderRequests = await checkStockLevels(userId);
//       if (reorderRequests.length > 0) {
//         console.log('Generated reorder requests:', reorderRequests);
//       }
//     } catch (error) {
//       console.error('Error in scheduled stock check:', error);
//     }
//   });
// };