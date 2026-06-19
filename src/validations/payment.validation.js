import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'recipeId must be a valid MongoDB id');

export const checkoutSchema = z.object({
  recipeId: objectId.optional(),
});

export const confirmPaymentSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});
