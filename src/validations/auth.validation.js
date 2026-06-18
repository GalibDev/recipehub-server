import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  image: z.union([z.string().trim().url(), z.literal('')]).optional(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
