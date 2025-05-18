import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useYearlySaleQuery } from '../../redux/features/management/saleApi';
import { Flex } from 'antd';
import Loader from '../Loader';

const YearlyChart = () => {
  const { data: yearlyData, isLoading } = useYearlySaleQuery(undefined);

  if (isLoading)
    return (
      <Flex>
        <Loader />
      </Flex>
    );

  const data = yearlyData?.data.map(
    (item: { year: number; totalRevenue: number; totalQuantity: number }) => ({
      name: `${item.year}`,
      revenue: item.totalRevenue,
      quantity: item.totalQuantity,
    })
  );

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey='revenue' fill='#164863' name='Revenue' />
        <Bar dataKey='quantity' fill='#427D9D' name='Quantity Sold' />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default YearlyChart; 