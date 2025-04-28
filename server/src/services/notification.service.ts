import { Server } from 'socket.io';
import { Order } from '../modules/order/order.model';
import { Types } from 'mongoose';
import { Notification } from '../modules/notification/notification.model';

interface ForecastData {
  currentStock: number;
  reorderThreshold: number;
  forecastedDemand: number;
  confidence: number;
}

export class NotificationService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  async sendLowStockAlert(userId: string, productName: string, forecastData?: ForecastData) {
    const message = `Warning: ${productName} is low in stock.${forecastData ? ` Forecasted demand: ${forecastData.forecastedDemand} units (${forecastData.confidence.toFixed(1)}% confidence)` : ''}`;
    
    // Save to database
    await Notification.create({
      user: new Types.ObjectId(userId),
      type: 'low_stock',
      title: 'Low Stock Alert',
      message,
      data: forecastData ? {
        currentStock: forecastData.currentStock,
        reorderThreshold: forecastData.reorderThreshold,
        forecastedDemand: forecastData.forecastedDemand,
        confidence: forecastData.confidence
      } : undefined
    });

    // Send real-time notification
    this.io.to(userId).emit('lowStockAlert', {
      message,
      productName,
      forecastData,
      timestamp: new Date(),
    });
  }

  async sendReorderAlert(userId: string, order: any) {
    const message = `Automated reorder placed for ${order.productName}.${order.forecastData ? ` Based on forecasted demand: ${order.forecastData.forecastedDemand} units` : ''}`;
    
    // Save to database
    await Notification.create({
      user: new Types.ObjectId(userId),
      type: 'reorder',
      title: 'Reorder Alert',
      message,
      data: {
        productId: order.product,
        productName: order.productName,
        orderId: order._id,
        forecastedDemand: order.forecastData?.forecastedDemand,
        confidence: order.forecastData?.confidence
      }
    });

    // Send real-time notification
    this.io.to(userId).emit('reorderAlert', {
      message,
      order,
      timestamp: new Date(),
    });
  }

  async sendOrderStatusUpdate(userId: string, orderId: string, status: string) {
    const order = await Order.findById(orderId);
    if (!order) return;

    const message = `Order status updated: ${order.productName} is now ${status}`;
    
    // Save to database
    await Notification.create({
      user: new Types.ObjectId(userId),
      type: 'order_status',
      title: 'Order Status Update',
      message,
      data: {
        orderId,
        productId: order.product,
        productName: order.productName
      }
    });

    // Send real-time notification
    this.io.to(userId).emit('orderStatusUpdate', {
      orderId,
      status,
      timestamp: new Date(),
    });
  }
} 