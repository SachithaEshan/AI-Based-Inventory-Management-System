import axios from 'axios';
import { StockOptimizationResult } from '../types/stockOptimization';

// Create an axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    timeout: 60000, // Increase timeout to 60 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getStockOptimization = async (productId?: string): Promise<StockOptimizationResult> => {
    try {
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? 'Token exists' : 'No token');
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        // If no productId is provided, use demo mode
        if (!productId) {
            const response = await api.get('/stock-optimization/optimize/demo', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Response received (demo):', response.data);
            return response.data;
        }

        // Try to get data for specific product
        try {
            const response = await api.get(`/stock-optimization/optimize/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Check if the response contains an error
            if (response.data && 'error' in response.data) {
                console.log('Product data error, falling back to demo mode:', response.data.error);
                // Fall back to demo mode
                const demoResponse = await api.get('/stock-optimization/optimize/demo', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Response received (demo fallback):', demoResponse.data);
                return demoResponse.data;
            }
            
            console.log('Response received (product):', response.data);
        return response.data;
        } catch (error) {
            // If product data fetch fails, fall back to demo mode
            console.log('Falling back to demo mode due to:', error);
            const demoResponse = await api.get('/stock-optimization/optimize/demo', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Response received (demo fallback):', demoResponse.data);
            return demoResponse.data;
        }
    } catch (error) {
        console.error('Axios error:', error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timed out. Please try again.');
            }
            throw new Error(error.response?.data?.error || error.message);
        }
        throw error;
    }
}; 