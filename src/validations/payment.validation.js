import { z } from 'zod';

export const checkoutSchema = z.object({
  recipeId: z.string().optional(),
});

export const confirmPaymentSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});
