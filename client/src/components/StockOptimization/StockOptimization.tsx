// import React, { useEffect, useState, useCallback } from 'react';
// import {
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     Legend,
//     ResponsiveContainer
// } from 'recharts';
// import { getStockOptimization } from '../../services/stockOptimizationService';
// import { StockOptimizationResult } from '../../types/stockOptimization';

// interface StockOptimizationProps {
//     productId?: string;
// }

// interface StockOptimizationError {
//     error: string;
// }

// const StockOptimization: React.FC<StockOptimizationProps> = ({ productId }) => {
//     const [data, setData] = useState<StockOptimizationResult | null>(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     const fetchData = useCallback(async () => {
//         try {
//             console.log('Starting to fetch stock optimization data...');
//             setLoading(true);
//             setError(null);
            
//             const result = await getStockOptimization(productId);
//             console.log('Received result:', result);
            
//             if ('error' in result) {
//                 console.error('Error in result:', result.error);
//                 setError((result as StockOptimizationError).error);
//                 setData(null);
//             } else {
//                 console.log('Setting data:', result);
//                 setData(result as StockOptimizationResult);
//                 setError(null);
//             }
//         } catch (err) {
//             console.error('Error in fetchData:', err);
//             setError(err instanceof Error ? err.message : 'Failed to load stock optimization data');
//             setData(null);
//         } finally {
//             console.log('Setting loading to false');
//             setLoading(false);
//         }
//     }, [productId]);

//     useEffect(() => {
//         let isMounted = true;
//         const controller = new AbortController();

//         if (isMounted) {
//             fetchData();
//         }

//         return () => {
//             isMounted = false;
//             controller.abort();
//         };
//     }, [fetchData]);

//     if (loading) {
//         return (
//             <div className="flex flex-col justify-center items-center h-64">
//                 <div className="text-lg mb-2">Loading...</div>
//                 <div className="text-sm text-gray-500">Fetching stock optimization data</div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="text-red-500 text-center p-4">
//                 <div className="text-lg font-semibold mb-2">Error</div>
//                 <div>{error}</div>
//             </div>
//         );
//     }

//     if (!data || !data.forecast || data.forecast.length === 0) {
//         return (
//             <div className="text-center p-4">
//                 <div className="text-lg font-semibold mb-2">No Data Available</div>
//                 <div className="text-gray-500">No forecast data is available for this product.</div>
//             </div>
//         );
//     }

//     const chartData = data.forecast.map(item => ({
//         date: new Date(item.date).toLocaleDateString(),
//         forecasted_quantity: item.forecasted_quantity
//     }));

//     return (
//         <div className="p-6 bg-white rounded-lg shadow-lg">
//             {/* <h2 className="text-2xl font-bold mb-6">Stock Level Optimization</h2> */}
            
//             <div className="mb-8 h-96">
//                 <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={chartData}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis 
//                             dataKey="date" 
//                             label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
//                         />
//                         <YAxis 
//                             label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }} 
//                         />
//                         <Tooltip />
//                         <Legend />
//                         <Line 
//                             type="monotone" 
//                             dataKey="forecasted_quantity" 
//                             name="Forecasted Quantity"
//                             stroke="#4B5563" 
//                             strokeWidth={2}
//                             dot={false}
//                         />
//                     </LineChart>
//                 </ResponsiveContainer>
//             </div>

//             {data.optimal_levels && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     <div className="bg-blue-50 p-4 rounded-lg">
//                         <h3 className="font-semibold text-blue-700">Safety Stock</h3>
//                         <p className="text-2xl font-bold">{data.optimal_levels.safety_stock.toFixed(2)} units</p>
//                     </div>

//                     <div className="bg-green-50 p-4 rounded-lg">
//                         <h3 className="font-semibold text-green-700">Reorder Point</h3>
//                         <p className="text-2xl font-bold">{data.optimal_levels.reorder_point.toFixed(2)} units</p>
//                     </div>

//                     <div className="bg-purple-50 p-4 rounded-lg">
//                         <h3 className="font-semibold text-purple-700">Economic Order Quantity</h3>
//                         <p className="text-2xl font-bold">{data.optimal_levels.economic_order_quantity.toFixed(2)} units</p>
//                     </div>

//                     <div className="bg-yellow-50 p-4 rounded-lg">
//                         <h3 className="font-semibold text-yellow-700">Mean Demand</h3>
//                         <p className="text-2xl font-bold">{data.optimal_levels.mean_demand.toFixed(2)} units/day</p>
//                     </div>

//                     <div className="bg-red-50 p-4 rounded-lg">
//                         <h3 className="font-semibold text-red-700">Demand Standard Deviation</h3>
//                         <p className="text-2xl font-bold">{data.optimal_levels.std_demand.toFixed(2)} units</p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default StockOptimization;

import React, { useEffect, useState, useCallback } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { getStockOptimization } from '../../services/stockOptimizationService';
import { StockOptimizationResult } from '../../types/stockOptimization';

interface StockOptimizationProps {
    productId?: string;
}

interface StockOptimizationError {
    error: string;
}

