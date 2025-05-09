import axios from 'axios';
import { StockOptimizationResult } from '../types/stockOptimization';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const getStockOptimization = async (productId?: string): Promise<StockOptimizationResult> => {
    try {
        const url = productId 
            ? `${API_URL}/stock-optimization/optimize/${productId}`
            : `${API_URL}/stock-optimization/optimize`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching stock optimization:', error);
        throw error;
    }
}; 