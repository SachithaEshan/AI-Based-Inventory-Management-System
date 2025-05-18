import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits')
});

const updateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
  contactNo: z.string().min(10, 'Contact number must be at least 10 digits').optional()
});

const sellerValidator = { createSchema, updateSchema };
export default sellerValidator;
