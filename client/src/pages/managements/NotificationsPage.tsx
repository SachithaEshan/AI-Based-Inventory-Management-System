import { Table, Tag, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import { useDeleteNotificationMutation } from '../../redux/features/management/notificationApi';

interface Notification {
  _id: string;
  title: string;
  message: string;
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
  createdAt: string;
  read: boolean;
}

const NotificationsPage = () => {
  const { notifications, refetchNotifications } = useNotifications();
  const [deleteNotification] = useDeleteNotificationMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      message.success('Notification deleted successfully');
      refetchNotifications();
    } catch (error) {
      message.error('Failed to delete notification');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Type',
      key: 'type',
      render: (_: any, record: Notification) => {
        switch (record.type) {
          case 'low_stock':
            return <Tag color="warning">Low Stock</Tag>;
          case 'reorder':
            return <Tag color="processing">Reorder</Tag>;
          case 'order_status':
            return <Tag color="success">Status Update</Tag>;
          default:
            return <Tag>System</Tag>;
        }
      },
    },
    {
      title: 'Forecast Data',
      key: 'forecast',
      render: (_: any, record: Notification) => {
        if (record.data?.forecastedDemand) {
          return (
            <div>
              <div>Forecasted Demand: {record.data.forecastedDemand} units</div>
              {record.data.confidence && (
                <div>Confidence: {record.data.confidence.toFixed(1)}%</div>
              )}
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) => {
        try {
          const date = new Date(createdAt);
          if (isNaN(date.getTime())) {
            return 'Invalid Date';
          }
          return format(date, 'PPpp');
        } catch (error) {
          return 'Invalid Date';
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Notification) => (
        <Popconfirm
          title="Are you sure you want to delete this notification?"
          onConfirm={() => handleDelete(record._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Notifications</h1>
      <Table
        columns={columns}
        dataSource={notifications}
        rowKey={(record) => record._id || Math.random().toString()}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default NotificationsPage; 