import { List, Button, Badge, Popconfirm, message, Space, Tag } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { useGetNotificationsQuery, useDeleteNotificationMutation, useMarkAsReadMutation, useMarkAllAsReadMutation } from '../../redux/features/management/notificationApi';

interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'low_stock' | 'reorder' | 'order_status' | 'system';
  data?: {
    productId?: string;
    productName?: string;
    orderId?: string;
    currentStock?: number;
    reorderThreshold?: number;
    forecastedDemand?: number;
    confidence?: number;
  };
}

const NotificationList = () => {
  const { data: notifications, isLoading } = useGetNotificationsQuery(undefined);
  const [deleteNotification] = useDeleteNotificationMutation();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      message.success('Notification deleted successfully');
    } catch (error) {
      message.error('Failed to delete notification');
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      message.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(undefined).unwrap();
      message.success('All notifications marked as read');
    } catch (error) {
      message.error('Failed to mark all notifications as read');
    }
  };

  const getNotificationType = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <Tag color="warning">Low Stock</Tag>;
      case 'reorder':
        return <Tag color="processing">Reorder</Tag>;
      case 'order_status':
        return <Tag color="success">Status Update</Tag>;
      default:
        return <Tag>System</Tag>;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button 
          type="primary" 
          icon={<CheckOutlined />}
          onClick={handleMarkAllAsRead}
          disabled={!notifications?.data?.some((n: Notification) => !n.read)}
        >
          Mark All as Read
        </Button>
      </div>
      
      <List
        loading={isLoading}
        itemLayout="horizontal"
        dataSource={notifications?.data}
        renderItem={(notification: Notification) => (
          <List.Item
            actions={[
              <Button 
                type="text" 
                onClick={() => handleMarkAsRead(notification._id)}
                disabled={notification.read}
              >
                Mark as Read
              </Button>,
              <Popconfirm
                title="Are you sure you want to delete this notification?"
                onConfirm={() => handleDelete(notification._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <span>{notification.title}</span>
                  {!notification.read && <Badge status="processing" />}
                  {getNotificationType(notification.type)}
                </Space>
              }
              description={
                <div>
                  <p>{notification.message}</p>
                  {notification.data?.forecastedDemand && (
                    <div>
                      <p>Forecasted Demand: {notification.data.forecastedDemand} units</p>
                      <p>Confidence: {notification.data.confidence?.toFixed(1)}%</p>
                    </div>
                  )}
                  <small style={{ color: 'gray' }}>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </small>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default NotificationList; 