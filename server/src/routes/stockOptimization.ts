import { Router } from 'express';
import { StockOptimizationService } from '../services/stockOptimizationService';
import verifyAuth from '../middlewares/verifyAuth';

const router = Router();
const stockOptimizationService = StockOptimizationService.getInstance();

// Add authentication middleware
router.use(verifyAuth);

// Route for demo mode (must come before the product-specific route)
router.get('/optimize/demo', async (req, res) => {
    console.log('Demo route hit - starting stock optimization');
    try {
        console.log('Calling optimizeStockLevels with demo mode');
        const result = await stockOptimizationService.optimizeStockLevels(undefined, true);
        console.log('Received result from optimizeStockLevels:', result);
        
        if ('error' in result) {
            console.error('Error in demo optimization:', result.error);
            res.status(500).json(result);
        } else {
            console.log('Sending successful response');
            res.json(result);
        }
    } catch (error) {
        console.error('Error in stock optimization demo route:', error);
        res.status(500).json({ 
            error: 'Failed to optimize stock levels',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Route for specific product optimization
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

export default router; 