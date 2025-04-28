import { Types } from 'mongoose';

export interface INotification {
  user: Types.ObjectId;
  type: 'low_stock' | 'reorder' | 'order_status' | 'system';
  title: string;
  message: string;
  read: boolean;
  data?: {
    productId?: string;
    productName?: string;
    orderId?: string;
    currentStock?: number;
    reorderThreshold?: number;
    forecastedDemand?: number;
    confidence?: number;
  };
} 