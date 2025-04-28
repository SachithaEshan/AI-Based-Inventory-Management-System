import mongoose, { Document, Schema } from 'mongoose';

export interface IAnomalyAlert extends Document {
  type: string;
  productId: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  timestamp: Date;
  value: number;
  threshold: number;
}

const anomalyAlertSchema = new Schema<IAnomalyAlert>({
  type: {
    type: String,
    required: true,
    enum: ['Abnormal Demand', 'Unusual Stock Drop']
  },
  productId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  value: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  }
});

export const AnomalyAlert = mongoose.model<IAnomalyAlert>('AnomalyAlert', anomalyAlertSchema); 