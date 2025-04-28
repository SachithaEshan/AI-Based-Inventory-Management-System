import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button, Select, message } from 'antd';
import { useAppSelector } from '../redux/hooks';
import { getCurrentToken } from '../redux/services/authSlice';

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

interface Product {
  _id: string;
  name: string;
}

const ForecastPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const token = useAppSelector(getCurrentToken);

  // Fetch the list of products when the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data?.data) {
          setProducts(response.data.data);
        } else {
          console.error('Unexpected API response format:', response.data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProducts([]);
      }
    };
  
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const fetchForecast = async (isDemoMode = false) => {
    if (!isDemoMode && !selectedProductId) {
      setError('Please select a product.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const endpoint = isDemoMode ? `${API_BASE_URL}/forecast/demo` : `${API_BASE_URL}/forecast/${selectedProductId}`;
      const response = await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.error) {
        setError(response.data.error);
        setForecastData([]);
      } else {
        setForecastData(response.data);
        setIsDemo(isDemoMode);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch forecast.');
      setForecastData([]);
      console.error(err);
    }
    setLoading(false);
  };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Demand Forecast</h2>

//       {/* Product Selection and Buttons */}
//       <div className="mb-6 flex flex-col gap-4">
//         <div>
//           <label htmlFor="product-select" className="block text-lg font-medium mb-2">
//             Select a Product:
//           </label>
//           <Select
//             id="product-select"
//             value={selectedProductId}
//             onChange={(value) => setSelectedProductId(value)}
//             className="w-full"
//             disabled={products.length === 0}
//             options={[
//               { value: '', label: '-- Select a Product --' },
//               ...products.map(product => ({
//                 value: product._id,
//                 label: product.name
//               }))
//             ]}
//           />
//           {products.length === 0 && <p className="text-gray-500 mt-2">No products available.</p>}
//         </div>

//         <div className="flex gap-4">
//           <Button
//             type="primary"
//             onClick={() => fetchForecast(false)}
//             loading={loading}
//             disabled={!selectedProductId}
//           >
//             Forecast Demand
//           </Button>
//           <Button
//             type="default"
//             onClick={() => fetchForecast(true)}
//             loading={loading}
//           >
//             Demo
//           </Button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
//           {error}
//         </div>
//       )}

//       {/* Forecast Chart */}
//       {forecastData.length > 0 && (
//         <div className="mt-8">
//           <h3 className="text-xl font-semibold mb-4">
//             {isDemo ? 'Demo Forecast' : 'Product Demand Forecast'}
//           </h3>
//           <div className="bg-white p-4 rounded-lg shadow">
//             <ResponsiveContainer width="100%" height={400}>
//               <LineChart data={forecastData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="ds" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Line 
//                   type="monotone" 
//                   dataKey="yhat" 
//                   stroke="#8884d8" 
//                   activeDot={{ r: 8 }} 
//                   name="Forecasted Demand"
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ForecastPage;

return (
<div style={{ padding: '2rem', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
  <div
    style={{
      maxWidth: '1000px',
      margin: '0 auto',
      background: '#fff',
      padding: '2rem',
      borderRadius: '10px',
      boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    }}
  >
    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#164863', textAlign: 'center' }}>
      📈 Demand Forecast
    </h2>

    {/* Product Selector */}
    <div style={{ marginBottom: '2rem' }}>
      <label htmlFor="product-select" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '.5rem', display: 'block' }}>
        Select a Product:
      </label>
      <Select
        id="product-select"
        value={selectedProductId}
        onChange={(value) => setSelectedProductId(value)}
        style={{ width: '100%' }}
        disabled={products.length === 0}
        options={[
          { value: '', label: '-- Select a Product --' },
          ...products.map(product => ({
            value: product._id,
            label: product.name
          }))
        ]}
      />
      {products.length === 0 && (
        <p style={{ marginTop: '0.5rem', color: '#888' }}>No products available.</p>
      )}
    </div>

    {/* Action Buttons */}
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
      <Button
        type="primary"
        onClick={() => fetchForecast(false)}
        loading={loading}
        disabled={!selectedProductId}
        style={{ backgroundColor: '#164863', fontWeight: 'bold' }}
      >
        Forecast Demand
      </Button>
      <Button
        type="default"
        onClick={() => fetchForecast(true)}
        loading={loading}
        style={{ fontWeight: 'bold' }}
      >
        Demo
      </Button>
    </div>

    {/* Error Message */}
    {error && (
      <div
        style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#ffe5e5',
          border: '1px solid #ff4d4f',
          borderRadius: '6px',
          color: '#a8071a',
        }}
      >
        {error}
      </div>
    )}

    {/* Forecast Chart */}
    {forecastData.length > 0 && (
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, textAlign: 'center', marginBottom: '1rem' }}>
          {isDemo ? 'Demo Forecast' : 'Product Demand Forecast'}
        </h3>
        <div style={{ background: '#fafafa', padding: '1rem', borderRadius: '10px' }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ds" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="yhat"
                stroke="#164863"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="Forecasted Demand"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )}
  </div>
</div>
);
};

export default ForecastPage;
