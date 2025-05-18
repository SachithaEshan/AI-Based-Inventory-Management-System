import { Col, Row, Button } from 'antd';
import HistoryTable from '../components/tables/HistoryTable';
import {
  useDailySaleQuery,
  useWeeklySaleQuery,
} from '../redux/features/management/saleApi';
import { useState } from 'react';
import YearlyChart from '../components/Charts/YearlyChart';
import MonthlyChart from '../components/Charts/MonthlyChart';
import TopProductsChart from '../components/Charts/TopProductsChart';

const SaleHistoryPage = () => {
  const [showAllDaily, setShowAllDaily] = useState(false);
  const { data: dailySale, isFetching: isDailySaleFetching } = useDailySaleQuery(undefined);
  const { data: weeklySale, isFetching: isWeeklySaleFetching } = useWeeklySaleQuery(undefined);

  // Ensure dailySale is an array and limit to 5 entries initially
  const limitedDailySale = Array.isArray(dailySale?.data) ? dailySale.data.slice(0, 5) : [];
  const fullDailySale = Array.isArray(dailySale?.data) ? dailySale.data : [];

  return (
    <Row
      style={{
        maxHeight: 'calc(100vh - 5rem)',
        overflow: 'auto',
        paddingRight: '.5rem',
      }}
    >
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Yearly Sale</h1>
          <YearlyChart />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Monthly Sale</h1>
          <MonthlyChart />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Weekly Sale</h1>
          <HistoryTable data={weeklySale} isFetching={isWeeklySaleFetching} />
        </div>
      </Col>
      <Col xs={{ span: 24 }} lg={{ span: 12 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Daily Sale</h1>
          <HistoryTable 
            data={{ data: showAllDaily ? fullDailySale : limitedDailySale }} 
            isFetching={isDailySaleFetching} 
          />
          {Array.isArray(dailySale?.data) && dailySale.data.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Button 
                type="primary" 
                onClick={() => setShowAllDaily(!showAllDaily)}
              >
                {showAllDaily ? 'Show Less' : 'See More'}
              </Button>
            </div>
          )}
        </div>
      </Col>
      <Col xs={{ span: 24 }} style={{ padding: '.2rem' }}>
        <div className='sales'>
          <h1 style={{ fontSize: '2rem', textAlign: 'center' }}>Top Selling Products</h1>
          <TopProductsChart />
        </div>
      </Col>
    </Row>
  );
};

export default SaleHistoryPage;
