import { z } from 'zod';

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
