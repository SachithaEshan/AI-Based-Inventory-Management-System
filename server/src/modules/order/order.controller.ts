import { Request, Response } from 'express';
import { Order } from './order.model';
import { Types } from 'mongoose';
import Product from '../product/product.model';
import Purchase from '../purchase/purchase.model';
import { NotificationService } from '../../services/notification.service';
import { IOrder } from './order.interface';

let notificationService: NotificationService;

export const setNotificationService = (service: NotificationService) => {
  notificationService = service;
};

export const getPendingOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find({
      user: new Types.ObjectId(req.user._id),
      status: 'pending',
    }).sort({ createdAt: -1 });

    res.json({ data: orders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const session = await Order.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOne({
      _id: id,
      user: new Types.ObjectId(req.user._id),
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status
    order.status = status;
    await order.save({ session });

    // If order is being completed, update stock and create purchase record
    if (status === 'completed') {
      // Update product stock
      const product = await Product.findByIdAndUpdate(
        order.product,
        { $inc: { stock: order.quantity } },
        { new: true, session }
      );

      if (!product) {
        await session.abortTransaction();
        return res.status(404).json({ error: 'Product not found' });
      }

      // Create purchase record
      await Purchase.create([{
        user: order.user,
        seller: order.seller,
        product: order.product,
        sellerName: order.sellerName,
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: order.totalPrice / order.quantity,
        totalPrice: order.totalPrice,
        status: 'completed'
      }], { session });
    }

    await session.commitTransaction();

    // Send notification about order status update
    if (notificationService) {
      const orderId = (order._id as Types.ObjectId).toString();
      await notificationService.sendOrderStatusUpdate(req.user._id, orderId, status);
    }

    res.json({ data: order });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    await session.endSession();
  }
}; 