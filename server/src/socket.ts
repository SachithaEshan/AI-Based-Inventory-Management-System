import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import config from './config';
import { NotificationService } from './services/notification.service';

let io: Server;
let notificationService: NotificationService;

export const initializeSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'], 
      credentials: true,
    },
  });

  notificationService = new NotificationService(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    if (!config.jwt_secret) {
      return next(new Error('JWT secret not configured'));
    }
    try {
      const decoded = jwt.verify(token, config.jwt_secret) as unknown as { _id: string };
      socket.data.userId = decoded._id;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join', (userId: string) => {
      console.log('User joining room:', userId);
      socket.join(userId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getNotificationService = () => {
  if (!notificationService) {
    throw new Error('Notification service not initialized');
  }
  return notificationService;
}; 