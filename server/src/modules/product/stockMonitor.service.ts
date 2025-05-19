import { Types } from 'mongoose';
import Product from './product.model';
import { Order } from '../order/order.model';
import Seller from '../seller/seller.model';
import cron from 'node-cron';
import { NotificationService } from '../../services/notification.service';
import { forecastDemand } from './demandForecast.service';

let notificationService: NotificationService;
let isCheckRunning = false;

export const setNotificationService = (service: NotificationService) => {
  notificationService = service;
};

export const checkStockLevels = async (userId: string) => {
  if (isCheckRunning) {
    console.log('[Stock Check] Previous check still running, skipping...');
    return [];
  }
//Find Products Below Threshold
  isCheckRunning = true;
  console.log('[Stock Check] Starting stock level check...');

  try {
    const lowStockProducts = await Product.find({
      user: new Types.ObjectId(userId),
      $expr: { $lt: ['$stock', '$reorder_threshold'] }
    }).populate('seller');

    console.log(`[Stock Check] Found ${lowStockProducts.length} products with low stock`);

    const reorderRequests = await Promise.all(
      lowStockProducts.map(async (product) => {
        try {
          // Check if there's already a pending order for this product
          const existingOrder = await Order.findOne({
            user: userId,
            product: product._id,
            status: 'pending'
          });

          if (existingOrder) {
            console.log(`[Stock Check] Pending order already exists for product: ${product.name}`);
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
          if (notificationService) {
            try {
              await notificationService.sendLowStockAlert(userId, product.name, {
                currentStock: product.stock,
                reorderThreshold: product.reorder_threshold!,
                forecastedDemand: forecast.forecastedDemand,
                confidence: forecast.confidence
              });
            } catch (error) {
              console.error(`[Stock Check] Failed to send low stock alert for ${product.name}:`, error);
            }
          }

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
          if (notificationService) {
            try {
              await notificationService.sendReorderAlert(userId, order);
            } catch (error) {
              console.error(`[Stock Check] Failed to send reorder alert for ${product.name}:`, error);
            }
          }

          console.log(`[Stock Check] Created reorder request for ${product.name}: ${suggestedReorderQuantity} units`);

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
        } catch (error) {
          console.error(`[Stock Check] Error processing product ${product.name}:`, error);
          return null;
        }
      })
    );

    const validRequests = reorderRequests.filter(request => request !== null);
    console.log(`[Stock Check] Completed with ${validRequests.length} reorder requests`);
    return validRequests;
  } catch (error) {
    console.error('[Stock Check] Error in stock level check:', error);
    return [];
  } finally {
    isCheckRunning = false;
  }
};

export const scheduleStockCheck = (userId: string) => {
  // Run immediately when initialized
  checkStockLevels(userId).catch(error => {
    console.error('[Stock Check] Error in initial stock check:', error);
  });
  
  //Schedule regular checks every 15 minutes
  const job = cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('[Stock Check] Running scheduled check...');
      const reorderRequests = await checkStockLevels(userId);
      if (reorderRequests.length > 0) {
        console.log('[Stock Check] Generated reorder requests:', reorderRequests);
      }
    } catch (error) {
      console.error('[Stock Check] Error in scheduled stock check:', error);
    }
  });

  // Schedule regular checks every 2 minutes
  // const job = cron.schedule('*/2 * * * *', async () => {
  //   try {
  //     console.log('[Stock Check] Running scheduled check...');
  //     const reorderRequests = await checkStockLevels(userId);
  //     if (reorderRequests.length > 0) {
  //       console.log('[Stock Check] Generated reorder requests:', reorderRequests);
  //     }
  //   } catch (error) {
  //     console.error('[Stock Check] Error in scheduled stock check:', error);
  //   }
  // });

  // Handle process termination
  process.on('SIGTERM', () => {
    console.log('[Stock Check] Stopping stock check scheduler...');
    job.stop();
  });

  process.on('SIGINT', () => {
    console.log('[Stock Check] Stopping stock check scheduler...');
    job.stop();
  });

  return job;
};