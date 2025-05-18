import { z } from 'zod';
import { UserRole, UserStatus } from '../../constant/userRole';

const registerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6, { message: 'password must have 6 characters' })
});

const updatedProfileSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, { message: 'password must have 6 characters' })
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: 'Old Password is required!' })
    .min(6, { message: 'old password must have 6 characters' }),
  newPassword: z
    .string({ required_error: 'New Password is required!' })
    .min(6, { message: 'new password must have 6 characters' })
});

const updateRoleSchema = z.object({
  role: z.enum([UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPLIER, UserRole.USER], {
    required_error: 'Role is required!'
  })
});

const updateStatusSchema = z.object({
  status: z.enum([UserStatus.PENDING, UserStatus.ACTIVE, UserStatus.BLOCK], {
    required_error: 'Status is required!'
  })
});

const userValidator = {
  registerSchema,
  loginSchema,
  updatedProfileSchema,
  changePasswordSchema,
  updateRoleSchema,
  updateStatusSchema
};

export default userValidator;
