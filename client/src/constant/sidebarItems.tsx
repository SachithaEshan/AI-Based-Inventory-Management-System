import {
  AimOutlined,
  AntDesignOutlined,
  ApartmentOutlined,
  AreaChartOutlined,
  MoneyCollectFilled,
  ProfileFilled,
  UserOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  BellOutlined,
  WarningOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import React from 'react';
import { NavLink } from 'react-router-dom';

const activeStyle = {
  color: '#1890ff',
  fontWeight: 'bold',
};

export const sidebarItems = [
  {
    key: 'Dashboard',
    label: <NavLink to='/' style={({ isActive }) => isActive ? activeStyle : undefined}>DASHBOARD</NavLink>,
    icon: React.createElement(ProfileFilled),
  },
  {
    key: 'Add Product',
    label: <NavLink to='/create-product' style={({ isActive }) => isActive ? activeStyle : undefined}>ADD PRODUCT</NavLink>,
    icon: React.createElement(AntDesignOutlined),
  },
  {
    key: 'Manage Products',
    label: <NavLink to='/products' style={({ isActive }) => isActive ? activeStyle : undefined}>MANAGE PRODUCTS</NavLink>,
    icon: React.createElement(MoneyCollectFilled),
  },
  {
    key: 'Manage Sales',
    label: <NavLink to='/sales' style={({ isActive }) => isActive ? activeStyle : undefined}>MANAGE SALES</NavLink>,
    icon: React.createElement(AreaChartOutlined),
  },
  {
    key: 'Manage Seller',
    label: <NavLink to='/sellers' style={({ isActive }) => isActive ? activeStyle : undefined}>MANAGE SELLERS</NavLink>,
    icon: React.createElement(ApartmentOutlined),
  },
  {
    key: 'Manage Users',
    label: <NavLink to='/users' style={({ isActive }) => isActive ? activeStyle : undefined}>MANAGE USERS</NavLink>,
    icon: React.createElement(TeamOutlined),
  },
  {
    key: 'Manage Purchase',
    label: <NavLink to='/purchases' style={({ isActive }) => isActive ? activeStyle : undefined}>MANAGE PURCHASES</NavLink>,
    icon: React.createElement(AimOutlined),
  },
  {
    key: 'Pending Orders',
    label: <NavLink to='/pending-orders' style={({ isActive }) => isActive ? activeStyle : undefined}>PENDING ORDERS</NavLink>,
    icon: React.createElement(ShoppingCartOutlined),
  },
  {
    key: 'Notifications',
    label: <NavLink to='/notifications' style={({ isActive }) => isActive ? activeStyle : undefined}>NOTIFICATIONS</NavLink>,
    icon: React.createElement(BellOutlined),
  },
  {
    key: 'Anomaly Detection',
    label: <NavLink to='/anomaly-alerts' style={({ isActive }) => isActive ? activeStyle : undefined}>ANOMALY DETECTION</NavLink>,
    icon: React.createElement(WarningOutlined),
  },
  {
    key: 'Profile',
    label: <NavLink to='/profile' style={({ isActive }) => isActive ? activeStyle : undefined}>PROFILE</NavLink>,
    icon: React.createElement(UserOutlined),
  },
  {
    key: 'Forecast',
    label: <NavLink to='/forecast' style={({ isActive }) => isActive ? activeStyle : undefined}>FORECAST DEMAND</NavLink>,
    icon: React.createElement(LineChartOutlined),
  },
];
