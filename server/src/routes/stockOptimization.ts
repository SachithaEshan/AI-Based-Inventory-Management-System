import { Router } from 'express';
import { StockOptimizationService } from '../services/stockOptimizationService';

const router = Router();
const stockOptimizationService = StockOptimizationService.getInstance();

router.get('/optimize/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await stockOptimizationService.optimizeStockLevels(productId);
        res.json(result);
    } catch (error) {
        console.error('Error in stock optimization route:', error);
        res.status(500).json({ error: 'Failed to optimize stock levels' });
    }
});

router.get('/optimize', async (req, res) => {
    try {
        const result = await stockOptimizationService.optimizeStockLevels();
        res.json(result);
    } catch (error) {
        console.error('Error in stock optimization demo route:', error);
        res.status(500).json({ error: 'Failed to optimize stock levels' });
    }
});

export default router; 