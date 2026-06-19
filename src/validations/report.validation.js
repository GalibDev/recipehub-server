import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Recipe id must be a valid MongoDB id');

export const createReportSchema = z.object({
  recipeId: objectId,
  reason: z.enum(['Spam', 'Offensive Content', 'Copyright Issue']),
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'dismissed', 'resolved']),
});
