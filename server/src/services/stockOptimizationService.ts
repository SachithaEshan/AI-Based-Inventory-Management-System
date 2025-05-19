import { spawn } from 'child_process';
import { StockOptimizationResult, StockOptimizationError } from '../types/stockOptimization';
import path from 'path';
import fs from 'fs';

export class StockOptimizationService {
    private static instance: StockOptimizationService;
    private pythonPath: string;

    private constructor() {
        // Use the Python from our virtual environment
        this.pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python3');
        
        // Check if Python exists
        if (!fs.existsSync(this.pythonPath)) {
            console.error(`Python not found at ${this.pythonPath}`);
            // Fallback to system Python
            this.pythonPath = 'python3';
        }
    }

    public static getInstance(): StockOptimizationService {
        if (!StockOptimizationService.instance) {
            StockOptimizationService.instance = new StockOptimizationService();
        }
        return StockOptimizationService.instance;
    }

    public async optimizeStockLevels(productId?: string, isDemo: boolean = false): Promise<StockOptimizationResult | StockOptimizationError> {
        return new Promise((resolve, reject) => {
            const scriptPath = path.join(__dirname, '..', 'forecast', 'stock_optimization.py');
            console.log('Python script path:', scriptPath);
            console.log('Using Python path:', this.pythonPath);
            
            // Check if script exists
            if (!fs.existsSync(scriptPath)) {
                const error = `Python script not found at ${scriptPath}`;
                console.error(error);
                reject(new Error(error));
                return;
            }
            
            const args = isDemo ? [scriptPath, 'demo'] : [scriptPath, productId || 'demo'];
            console.log('Running Python with args:', args);
            
            const pythonProcess = spawn(this.pythonPath, args, {
                env: {
                    ...process.env,
                    PYTHONUNBUFFERED: '1' // This ensures Python output is not buffered
                }
            });
            
            let result = '';
            let error = '';

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                console.log('Python stdout:', output);
                result += output;
            });

            pythonProcess.stderr.on('data', (data) => {
                const errorOutput = data.toString();
                console.error('Python stderr:', errorOutput);
                error += errorOutput;
            });

            pythonProcess.on('error', (err) => {
                console.error('Failed to start Python process:', err);
                reject(new Error(`Failed to start Python process: ${err.message}\nPython path: ${this.pythonPath}\nScript path: ${scriptPath}`));
            });

            pythonProcess.on('close', (code) => {
                console.log('Python process exited with code:', code);
                if (code !== 0) {
                    const errorMessage = `Python process exited with code ${code}:\nError output: ${error}\nPython path: ${this.pythonPath}\nScript path: ${scriptPath}`;
                    console.error(errorMessage);
                    reject(new Error(errorMessage));
                    return;
                }

                try {
                    if (!result) {
                        reject(new Error('No output received from Python script'));
                        return;
                    }

                    const parsedResult = JSON.parse(result);
                    if ('error' in parsedResult) {
                        resolve(parsedResult as StockOptimizationError);
                    } else {
                        resolve(parsedResult as StockOptimizationResult);
                    }
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    console.error('Failed to parse Python output:', errorMessage);
                    console.error('Raw Python output:', result);
                    reject(new Error(`Failed to parse Python output: ${errorMessage}\nRaw output: ${result}`));
                }
            });
        });
    }
} 