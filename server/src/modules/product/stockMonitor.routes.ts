import express from 'express';
import { checkStockLevels } from './stockMonitor.service';
import verifyAuth from '../../middlewares/verifyAuth';

const router = express.Router();

// Check stock levels and generate reorder requests
router.get('/check-stock', verifyAuth, async (req, res) => {
  try {
    const reorderRequests = await checkStockLevels(req.user._id);
    res.json(reorderRequests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check stock levels' });
  }
});

export default router; 