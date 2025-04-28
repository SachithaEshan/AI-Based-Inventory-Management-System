import { Router } from 'express';
import userRoutes from '../modules/user/user.routes';
import productRoute from '../modules/product/product.routes';
import saleRoutes from '../modules/sale/sale.routes';
import categoryRoutes from '../modules/category/category.routes';
import brandRoutes from '../modules/brand/brand.routes';
import sellerRoutes from '../modules/seller/seller.routes';
import purchaseRoutes from '../modules/purchase/purchase.routes';
import forecastRoutes from '../forecast/forecast';
import orderRoutes from '../modules/order/order.routes';
import notificationRoutes from '../modules/notification/notification.routes';
import anomalyRoutes from '../modules/anomaly/anomaly.routes';

const rootRouter = Router();

rootRouter.use('/users', userRoutes);
rootRouter.use('/products', productRoute);
rootRouter.use('/sales', saleRoutes);
rootRouter.use('/categories', categoryRoutes);
rootRouter.use('/brands', brandRoutes);
rootRouter.use('/sellers', sellerRoutes);
rootRouter.use('/purchases', purchaseRoutes);
rootRouter.use('/orders', orderRoutes);
rootRouter.use('/forecast', forecastRoutes);
rootRouter.use('/notifications', notificationRoutes);
rootRouter.use('/anomaly', anomalyRoutes);

export default rootRouter;
