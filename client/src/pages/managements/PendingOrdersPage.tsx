import { Table, Button, message, Space, Tag } from 'antd';
import { useGetPendingOrdersQuery, useUpdateOrderStatusMutation } from '../../redux/features/management/orderApi';
import { useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';

interface Order {
  _id: string;
  productName: string;
  sellerName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  eta?: string; // Make eta optional
}

const PendingOrdersPage = () => {
  const { data: orders, isLoading } = useGetPendingOrdersQuery(undefined);
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const handleCancelOrder = async (orderId: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: 'cancelled' }).unwrap();
      message.success('Order cancelled successfully');
    } catch (error) {
      message.error('Failed to cancel order');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: 'completed' }).unwrap();
      message.success('Order marked as completed');
    } catch (error) {
      message.error('Failed to complete order');
    }
  };

  const formatEta = (eta: string | undefined) => {
    // Return early if eta is undefined or null
    if (!eta) {
      return <Tag color="default">Not set</Tag>;
    }

    try {
      // Parse the ISO date string
      const etaDate = parseISO(eta);
      
      if (!isValid(etaDate)) {
        console.error('Invalid date:', eta);
        return <Tag color="default">Invalid date</Tag>;
      }

      const now = new Date();
      const daysUntilArrival = Math.ceil((etaDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Format the date in a more readable way
      const formattedDate = format(etaDate, 'MMM dd, yyyy');
      
      return (
        <Tag color={daysUntilArrival <= 3 ? 'green' : daysUntilArrival <= 5 ? 'orange' : 'red'}>
          {formattedDate} ({daysUntilArrival} days)
        </Tag>
      );
    } catch (error) {
      console.error('Error formatting date:', error);
      return <Tag color="default">Invalid date</Tag>;
    }
  };

  const columns = [
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Seller',
      dataIndex: 'sellerName',
      key: 'sellerName',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `$${price}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusColors = {
          pending: 'orange',
          completed: 'green',
          cancelled: 'red'
        };
        return (
          <Tag color={statusColors[status as keyof typeof statusColors]}>
            {status.toUpperCase()}
          </Tag>
        );
      }
    },
    {
      title: 'Estimated Arrival',
      dataIndex: 'eta',
      key: 'eta',
      render: formatEta
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: Order) => (
        <Space>
          <Button 
            type="primary" 
            onClick={() => handleCompleteOrder(record._id)}
            disabled={record.status !== 'pending'}
          >
            Complete Order
          </Button>
          <Button 
            type="primary" 
            danger 
            onClick={() => handleCancelOrder(record._id)}
            disabled={record.status !== 'pending'}
          >
            Cancel Order
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Pending Orders</h1>
      <Table
        columns={columns}
        dataSource={orders?.data}
        loading={isLoading}
        rowKey="_id"
      />
    </div>
  );
};

export default PendingOrdersPage; 