import { RouterProvider } from 'react-router-dom';
import { router } from './routes/routes';
import { ConfigProvider } from 'antd';
import { NotificationProvider } from './context/NotificationContext';
import AnomalyAlertsPage from './pages/AnomalyAlertsPage';
//import PendingOrdersPage from './pages/managements/PendingOrdersPage';

const App = () => {
  return (
    <NotificationProvider>
      <ConfigProvider
        theme={{
          token: {
            fontFamily: 'Nunito',
          },
        }}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </NotificationProvider>
  );
};

export default App;
