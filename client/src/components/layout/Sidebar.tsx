import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Layout, Menu, Drawer } from 'antd';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { sidebarItems } from '../../constant/sidebarItems';
import { useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../redux/services/authSlice';
import React from 'react';

const { Content, Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const menuItems = sidebarItems.map(item => ({
    ...item,
    onClick: handleMenuClick
  }));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        style={{
          marginBottom: '2rem',
          textAlign: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? '1.2rem' : '1.8rem',
          transition: 'all 0.3s ease',
          padding: '1rem',
        }}
      >
        {collapsed ? 'WL' : 'WELCOME'}
      </div>

      {/* Menu Items */}
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        defaultOpenKeys={[location.pathname]}
        items={menuItems.map(item => ({
          ...item,
          icon: React.cloneElement(item.icon as React.ReactElement, {
            style: {
              color: location.pathname === item.key ? '#fff' : undefined,
              transition: 'color 0.3s ease'
            }
          })
        }))}
        style={{
          backgroundColor: '#164863',
          fontWeight: 600,
          border: 'none',
        }}
        className="custom-menu"
      />

      {/* Bottom Actions (Collapse + Logout) */}
      <div
        style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginTop: 'auto',
        }}
      >
        {!isMobile && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              color: '#fff',
              fontSize: '1.2rem',
              backgroundColor: 'transparent',
            }}
          >
            {!collapsed && 'Collapse'}
          </Button>
        )}

        <Button
          type="primary"
          danger
          icon={<LogoutOutlined />}
          block
          onClick={handleLogout}
          style={{
            backgroundColor: '#FF4D4F',
            borderColor: '#FF4D4F',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {!collapsed && 'Logout'}
        </Button>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width="240"
        style={{
          backgroundColor: '#164863',
          paddingTop: '1rem',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          display: isMobile ? 'none' : 'block',
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <SidebarContent />
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0, backgroundColor: '#164863' }}
        width={240}
      >
        <SidebarContent />
      </Drawer>

      <Layout style={{ marginLeft: isMobile ? 0 : (collapsed ? 80 : 240) }}>
        {/* Mobile Header */}
        {isMobile && (
          <div
            style={{
              padding: '1rem',
              background: '#164863',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 999,
            }}
          >
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ color: '#fff', fontSize: '1.2rem' }}
            />
            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>
              WELCOME
            </div>
            <div style={{ width: 32 }} /> {/* Spacer for alignment */}
          </div>
        )}

        <Content
          style={{
            padding: isMobile ? '1rem' : '2rem',
            background: '#f0f2f5',
            minHeight: '100vh',
            marginTop: isMobile ? '64px' : 0,
          }}
        >
          <div
            style={{
              padding: isMobile ? '1rem' : '2rem',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: 'calc(100vh - 4rem)',
              overflow: 'auto',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Sidebar;

