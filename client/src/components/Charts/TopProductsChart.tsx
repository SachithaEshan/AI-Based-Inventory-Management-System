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
import { useGetAllSaleQuery } from '../../redux/features/management/saleApi';
import { Flex } from 'antd';
import Loader from '../Loader';

const TopProductsChart = () => {
  const { data: salesData, isLoading } = useGetAllSaleQuery({ limit: 1000 });

  if (isLoading)
    return (
      <Flex>
        <Loader />
      </Flex>
    );

  // Process sales data to get top products
  const productSales = salesData?.data?.reduce((acc: any, sale: any) => {
    const productName = sale.productName;
    if (!acc[productName]) {
      acc[productName] = {
        name: productName,
        quantity: 0,
        revenue: 0,
      };
    }
    acc[productName].quantity += sale.quantity;
    acc[productName].revenue += sale.totalPrice;
    return acc;
  }, {});

  // Convert to array and sort by quantity
  const topProducts = Object.values(productSales || {})
    .sort((a: any, b: any) => b.quantity - a.quantity)
    .slice(0, 10); // Get top 10 products

  return (
    <ResponsiveContainer width='100%' height={400}>
      <BarChart
        data={topProducts}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis type="number" />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={100}
          tick={{ fontSize: 12 }}
        />
        <Tooltip />
        <Legend />
        <Bar dataKey='quantity' fill='#164863' name='Quantity Sold' />
        <Bar dataKey='revenue' fill='#427D9D' name='Revenue' />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopProductsChart; 