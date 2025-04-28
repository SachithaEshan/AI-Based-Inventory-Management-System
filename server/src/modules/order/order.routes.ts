import express from 'express';
import { getPendingOrders, updateOrderStatus } from './order.controller';
import verifyAuth from '../../middlewares/verifyAuth';

const router = express.Router();

// Get pending orders
router.get('/pending', verifyAuth, getPendingOrders);

// Update order status
router.patch('/:id/status', verifyAuth, updateOrderStatus);

export default router; 