import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
  image: z.union([z.string().trim().url(), z.literal('')]).optional(),
});
