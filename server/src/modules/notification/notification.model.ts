import { Schema, model } from 'mongoose';
import { INotification } from './notification.interface';

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['low_stock', 'reorder', 'order_status', 'system'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      productId: String,
      productName: String,
      orderId: String,
      currentStock: Number,
      reorderThreshold: Number,
      forecastedDemand: Number,
      confidence: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Notification = model<INotification>('Notification', notificationSchema); 