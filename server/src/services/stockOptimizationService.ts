import { spawn } from 'child_process';
import { StockOptimizationResult, StockOptimizationError } from '../types/stockOptimization';

export class StockOptimizationService {
    private static instance: StockOptimizationService;
    private pythonPath: string;

    private constructor() {
        this.pythonPath = process.env.PYTHON_PATH || 'python3';
    }

    public static getInstance(): StockOptimizationService {
        if (!StockOptimizationService.instance) {
            StockOptimizationService.instance = new StockOptimizationService();
        }
        return StockOptimizationService.instance;
    }

    public async optimizeStockLevels(productId?: string): Promise<StockOptimizationResult | StockOptimizationError> {
        return new Promise((resolve, reject) => {
            const scriptPath = `${__dirname}/../forecast/stock_optimization.py`;
            const args = productId ? [scriptPath, productId] : [scriptPath, 'demo'];
            
            const pythonProcess = spawn(this.pythonPath, args);
            
            let result = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                result += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${error}`));
                    return;
                }

                try {
                    const parsedResult = JSON.parse(result);
                    if ('error' in parsedResult) {
                        resolve(parsedResult as StockOptimizationError);
                    } else {
                        resolve(parsedResult as StockOptimizationResult);
                    }
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    reject(new Error(`Failed to parse Python output: ${errorMessage}`));
                }
            });
        });
    }
} 