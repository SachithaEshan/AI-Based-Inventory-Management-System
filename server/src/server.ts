import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { initializeSocket } from './socket';
import { initializeServer } from './init';
import { NotificationService } from './services/notification.service';
import { setNotificationService } from './modules/product/stockMonitor.service';

const server = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Create and set NotificationService instance
const notificationService = new NotificationService(io);
setNotificationService(notificationService);

// Middleware
app.use(cors());
app.use(express.json());

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('Database connected successfully');

    // Initialize server services
    initializeServer();

    server.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});

export { server, io };
