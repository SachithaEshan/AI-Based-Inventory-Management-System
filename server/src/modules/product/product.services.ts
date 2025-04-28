/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Types } from 'mongoose';
import sortAndPaginatePipeline from '../../lib/sortAndPaginate.pipeline';
import BaseServices from '../baseServices';
import Product from './product.model';
import matchStagePipeline from './product.aggregation.pipeline';
import CustomError from '../../errors/customError';
import Purchase from '../purchase/purchase.model';
import Seller from '../seller/seller.model';
import { IProduct } from './product.interface';

class ProductServices extends BaseServices<any> {
  constructor(model: any, modelName: string) {
    super(model, modelName);
  }

  /**
   * Create new product
   */
  async create(payload: IProduct, userId: string) {
    type str = keyof IProduct;
    (Object.keys(payload) as str[]).forEach((key: str) => {
      if (payload[key] === '') {
        delete payload[key];
      }
    });

    // Validate required fields
    if (!payload.seller || !payload.category) {
      throw new CustomError(400, 'Seller and Category are required', 'VALIDATION_ERROR');
    }

    // Set default reorder_threshold if not provided
    if (!payload.reorder_threshold) {
      payload.reorder_threshold = 10; // Default value
    }

    payload.user = new Types.ObjectId(userId);
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const seller = await Seller.findById(payload.seller);
      if (!seller) {
        throw new CustomError(400, 'Seller not found', 'NOT_FOUND_ERROR');
      }

      const product: any = await this.model.create([payload], { session });

      await Purchase.create(
        [
          {
            user: new Types.ObjectId(userId),
            seller: product[0]?.seller,
            product: product[0]?._id,
            sellerName: seller?.name,
            productName: product[0]?.name,
            quantity: product[0]?.stock,
            unitPrice: product[0]?.price,
            totalPrice: product[0]?.stock * product[0]?.price,
            status: 'completed'
          }
        ],
        { session }
      );

      await session.commitTransaction();
      return product;
    } catch (error: any) {
      console.error('Product creation error:', error);
      await session.abortTransaction();
      
      if (error instanceof CustomError) {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        throw new CustomError(400, `Validation error: ${error.message}`, 'VALIDATION_ERROR');
      }
      
      throw new CustomError(500, `Failed to create product: ${error.message}`, 'SERVER_ERROR');
    } finally {
      await session.endSession();
    }
  }

  /**
   * Count Total Product
   */
  async countTotalProduct(userId: string) {
    return this.model.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$stock' }
        }
      },
      {
        $project: {
          totalQuantity: 1,
          _id: 0
        }
      }
    ]);
  }

  /**
   * Get All product of user
   */
  async readAll(query: Record<string, unknown> = {}, userId: string) {
    let data = await this.model.aggregate([...matchStagePipeline(query, userId), ...sortAndPaginatePipeline(query)]);

    const totalCount = await this.model.aggregate([
      ...matchStagePipeline(query, userId),
      {
        $group: {
          _id: null,
          total: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]);

    data = await this.model.populate(data, { path: 'category', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'brand', select: '-__v -user' });
    data = await this.model.populate(data, { path: 'seller', select: '-__v -user -createdAt -updatedAt' });

    return { data, totalCount };
  }

  /**
   * Get Single product of user
   */
  async read(id: string, userId: string) {
    await this._isExists(id);
    return this.model.findOne({ user: new Types.ObjectId(userId), _id: id });
  }

  /**
   * Multiple delete
   */
  async bulkDelete(payload: string[]) {
    const data = payload.map((item) => new Types.ObjectId(item));

    return this.model.deleteMany({ _id: { $in: data } });
  }

  /**
   * Create new product
   */
  async addToStock(id: string, payload: Pick<IProduct, 'seller' | 'stock'>, userId: string) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const seller = await Seller.findById(payload.seller);
      if (!seller) {
        throw new CustomError(400, 'Seller not found', 'SELLER_NOT_FOUND');
      }

      const product: any = await this.model.findByIdAndUpdate(
        id,
        { $inc: { stock: payload.stock } }, 
        { session, new: true }
      );

      await Purchase.create(
        [
          {
            user: new Types.ObjectId(userId),
            seller: product.seller,
            product: product._id,
            sellerName: seller.name,
            productName: product.name,
            quantity: payload.stock,
            unitPrice: product.price,
            totalPrice: payload.stock * product.price,
            status: 'completed'
          }
        ],
        { session }
      );

      await session.commitTransaction();
      return product;
    } catch (error: any) {
      console.error('Add stock error:', error);
      await session.abortTransaction();
      
      if (error instanceof CustomError) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new CustomError(400, `Validation error: ${error.message}`, 'VALIDATION_ERROR');
      }
      
      throw new CustomError(500, `Failed to add stock: ${error.message}`, 'ADD_STOCK_ERROR');
    } finally {
      await session.endSession();
    }
  }
}

const productServices = new ProductServices(Product, 'Product');
export default productServices;
