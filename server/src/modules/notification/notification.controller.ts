import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { NotificationService } from './notification.service';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user._id);
    res.json({ data: notifications });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.deleteNotification(id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    await NotificationService.markAllAsRead(req.user._id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);
    res.json({ data: { count } });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
}; 