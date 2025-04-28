import { scheduleStockCheck } from './modules/product/stockMonitor.service';
import { Types } from 'mongoose';

export const initializeServer = () => {
  // Stock monitoring will be initialized per user when they log in
  console.log('Stock monitoring service ready to be initialized per user');
}; 