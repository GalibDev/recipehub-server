import { z } from 'zod';

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
