import httpStatus from 'http-status';
import asyncHandler from '../../lib/asyncHandler';
import sendResponse from '../../lib/sendResponse';
import userServices from './user.services';
import { scheduleStockCheck } from '../product/stockMonitor.service';
import jwt from 'jsonwebtoken';
import config from '../../config';

class UserControllers {
  private services = userServices;

  // get self profile
  getSelf = asyncHandler(async (req, res) => {
    const result = await this.services.getSelf(req.user._id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'User profile retrieved successfully!',
      data: result
    });
  });

  // register new account
  register = asyncHandler(async (req, res) => {
    const result = await this.services.register(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'User registered successfully!',
      data: result
    });
  });

  // login into your registered account
  login = asyncHandler(async (req, res) => {
    const result = await this.services.login(req.body);
    
    // Decode the token to get user ID
    const decoded = jwt.verify(result.token, config.jwt_secret as string) as { _id: string };
    
    // Initialize stock monitoring for the user
    scheduleStockCheck(decoded._id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User login successfully!',
      data: result
    });
  });

  // update profile
  updateProfile = asyncHandler(async (req, res) => {
    const result = await this.services.updateProfile(req.user._id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User Profile updated successfully!',
      data: result
    });
  });

  // change Password
  changePassword = asyncHandler(async (req, res) => {
    const result = await this.services.changePassword(req.user._id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Password changed successfully!',
      data: result
    });
  });

  // Admin: Get all users
  getAllUsers = asyncHandler(async (req, res) => {
    console.log('getAllUsers called with query:', req.query);
    console.log('User making request:', req.user);
    
    const result = await this.services.getAllUsers(req.query);
    console.log('getAllUsers result:', result);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Users retrieved successfully!',
      data: result
    });
  });

  // Admin: Update user role
  updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;
    
    const result = await this.services.updateUserRole(userId, role);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User role updated successfully!',
      data: result
    });
  });

  // Admin: Update user status
  updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;
    
    const result = await this.services.updateUserStatus(userId, status);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User status updated successfully!',
      data: result
    });
  });

  // Create admin user (protected route)
  createAdmin = asyncHandler(async (req, res) => {
    const result = await this.services.createAdmin(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: 'Admin user created successfully!',
      data: result
    });
  });
}

const userControllers = new UserControllers();
export default userControllers;
