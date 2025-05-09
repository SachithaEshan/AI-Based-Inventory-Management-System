import React from 'react';
import { useParams } from 'react-router-dom';
import StockOptimization from '../components/StockOptimization/StockOptimization';

const StockOptimizationPage: React.FC = () => {
    const { productId } = useParams<{ productId: string }>();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Stock Level Optimization</h1>
            <StockOptimization productId={productId} />
        </div>
    );
};

export default StockOptimizationPage; 