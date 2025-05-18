import { Request, Response } from 'express';
import Product from './product.model';
import productValidator from './product.validator';
import { IProduct } from './product.interface';
import { Types } from 'mongoose';
import CustomError from '../../errors/customError';
import httpStatus from 'http-status';
import { z } from 'zod';

export const createProduct = async (req: Request, res: Response) => {
  try {
    console.log('Starting product creation...');
    console.log('User from request:', req.user);
    
    if (!req.user?._id) {
      console.error('No user ID found in request');
      throw new CustomError(httpStatus.UNAUTHORIZED, 'User not authenticated', 'Unauthorized');
    }

    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const validatedData = productValidator.createProductSchema.parse(req.body);
      console.log('Validated data:', JSON.stringify(validatedData, null, 2));
    } catch (validationError) {
      console.error('Validation error:', validationError);
      throw validationError;
    }
    
    const validatedData = productValidator.createProductSchema.parse(req.body);
    const productData: IProduct = {
      ...validatedData,
      user: new Types.ObjectId(req.user._id),
      reorder_threshold: validatedData.reorder_threshold ?? 10
    };
    
    console.log('Product data before save:', JSON.stringify(productData, null, 2));
    
    try {
      const product = new Product(productData);
      await product.save();
      console.log('Product saved successfully');
      
      res.status(201).json({
        statusCode: 201,
        message: 'Product created successfully',
        data: product
      });
    } catch (saveError) {
      console.error('Error saving product:', saveError);
      throw saveError;
    }
  } catch (error) {
    console.error('Error in createProduct:', error);
    
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        error: error.errorType
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.message,
        error: 'ValidationError'
      });
    }
    
    return res.status(500).json({
      statusCode: 500,
      message: 'An unexpected error occurred',
      error: 'InternalServerError'
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    console.log('Starting product update...');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    if (!req.user?._id) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not authenticated',
        error: 'Unauthorized'
      });
    }

    const validatedData = productValidator.updateProductSchema.parse(req.body);
    console.log('Validated data:', JSON.stringify(validatedData, null, 2));

    // First check if product exists and user owns it
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found',
        error: 'NotFound'
      });
    }

    if (existingProduct.user.toString() !== req.user._id) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Not authorized to update this product',
        error: 'Forbidden'
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: validatedData },
      { new: true }
    ).populate('category', 'name')
     .populate('brand', 'name')
     .populate('seller', 'name');

    res.json({
      statusCode: 200,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Validation error',
        error: 'ValidationError',
        details: error.errors
      });
    }
    
    if (error instanceof Error) {
      return res.status(400).json({
        statusCode: 400,
        message: error.message,
        error: 'ValidationError'
      });
    }
    
    return res.status(500).json({
      statusCode: 500,
      message: 'An unexpected error occurred',
      error: 'InternalServerError'
    });
  }
};

export const getTotalProduct = async (req: Request, res: Response) => {
  try {
    const result = await Product.aggregate([
      {
        $match: {
          user: new Types.ObjectId(req.user._id)
        }
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalStock: 1
        }
      }
    ]);

    const data = result[0] || { totalProducts: 0, totalStock: 0 };
    
    res.json({ 
      data: {
        totalProducts: data.totalProducts,
        totalQuantity: data.totalStock
      }
    });
  } catch (error) {
    console.error('Error getting total products:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Failed to get total products',
      error: 'InternalServerError'
    });
  }
};

export const readAll = async (req: Request, res: Response) => {
  try {
    console.log('Starting to fetch products...');
    const { name, category, brand, limit = 10, minPrice, maxPrice } = req.query;
    console.log('Raw query parameters:', req.query);
    console.log('Parsed price parameters:', { minPrice, maxPrice });

    if (!req.user?._id) {
      return res.status(401).json({
        statusCode: 401,
        message: 'User not authenticated',
        error: 'Unauthorized'
      });
    }

    const query: any = {
      user: new Types.ObjectId(req.user._id)
    };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      try {
        query.category = new Types.ObjectId(category as string);
      } catch (error) {
        console.error('Invalid category ID:', error);
        return res.status(400).json({
          statusCode: 400,
          message: 'Invalid category ID format',
          error: 'ValidationError'
        });
      }
    }
    if (brand) {
      try {
        query.brand = new Types.ObjectId(brand as string);
      } catch (error) {
        console.error('Invalid brand ID:', error);
        return res.status(400).json({
          statusCode: 400,
          message: 'Invalid brand ID format',
          error: 'ValidationError'
        });
      }
    }

    // Handle price range filtering
    if (minPrice !== undefined && minPrice !== '') {
      const minPriceNum = parseFloat(minPrice as string);
      if (!isNaN(minPriceNum)) {
        query.price = { ...query.price, $gte: minPriceNum };
      }
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const maxPriceNum = parseFloat(maxPrice as string);
      if (!isNaN(maxPriceNum)) {
        query.price = { ...query.price, $lte: maxPriceNum };
      }
    }

    console.log('Final MongoDB query:', JSON.stringify(query, null, 2));

    try {
      const products = await Product.find(query)
        .limit(Number(limit))
        .populate({
          path: 'category',
          select: 'name',
          model: 'Category'
        })
        .populate({
          path: 'brand',
          select: 'name',
          model: 'Brand'
        })
        .populate({
          path: 'seller',
          select: 'name',
          model: 'Seller'
        });

      console.log('Filtered products count:', products.length);
      console.log('Sample of filtered products:', products.slice(0, 3).map(p => ({ name: p.name, price: p.price })));

      res.json({
        statusCode: 200,
        message: 'Products retrieved successfully',
        data: products
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({
        statusCode: 500,
        message: 'Database error occurred',
        error: 'DatabaseError',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      });
    }
  } catch (error) {
    console.error('Error in readAll:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Failed to get products',
      error: 'InternalServerError',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const readSingle = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('seller', 'name');

    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found',
        error: 'NotFound'
      });
    }

    res.json({
      statusCode: 200,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Failed to get product',
      error: 'InternalServerError'
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        statusCode: 404,
        message: 'Product not found',
        error: 'NotFound'
      });
    }

    res.json({
      statusCode: 200,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Failed to delete product',
      error: 'InternalServerError'
    });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { stock } = req.body;
    
    // Validate that stock is a valid number
    if (typeof stock !== 'number' || isNaN(stock)) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Invalid stock quantity provided',
        error: 'ValidationError'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        statusCode: 404,
        message: 'Product not found',
        error: 'NotFound'
      });
    }

    // Ensure user owns the product
    if (product.user.toString() !== req.user?._id) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Not authorized to update this product',
        error: 'Forbidden'
      });
    }

    // Update stock by adding the new quantity
    product.stock = Number(product.stock) + Number(stock);
    await product.save();

    res.json({
      statusCode: 200,
      message: 'Stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Failed to update stock',
      error: 'InternalServerError'
    });
  }
}; 