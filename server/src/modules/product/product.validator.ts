import { z } from 'zod';
import { Types } from 'mongoose';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  seller: z.string().min(1, 'Seller is required').transform(val => new Types.ObjectId(val)),
  category: z.string().min(1, 'Category is required').transform(val => new Types.ObjectId(val)),
  brand: z.string().optional().transform(val => val ? new Types.ObjectId(val) : undefined),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  price: z.number().min(0, 'Price must be a positive number'),
  stock: z.number().min(0, 'Stock must be a positive number'),
  reorder_threshold: z.number().min(0, 'Reorder threshold must be a positive number').optional(),
  description: z.string().optional()
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  seller: z.string().min(1, 'Seller is required').optional().transform(val => val ? new Types.ObjectId(val) : undefined),
  category: z.string().min(1, 'Category is required').optional().transform(val => val ? new Types.ObjectId(val) : undefined),
  brand: z.string().optional().transform(val => val ? new Types.ObjectId(val) : undefined),
  size: z.enum(['SMALL', 'MEDIUM', 'LARGE']).optional(),
  price: z.number().min(0, 'Price must be a positive number').optional(),
  stock: z.number().min(0, 'Stock must be a positive number').optional(),
  reorder_threshold: z.number().min(0, 'Reorder threshold must be a positive number').optional(),
  description: z.string().optional()
});

const addStockSchema = z.object({
  stock: z.number().min(1, { message: 'Must be grater than 1!' })
});

const productValidator = { createProductSchema, updateProductSchema, addStockSchema };
export default productValidator;
