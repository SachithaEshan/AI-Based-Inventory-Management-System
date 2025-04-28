// import {useState} from 'react';
// import {Outlet, useNavigate} from 'react-router-dom';
// import {Button, Layout, Menu} from 'antd';
// import {LogoutOutlined} from '@ant-design/icons';
// import {sidebarItems} from '../../constant/sidebarItems';
// import {useAppDispatch} from '../../redux/hooks';
// import {logoutUser} from '../../redux/services/authSlice';

// const {Content, Sider} = Layout;

// const Sidebar = () => {
//   const [showLogoutBtn, setShowLogoutBtn] = useState(true);
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();

//   const handleClick = () => {
//     dispatch(logoutUser());
//     navigate('/');
//   };

//   return (
//     <Layout style={{height: '100vh'}}>
//       <Sider
//         breakpoint='lg'
//         collapsedWidth='0'
//         onCollapse={(collapsed, type) => {
//           if (type === 'responsive') {
//             setShowLogoutBtn(!collapsed);
//           }
//           if (type === 'clickTrigger') {
//             setShowLogoutBtn(!collapsed);
//           }
//         }}
//         width='220px'
//         style={{
//           backgroundColor: '#164863',
//           position: 'relative',
//         }}
//       >
//         <div className='demo-logo-vertical'>
//           <h1 style={{color: '#fff', padding: '1rem', fontSize: '1.8rem', textAlign: 'center'}}>
//             WELCOME
//           </h1>
//         </div>
//         <Menu
//           theme='dark'
//           mode='inline'
//           style={{backgroundColor: '#164863', fontWeight: '700'}}
//           defaultSelectedKeys={['Dashboard']}
//           items={sidebarItems}
//         />
//         {showLogoutBtn && (
//           <div
//             style={{
//               margin: 'auto',
//               position: 'absolute',
//               bottom: 0,
//               padding: '1rem',
//               display: 'flex',
//               width: '100%',
//               justifyContent: 'center',
//             }}
//           >
//             <Button
//               type='primary'
//               style={{
//                 width: '100%',
//                 backgroundColor: 'cyan',
//                 color: '#000',
//                 fontWeight: 600,
//                 textTransform: 'uppercase',
//               }}
//               onClick={handleClick}
//             >
//               <LogoutOutlined />
//               Logout
//             </Button>
//           </div>
//         )}
//       </Sider>
//       <Layout>
//         <Content style={{padding: '2rem', background: '#BBE1FA'}}>
//           <div
//             style={{
//               padding: '1rem',
//               maxHeight: 'calc(100vh - 4rem)',
//               minHeight: 'calc(100vh - 4rem)',
//               background: '#fff',
//               borderRadius: '1rem',
//               overflow: 'auto',
//             }}
//           >
//             <Outlet />
//           </div>
//         </Content>
//       </Layout>
//     </Layout>
//   );
// };

// export default Sidebar;

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Layout, Menu } from 'antd';
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { sidebarItems } from '../../constant/sidebarItems';
import { useAppDispatch } from '../../redux/hooks';
import { logoutUser } from '../../redux/services/authSlice';

const { Content, Sider } = Layout;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null} // Disable default trigger
        width="240"
        style={{
          backgroundColor: '#164863',
          paddingTop: '1rem',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            marginBottom: '2rem',
            textAlign: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: collapsed ? '1.2rem' : '1.8rem',
            transition: 'all 0.3s ease',
          }}
        >
          {collapsed ? 'WL' : 'WELCOME'}
        </div>

        {/* Menu Items */}
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['Dashboard']}
          items={sidebarItems}
          style={{
            backgroundColor: '#164863',
            fontWeight: 600,
            border: 'none',
          }}
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
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content
          style={{
            padding: '2rem',
            backgroundColor: '#E8F0FE',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '2rem',
              minHeight: 'calc(100vh - 4rem)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              overflowY: 'auto',
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

