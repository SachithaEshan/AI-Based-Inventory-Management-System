import { RequestHandler } from 'express';
import CustomError from '../errors/customError';
import httpStatus from 'http-status';
import { RolePermissions } from '../constant/userRole';
import User from '../modules/user/user.model';

type Permission = '*' | 'view_users' | 'manage_inventory' | 'manage_orders' | 'view_reports' | 'manage_suppliers' | 'view_own_products' | 'update_own_products' | 'view_own_orders' | 'view_own_profile' | 'update_own_profile';

export const checkRole = (requiredPermissions: Permission[]): RequestHandler => {
  return async (req, res, next) => {
    try {
      console.log('checkRole middleware called with permissions:', requiredPermissions);
      console.log('User ID from request:', req.user?._id);
      
      const user = await User.findById(req.user._id);
      console.log('Found user:', user);
      
      if (!user) {
        throw new CustomError(httpStatus.NOT_FOUND, 'User not found', 'User');
      }

      // Admin has all permissions
      if (user.role === 'ADMIN') {
        console.log('User is admin, granting access');
        return next();
      }

      const userPermissions = RolePermissions[user.role as keyof typeof RolePermissions] || [];
      console.log('User permissions:', userPermissions);

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(permission => 
        Array.from(userPermissions).includes(permission)
      );
      console.log('Has all required permissions:', hasAllPermissions);

      if (!hasAllPermissions) {
        throw new CustomError(
          httpStatus.FORBIDDEN,
          'You do not have permission to perform this action',
          'Authorization'
        );
      }

      next();
    } catch (error) {
      console.error('Error in checkRole middleware:', error);
      if (error instanceof CustomError) {
        next(error);
      } else {
        next(new CustomError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal server error', 'Server'));
      }
    }
  };
}; 