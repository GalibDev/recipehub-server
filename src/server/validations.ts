import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Email must be valid'),
  image: z.string().trim().url('Image must be a valid URL').optional().or(z.literal('')),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain one uppercase letter')
    .regex(/[a-z]/, 'Password must contain one lowercase letter'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Email must be valid'),
  password: z.string().min(1, 'Password is required'),
});

const recipeBaseSchema = z.object({
  recipeName: z.string().trim().min(3, 'Recipe name must be at least 3 characters'),
  recipeImage: z.string().trim().url('Recipe image must be a valid URL'),
  category: z.string().trim().min(2, 'Category is required'),
  cuisineType: z.string().trim().min(2, 'Cuisine type is required'),
  difficultyLevel: z.enum(['Easy', 'Medium', 'Hard']),
  preparationTime: z.coerce.number().int().positive('Preparation time must be greater than 0'),
  ingredients: z.array(z.string().trim().min(1)).min(1, 'Add at least one ingredient'),
  instructions: z.array(z.string().trim().min(1)).min(1, 'Add at least one instruction'),
  isFeatured: z.boolean().optional(),
  status: z.enum(['published', 'hidden']).optional(),
  price: z.coerce.number().min(0, 'Price cannot be negative').optional(),
});

export const createRecipeSchema = recipeBaseSchema;
export const updateRecipeSchema = recipeBaseSchema.partial();

export const checkoutSchema = z.object({
  recipeId: objectId.optional(),
});

export const confirmPaymentSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});

export const createReportSchema = z.object({
  recipeId: objectId,
  reason: z.enum(['Spam', 'Offensive Content', 'Copyright Issue']),
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'dismissed', 'resolved']),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).optional(),
  image: z.string().trim().url().optional().or(z.literal('')),
});

export const updateBlockSchema = z.object({
  isBlocked: z.boolean(),
});

export const updateFeatureSchema = z.object({
  isFeatured: z.boolean(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export const updateRecipeStatusSchema = z.object({
  status: z.enum(['published', 'hidden']),
});
