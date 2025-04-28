import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import productValidator from './product.validator';
import { 
  createProduct, 
  updateProduct, 
  getTotalProduct, 
  readAll, 
  readSingle, 
  deleteProduct,
  updateStock
} from './product.controller';
import verifyAuth from '../../middlewares/verifyAuth';

const productRoute = Router();

productRoute.use(verifyAuth);

// Basic CRUD operations
productRoute.get('/total', getTotalProduct);
productRoute.get('/', readAll);
productRoute.get('/:id', readSingle);
productRoute.post('/', validateRequest(productValidator.createProductSchema), createProduct);
productRoute.patch('/:id', validateRequest(productValidator.updateProductSchema), updateProduct);
productRoute.patch('/:id/add', validateRequest(productValidator.addStockSchema), updateStock);
productRoute.delete('/:id', deleteProduct);

export default productRoute;
