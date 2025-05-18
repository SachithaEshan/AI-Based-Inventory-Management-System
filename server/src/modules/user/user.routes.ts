import { Router } from 'express';
import userControllers from './user.controllers';
import validateRequest from '../../middlewares/validateRequest';
import userValidator from './user.validator';
import verifyAuth from '../../middlewares/verifyAuth';
import { checkRole } from '../../middlewares/checkRole';

const userRoutes = Router();

// Public routes
userRoutes.post('/register', validateRequest(userValidator.registerSchema), userControllers.register);
userRoutes.post('/login', validateRequest(userValidator.loginSchema), userControllers.login);

// Protected routes
userRoutes.use(verifyAuth);

// User routes
userRoutes.get('/self', userControllers.getSelf);
userRoutes.post(
  '/change-password',
  validateRequest(userValidator.changePasswordSchema),
  userControllers.changePassword
);
userRoutes.patch('/', userControllers.updateProfile);

// Admin routes
userRoutes.post(
  '/admin',
  checkRole(['view_users']),
  validateRequest(userValidator.registerSchema),
  userControllers.createAdmin
);

userRoutes.get(
  '/all',
  checkRole(['view_users']),
  userControllers.getAllUsers
);

userRoutes.patch(
  '/:userId/role',
  checkRole(['view_users']),
  validateRequest(userValidator.updateRoleSchema),
  userControllers.updateUserRole
);

userRoutes.patch(
  '/:userId/status',
  checkRole(['view_users']),
  validateRequest(userValidator.updateStatusSchema),
  userControllers.updateUserStatus
);

export default userRoutes;