const StockOptimization: React.FC<StockOptimizationProps> = ({ productId }) => {
    const [data, setData] = useState<StockOptimizationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'optimization' | 'patterns'>('optimization');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getStockOptimization(productId);

            if ('error' in result) {
                setError((result as StockOptimizationError).error);
                setData(null);
            } else {
                setData(result as StockOptimizationResult);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load stock optimization data');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();
        if (isMounted) {
            fetchData();
        }
        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [fetchData]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '16rem',
            }}>
                <div style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Loading...</div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Fetching data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ color: '#DC2626', textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Error</div>
                <div>{error}</div>
            </div>
        );
    }

    if (!data || !data.forecast || data.forecast.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Data Available</div>
                <div style={{ color: '#6B7280' }}>No data is available for this product.</div>
            </div>
        );
    }

    const chartData = data.forecast.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        forecasted_quantity: item.forecasted_quantity
    }));

    const renderOptimizationView = () => (
        <>
            <div style={{ marginBottom: '2rem', height: '24rem' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis
                            label={{ value: 'Quantity', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip />
                        <Line
                            type="monotone"
                            dataKey="forecasted_quantity"
                            name="Forecasted Quantity"
                            stroke="#4B5563"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {data.optimal_levels && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                }}>
                    <div style={{ backgroundColor: '#DBEAFE', padding: '1rem', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#1D4ED8' }}>Safety Stock</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.optimal_levels.safety_stock.toFixed(2)} units</p>
                    </div>

                    <div style={{ backgroundColor: '#D1FAE5', padding: '1rem', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#047857' }}>Reorder Point</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.optimal_levels.reorder_point.toFixed(2)} units</p>
                    </div>

                    <div style={{ backgroundColor: '#EDE9FE', padding: '1rem', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#6B21A8' }}>Economic Order Quantity</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.optimal_levels.economic_order_quantity.toFixed(2)} units</p>
                    </div>

                    <div style={{ backgroundColor: '#FEF9C3', padding: '1rem', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#B45309' }}>Mean Demand</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.optimal_levels.mean_demand.toFixed(2)} units/day</p>
                    </div>

                    <div style={{ backgroundColor: '#FECACA', padding: '1rem', borderRadius: '0.5rem' }}>
                        <h3 style={{ fontWeight: 600, color: '#B91C1C' }}>Demand Standard Deviation</h3>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{data.optimal_levels.std_demand.toFixed(2)} units</p>
                    </div>
                </div>
            )}
        </>
    );

    const renderPatternsView = () => {
        if (!data.pattern_analysis) return null;

        const { basic_stats, trend_analysis, seasonality, volatility, growth, peak_analysis, low_analysis } = data.pattern_analysis;

        // Convert daily patterns to chart data
        const dailyPatternData = Object.entries(seasonality.daily_patterns).map(([day, value]) => ({
            day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][parseInt(day)],
            value: value
        }));

        return (
            <div style={{ padding: '1rem' }}>
                {/* Basic Stats */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Basic Statistics</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Total Sales</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{basic_stats.total_sales.toFixed(2)} units</p>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Average Daily Sales</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{basic_stats.mean_daily_sales.toFixed(2)} units</p>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Sales Range</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{basic_stats.sales_range.toFixed(2)} units</p>
                        </div>
                    </div>
                </div>

                {/* Trend Analysis */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Trend Analysis</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Trend Direction</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trend_analysis.trend_direction}</p>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Trend Strength</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{trend_analysis.trend_strength.toFixed(2)}%</p>
                        </div>
                    </div>
                </div>

                {/* Daily Patterns Chart */}
                <div style={{ marginBottom: '2rem', height: '300px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Daily Sales Patterns</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyPatternData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4B5563" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Volatility and Growth */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Sales Performance</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Volatility Level</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{volatility.volatility_level}</p>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Growth Status</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{growth.growth_status}</p>
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280' }}>Growth Rate</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{growth.growth_rate.toFixed(2)}%</p>
                        </div>
                    </div>
                </div>

                {/* Peak and Low Analysis */}
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Peak and Low Points</h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '1rem'
                    }}>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Peak Sales Days</p>
                            {peak_analysis.peak_dates.map((date, index) => (
                                <div key={date} style={{ marginBottom: '0.5rem' }}>
                                    <p style={{ fontWeight: 500 }}>{date}</p>
                                    <p style={{ color: '#059669' }}>{peak_analysis.peak_values[index]} units</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ backgroundColor: '#F3F4F6', padding: '1rem', borderRadius: '0.5rem' }}>
                            <p style={{ color: '#6B7280', marginBottom: '0.5rem' }}>Low Sales Days</p>
                            {low_analysis.low_dates.map((date, index) => (
                                <div key={date} style={{ marginBottom: '0.5rem' }}>
                                    <p style={{ fontWeight: 500 }}>{date}</p>
                                    <p style={{ color: '#DC2626' }}>{low_analysis.low_values[index]} units</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}>
            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                marginBottom: '2rem',
                borderBottom: '2px solid #E5E7EB',
            }}>
                <button
                    onClick={() => setActiveTab('optimization')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'optimization' ? '2px solid #4B5563' : 'none',
                        color: activeTab === 'optimization' ? '#4B5563' : '#6B7280',
                        fontWeight: activeTab === 'optimization' ? 600 : 400,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    Stock Optimization
                </button>
                <button
                    onClick={() => setActiveTab('patterns')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderBottom: activeTab === 'patterns' ? '2px solid #4B5563' : 'none',
                        color: activeTab === 'patterns' ? '#4B5563' : '#6B7280',
                        fontWeight: activeTab === 'patterns' ? 600 : 400,
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                    }}
                >
                    Sales Patterns
                </button>
            </div>

            {/* Content */}
            {activeTab === 'optimization' ? renderOptimizationView() : renderPatternsView()}
        </div>
    );
};

export default StockOptimization;

