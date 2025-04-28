import { Router } from 'express';
import { exec } from 'child_process';
import productControllers from '../modules/product/product.controllers';
import verifyAuth from '../middlewares/verifyAuth';
import path from 'path';

const forecastRoutes = Router();

// Apply authentication middleware to all forecast routes
forecastRoutes.use(verifyAuth);

// Demo forecast endpoint
forecastRoutes.post('/demo', (req, res) => {
  const scriptPath = path.join(__dirname, 'forecast.py');
  
  // Run Python script in demo mode
  exec(`python3 ${scriptPath} demo`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error running forecast script. Please check the server logs for details.' });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }

    try {
      // Parse Python output and send it to frontend
      const forecastData = JSON.parse(stdout);
      if (forecastData.error) {
        if (forecastData.error.includes('CSV file not found')) {
          return res.status(404).json({ error: 'Demo data file not found. Please contact the administrator.' });
        }
        return res.status(500).json({ error: forecastData.error });
      }
      res.json(forecastData);
    } catch (parseError) {
      console.error('Parse Error:', parseError);
      console.error('Raw output:', stdout);
      res.status(500).json({ error: 'Failed to parse forecast data.' });
    }
  });
});

// Product-specific forecast endpoint
forecastRoutes.post('/:productId', (req, res) => {
  const { productId } = req.params;
  const scriptPath = path.join(__dirname, 'forecast.py');

  // Run Python script with product ID
  exec(`python3 ${scriptPath} ${productId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error running forecast script. Please check the server logs for details.' });
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }

    try {
      // Parse Python output and send it to frontend
      const forecastData = JSON.parse(stdout);
      if (forecastData.error) {
        if (forecastData.error.includes('No sales data found')) {
          return res.status(200).json({ 
            error: 'No sales data found for this product. Please add some sales records first.',
            data: []
          });
        }
        if (forecastData.error.includes('Not enough sales data')) {
          return res.status(200).json({ 
            error: 'Not enough sales data to forecast. Minimum 10 sales records required.',
            data: []
          });
        }
        if (forecastData.error.includes('Connection refused')) {
          return res.status(503).json({ error: 'Database connection error. Please try again later.' });
        }
        return res.status(500).json({ error: forecastData.error });
      }
      res.json(forecastData);
    } catch (parseError) {
      console.error('Parse Error:', parseError);
      console.error('Raw output:', stdout);
      res.status(500).json({ error: 'Failed to parse forecast data.' });
    }
  });
});

// Export forecastRoutes as default and productControllers as a named export
export default forecastRoutes;
export { productControllers };