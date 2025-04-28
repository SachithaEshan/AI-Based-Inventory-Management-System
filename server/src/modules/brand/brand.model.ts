import { Schema, model } from 'mongoose';
import { IBrand } from './brand.interface';

const brandSchema = new Schema<IBrand>({
  user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true }
});

const Brand = model<IBrand>('Brand', brandSchema);
export default Brand;
