import { Schema, model } from 'mongoose';
import { ICategory } from './category.interface';

const categorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: { type: String, required: true }
  },
  { timestamps: true }
);

const Category = model<ICategory>('Category', categorySchema);
export default Category;
