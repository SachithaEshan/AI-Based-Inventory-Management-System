import { Types } from 'mongoose';
import { Notification } from './notification.model';
import { INotification } from './notification.interface';

export class NotificationService {
  static async createNotification(notification: Omit<INotification, 'read'>) {
    return await Notification.create(notification);
  }

  static async getNotifications(userId: string, limit = 50) {
    return await Notification.find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, user: new Types.ObjectId(userId) },
      { read: true },
      { new: true }
    );
  }

  static async deleteNotification(notificationId: string, userId: string) {
    return await Notification.findOneAndDelete({
      _id: notificationId,
      user: new Types.ObjectId(userId),
    });
  }

  static async markAllAsRead(userId: string) {
    return await Notification.updateMany(
      { user: new Types.ObjectId(userId), read: false },
      { read: true }
    );
  }

  static async getUnreadCount(userId: string) {
    return await Notification.countDocuments({
      user: new Types.ObjectId(userId),
      read: false,
    });
  }
} 