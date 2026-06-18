import { z } from 'zod';

export const updateBlockSchema = z.object({
  isBlocked: z.boolean(),
});

export const updateFeatureSchema = z.object({
  isFeatured: z.boolean(),
});
