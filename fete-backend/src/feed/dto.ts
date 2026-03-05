import { z } from 'zod';

export const GetFeedQuerySchema = z.object({
  sort: z.enum(['latest', 'trending']).default('latest'),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(30),
});

export type GetFeedQueryDto = z.infer<typeof GetFeedQuerySchema>;
