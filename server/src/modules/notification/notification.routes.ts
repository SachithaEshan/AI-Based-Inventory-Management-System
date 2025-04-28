import express from 'express';
import verifyAuth from '../../middlewares/verifyAuth';
import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
  getUnreadCount,
} from './notification.controller';

const router = express.Router();

router.use(verifyAuth);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.patch('/mark-all-read', markAllAsRead);

export default router; 