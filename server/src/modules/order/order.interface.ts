import { Document, Types } from 'mongoose';

export interface IOrder extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  seller: Types.ObjectId;
  productName: string;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  eta: Date;
  createdAt: Date;
  updatedAt: Date;
} 