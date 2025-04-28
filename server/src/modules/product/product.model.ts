import { Schema, model } from 'mongoose';
import { IProduct } from './product.interface';

const productSchema = new Schema<IProduct>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    seller: { type: Schema.Types.ObjectId, required: true, ref: 'Seller' },
    category: { type: Schema.Types.ObjectId, required: true, ref: 'Category' },
    name: { type: String, required: true },
    size: { type: String, enum: ['SMALL', 'MEDIUM', 'LARGE'] },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    reorder_threshold: { type: Number, default: 10 },
    description: { type: String }
  },
  { timestamps: true }
);

const Product = model<IProduct>('Product', productSchema);
export default Product;
