import React from 'react';
import { FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

interface LowStockWarningProps {
  stock: number;
  reorderThreshold: number;
  forecastData?: {
    forecastedDemand: number;
    confidence: number;
  };
}

const LowStockWarning: React.FC<LowStockWarningProps> = ({ stock, reorderThreshold, forecastData }) => {
  if (stock >= reorderThreshold) return null;

  return (
    <div className="flex flex-col text-yellow-600 mt-1">
      <div className="flex items-center">
      <FaExclamationTriangle className="mr-1" />
      <span className="text-sm">Low Stock Warning</span>
      </div>
      {forecastData && (
        <div className="flex items-center mt-1 text-xs">
          <FaChartLine className="mr-1" />
          <span>
            Forecasted demand: {forecastData.forecastedDemand} units ({forecastData.confidence.toFixed(1)}% confidence)
          </span>
        </div>
      )}
    </div>
  );
};

export default LowStockWarning; 