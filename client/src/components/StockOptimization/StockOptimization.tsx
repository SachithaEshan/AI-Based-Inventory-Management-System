import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { getStockOptimization } from '../../services/stockOptimizationService';
import { StockOptimizationResult } from '../../types/stockOptimization';

interface StockOptimizationProps {
    productId?: string;
}

const StockOptimization: React.FC<StockOptimizationProps> = ({ productId }) => {
    const [data, setData] = useState<StockOptimizationResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getStockOptimization(productId);
                setData(result);
                setError(null);
            } catch (err) {
                setError('Failed to load stock optimization data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId]);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    if (!data) {
        return <div className="text-center">No data available</div>;
    }

    const chartData = data.forecast.map(item => ({
        date: new Date(item.date).toLocaleDateString(),
        forecasted_quantity: item.forecasted_quantity
    }));

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Stock Level Optimization</h2>
            
            <div className="mb-8 h-96">
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
                        <Legend />
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-700">Safety Stock</h3>
                    <p className="text-2xl font-bold">{data.optimal_levels.safety_stock.toFixed(2)} units</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-700">Reorder Point</h3>
                    <p className="text-2xl font-bold">{data.optimal_levels.reorder_point.toFixed(2)} units</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-700">Economic Order Quantity</h3>
                    <p className="text-2xl font-bold">{data.optimal_levels.economic_order_quantity.toFixed(2)} units</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-yellow-700">Mean Demand</h3>
                    <p className="text-2xl font-bold">{data.optimal_levels.mean_demand.toFixed(2)} units/day</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-700">Demand Standard Deviation</h3>
                    <p className="text-2xl font-bold">{data.optimal_levels.std_demand.toFixed(2)} units</p>
                </div>
            </div>
        </div>
    );
};

export default StockOptimization; 