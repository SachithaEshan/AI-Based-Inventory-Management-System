import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Typography, Divider, Space, Tag, Card } from 'antd';
import { useGetAllUsersQuery, useCreateAdminMutation, useUpdateUserRoleMutation, useUpdateUserStatusMutation } from '../../redux/features/management/userApi';
import SearchInput from '../../components/SearchInput';
import { UserRole, UserStatus, IUser } from '../../types/user.types';
import { useMediaQuery } from 'react-responsive';

const { Title } = Typography;

const UserManagementPage = () => {
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const { data: apiResponse, isFetching, error } = useGetAllUsersQuery(query);
  const [createAdmin] = useCreateAdminMutation();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const handleCreateAdmin = async (values: any) => {
    try {
      await createAdmin(values).unwrap();
      message.success('Admin user created successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create admin user');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole({ userId, role }).unwrap();
      message.success('User role updated successfully');
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await updateUserStatus({ userId, status }).unwrap();
      message.success('User status updated successfully');
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: isMobile ? 120 : 200,
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: isMobile ? 150 : 250,
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: isMobile ? 120 : 150,
      render: (role: string, record: IUser) => {
        const roleColors: Record<string, string> = {
          ADMIN: 'volcano',
          MANAGER: 'blue',
          SUPPLIER: 'purple',
          USER: 'green',
        };
  
        return (
          <Space direction="vertical" size="small">
            <Tag color={roleColors[role] || 'default'} style={{ textTransform: 'capitalize' }}>
              {role}
            </Tag>
            <Select
              value={role}
              size={isMobile ? "small" : "middle"}
              onChange={(value) => handleRoleChange(record._id, value)}
              options={Object.values(UserRole).map(r => ({ label: r, value: r }))}
              style={{ width: isMobile ? 100 : 120 }}
              dropdownMatchSelectWidth={false}
            />
          </Space>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: isMobile ? 120 : 150,
      render: (status: string, record: IUser) => {
        const statusColors: Record<string, string> = {
          ACTIVE: 'green',
          PENDING: 'gold',
          BLOCK: 'red'
        };
  
        return (
          <Space direction="vertical" size="small">
            <Tag color={statusColors[status] || 'default'} style={{ textTransform: 'capitalize' }}>
              {status}
            </Tag>
            <Select
              value={status}
              size={isMobile ? "small" : "middle"}
              onChange={(value) => handleStatusChange(record._id, value)}
              options={Object.values(UserStatus).map(s => ({ label: s, value: s }))}
              style={{ width: isMobile ? 100 : 120 }}
              dropdownMatchSelectWidth={false}
            />
          </Space>
        );
      }
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: isMobile ? 120 : 150,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const tableData = Array.isArray(apiResponse?.data?.data) ? apiResponse.data.data : [];

  return (
    <div style={{ 
      padding: isMobile ? '1rem' : '2rem', 
      backgroundColor: '#f9f9f9', 
      minHeight: '100vh',
      overflow: 'auto'
    }}>
      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'stretch' : 'center', 
          gap: isMobile ? '1rem' : '0',
          marginBottom: '1rem' 
        }}>
          <Title level={3} style={{ margin: 0 }}>User Management</Title>
          <Button 
            type="primary" 
            onClick={() => setIsModalVisible(true)}
            style={{ width: isMobile ? '100%' : 'auto' }}
          >
            + Create Admin
          </Button>
        </div>

        <div style={{ 
          marginBottom: '1rem', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <SearchInput 
            setQuery={setQuery} 
            placeholder="Search users..." 
            style={{ width: isMobile ? '100%' : '300px' }}
          />
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error loading users</div>}

        <div style={{ overflowX: 'auto' }}>
          <Table<IUser>
            columns={columns}
            dataSource={tableData}
            loading={isFetching}
            rowKey="_id"
            pagination={{
              total: apiResponse?.data?.meta?.total || 0,
              pageSize: query.limit,
              current: query.page,
              onChange: (page) => setQuery(prev => ({ ...prev, page })),
              showSizeChanger: !isMobile,
              showTotal: (total) => `Total ${total} items`,
              size: isMobile ? 'small' : 'default',
            }}
            scroll={{ x: isMobile ? 800 : undefined }}
            size={isMobile ? 'small' : 'middle'}
          />
        </div>
      </Card>

      <Modal
        title="Create Admin User"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 500}
        centered
      >
        <Form form={form} onFinish={handleCreateAdmin} layout="vertical">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input the name!' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input the password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Admin
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
