// import { Col, Row, Spin } from 'antd';
// import MonthlyChart from '../components/Charts/MonthlyChart';
// import Loader from '../components/Loader';
// import { useCountProductsQuery } from '../redux/features/management/productApi';
// import { useYearlySaleQuery } from '../redux/features/management/saleApi';
// import DailyChart from '../components/Charts/DailyChart';

// const Dashboard = () => {
//   const { data: products, isLoading: isLoadingProducts } = useCountProductsQuery(undefined);
//   const { data: yearlyData, isLoading: isLoadingSales } = useYearlySaleQuery(undefined);

//   const isLoading = isLoadingProducts || isLoadingSales;

//   const totalStock = products?.data?.totalQuantity || 0;
//   const totalProducts = products?.data?.totalProducts || 0;
  
//   const totalSales = yearlyData?.data?.reduce(
//     (acc: number, cur: { totalQuantity: number }) => acc + (cur.totalQuantity || 0),
//     0
//   ) || 0;

//   const totalRevenue = yearlyData?.data?.reduce(
//     (acc: number, cur: { totalRevenue: number }) => acc + (cur.totalRevenue || 0),
//     0
//   ) || 0;

//   if (isLoading) return <Loader />;

//   return (
//     <>
//       <Row style={{ paddingRight: '1rem' }}>
//         <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
//           <div className='number-card'>
//             <h3>Total Products</h3>
//             <h1>{totalProducts}</h1>
//             <h3>Total Stock</h3>
//             <h1>{totalStock}</h1>
//           </div>
//         </Col>
//         <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
//           <div className='number-card'>
//             <h3>Total Items Sold</h3>
//             <h1>{totalSales}</h1>
//           </div>
//         </Col>
//         <Col xs={{ span: 24 }} lg={{ span: 8 }} style={{ padding: '.5rem' }}>
//           <div className='number-card'>
//             <h3>Total Revenue</h3>
//             <h1>${totalRevenue.toFixed(2)}</h1>
//           </div>
//         </Col>
//       </Row>
//       <div
//         style={{
//           border: '1px solid gray',
//           margin: '1rem',
//           padding: '1rem',
//           borderRadius: '10px',
//         }}
//       >
//         <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Daily Sale and Revenue</h1>
//         <DailyChart />
//       </div>
//       <div
//         style={{
//           border: '1px solid gray',
//           margin: '1rem',
//           padding: '1rem',
//           borderRadius: '10px',
//         }}
//       >
//         <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Monthly Revenue</h1>
//         <MonthlyChart />
//       </div>
//     </>
//   );
// };

// export default Dashboard;

import { Col, Row } from 'antd';
import MonthlyChart from '../components/Charts/MonthlyChart';
import Loader from '../components/Loader';
import { useCountProductsQuery } from '../redux/features/management/productApi';
import { useYearlySaleQuery } from '../redux/features/management/saleApi';
import DailyChart from '../components/Charts/DailyChart';

const Dashboard = () => {
  const { data: products, isLoading: isLoadingProducts } = useCountProductsQuery(undefined);
  const { data: yearlyData, isLoading: isLoadingSales } = useYearlySaleQuery(undefined);

  const isLoading = isLoadingProducts || isLoadingSales;

  const totalStock = products?.data?.totalQuantity || 0;
  const totalProducts = products?.data?.totalProducts || 0;
  
  const totalSales = yearlyData?.data?.reduce(
    (acc: number, cur: { totalQuantity: number }) => acc + (cur.totalQuantity || 0),
    0
  ) || 0;

  const totalRevenue = yearlyData?.data?.reduce(
    (acc: number, cur: { totalRevenue: number }) => acc + (cur.totalRevenue || 0),
    0
  ) || 0;

  if (isLoading) return <Loader />;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* Top Metrics */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <div style={cardStyle}>
            <h3 style={cardTitle}>Total Products</h3>
            <p style={cardValue}>{totalProducts}</p>
            <h3 style={cardTitle}>Total Stock</h3>
            <p style={cardValue}>{totalStock}</p>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={cardStyle}>
            <h3 style={cardTitle}>Total Items Sold</h3>
            <p style={cardValue}>{totalSales}</p>
          </div>
        </Col>
        <Col xs={24} lg={8}>
          <div style={cardStyle}>
            <h3 style={cardTitle}>Total Revenue</h3>
            <p style={{ ...cardValue, color: '#28a745' }}>${totalRevenue.toFixed(2)}</p>
          </div>
        </Col>
      </Row>

      {/* Charts */}
      <div style={sectionTitleWrapper}>
        <h2 style={sectionTitle}>📈 Daily Sale and Revenue</h2>
      </div>
      <div style={chartCard}>
        <DailyChart />
      </div>

      <div style={sectionTitleWrapper}>
        <h2 style={sectionTitle}>📅 Monthly Revenue</h2>
      </div>
      <div style={chartCard}>
        <MonthlyChart />
      </div>
    </div>
  );
};

export default Dashboard;

// Inline Styles
const cardStyle = {
  backgroundColor: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  textAlign: 'center' as const,
};

const cardTitle = {
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#164863',
  marginBottom: '0.5rem',
};

const cardValue = {
  fontSize: '2rem',
  fontWeight: 'bold' as const,
  marginBottom: '1rem',
  color: '#333',
};

const sectionTitleWrapper = {
  marginTop: '3rem',
  marginBottom: '1rem',
  textAlign: 'center' as const,
};

const sectionTitle = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#164863',
};

const chartCard = {
  backgroundColor: '#ffffff',
  padding: '1.5rem',
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
  marginBottom: '2rem',
};
