import { Router } from 'express';
import { AnomalyDetectionService } from './anomalyDetection.service';
import { AnomalyAlert } from './anomalyAlert.model';
import verifyAuth from '../../middlewares/verifyAuth';

const router = Router();

// Get all anomaly alerts
router.get('/', verifyAuth, async (req, res) => {
  try {
    const alerts = await AnomalyAlert.find()
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching anomaly alerts:', error);
    res.status(500).json({ message: 'Error fetching anomaly alerts' });
  }
});

// Trigger anomaly detection
router.post('/detect', verifyAuth, async (req, res) => {
  try {
    const anomalyService = AnomalyDetectionService.getInstance();
    await anomalyService.detectAnomalies();
    res.json({ message: 'Anomaly detection completed successfully' });
  } catch (error) {
    console.error('Error during anomaly detection:', error);
    res.status(500).json({ 
      message: 'Error during anomaly detection',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete an anomaly alert
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const alert = await AnomalyAlert.findByIdAndDelete(req.params.id);
    if (!alert) {
      return res.status(404).json({ message: 'Anomaly alert not found' });
    }
    res.json({ message: 'Anomaly alert deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting anomaly alert' });
  }
});

export default router; 