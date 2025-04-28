import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createProduct, updateProduct } from './product.controller';
import Product from './product.model';

// Mock the Product model
jest.mock('./product.model');

describe('Product Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockProduct: any;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    // Setup mock product
    mockProduct = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Test Product',
      seller: new mongoose.Types.ObjectId(),
      category: new mongoose.Types.ObjectId(),
      price: 100,
      stock: 10,
      reorder_threshold: 5,
      description: 'Test Description',
      save: jest.fn().mockResolvedValue(this)
    };

    // Reset mocks
    jest.clearAllMocks();
    (Product as any).mockImplementation(() => mockProduct);
    Product.findByIdAndUpdate = jest.fn();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      mockRequest.body = {
        name: 'Test Product',
        seller: new mongoose.Types.ObjectId().toString(),
        category: new mongoose.Types.ObjectId().toString(),
        price: 100,
        stock: 10,
        reorder_threshold: 5,
        description: 'Test Description'
      };

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalled();
      const jsonResponse = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(jsonResponse).toHaveProperty('name', 'Test Product');
      expect(jsonResponse).toHaveProperty('price', 100);
      expect(jsonResponse).toHaveProperty('stock', 10);
      expect(jsonResponse).toHaveProperty('reorder_threshold', 5);
      expect(jsonResponse).toHaveProperty('description', 'Test Description');
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        name: '', // Invalid: empty name
        price: -10 // Invalid: negative price
      };

      await createProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(Array)
      }));
    });
  });

  describe('updateProduct', () => {
    const mockUpdatedProduct = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Updated Product',
      price: 150,
      stock: 20,
      reorder_threshold: 10
    };

    it('should update a product successfully', async () => {
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(mockUpdatedProduct);
      
      mockRequest.params = { id: mockUpdatedProduct._id.toString() };
      mockRequest.body = {
        name: 'Updated Product',
        price: 150,
        stock: 20,
        reorder_threshold: 10
      };

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUpdatedProduct._id.toString(),
        { $set: mockRequest.body },
        { new: true }
      );
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedProduct);
    });

    it('should handle product not found', async () => {
      (Product.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
      
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = {
        name: 'Updated Product'
      };

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('should handle validation errors', async () => {
      mockRequest.params = { id: new mongoose.Types.ObjectId().toString() };
      mockRequest.body = {
        price: -10 // Invalid: negative price
      };

      await updateProduct(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.any(Array)
      }));
    });
  });
}); 