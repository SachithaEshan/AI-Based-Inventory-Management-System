import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import io from 'socket.io-client';
import decodeToken from '../utils/decodeToken';
import toastMessage from '../lib/toastMessage';
import { useAppSelector } from '../redux/hooks';
import { getCurrentToken, getCurrentUser } from '../redux/services/authSlice';
import { useGetNotificationsQuery } from '../redux/features/management/notificationApi';

interface NotificationContextType {
  notifications: any[];
  socket: typeof Socket | null;
  refetchNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  socket: null,
  refetchNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const token = useAppSelector(getCurrentToken);
  const user = useAppSelector(getCurrentUser);
  const { data: dbNotifications, refetch: refetchNotifications } = useGetNotificationsQuery(undefined, {
    skip: !token || !user?._id // Skip the query if we don't have auth data
  });

  useEffect(() => {
    if (!token || !user?._id) {
      return;
    }

    console.log('Initializing socket connection for user:', user._id);
    const newSocket = io('http://localhost:8000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket'],
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join', user._id);
      toastMessage({ icon: 'success', text: 'Connected to notification server' });
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      toastMessage({ icon: 'error', text: 'Failed to connect to notification server' });
      setTimeout(() => {
        newSocket.connect();
      }, 5000);
    });

    newSocket.on('disconnect', (reason: string) => {
      console.log('Disconnected from socket server:', reason);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    newSocket.on('lowStockAlert', (data: { message: string; productName: string; timestamp: Date; forecastData?: any }) => {
      console.log('Received low stock alert:', data);
      toastMessage({
        icon: 'warning',
        text: data.message
      });
      refetchNotifications();
    });

    newSocket.on('reorderAlert', (data: { message: string; order: any; timestamp: Date }) => {
      console.log('Received reorder alert:', data);
      toastMessage({
        icon: 'info',
        text: data.message
      });
      refetchNotifications();
    });

    newSocket.on('orderStatusUpdate', (data: { orderId: string; status: string; timestamp: Date }) => {
      console.log('Received order status update:', data);
      toastMessage({
        icon: 'success',
        text: `Order status updated to: ${data.status}`
      });
      refetchNotifications();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id]);

  return (
    <NotificationContext.Provider value={{ 
      notifications: dbNotifications?.data || [], 
      socket,
      refetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}; 