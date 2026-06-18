import { z } from 'zod';

export const createReportSchema = z.object({
  recipeId: z.string().min(1, 'Recipe id is required'),
  reason: z.enum(['Spam', 'Offensive Content', 'Copyright Issue']),
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'dismissed', 'resolved']),
});
