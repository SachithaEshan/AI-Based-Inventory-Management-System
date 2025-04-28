import { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending',
    },
    eta: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Order = model<IOrder>('Order', orderSchema); 