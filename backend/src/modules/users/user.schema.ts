import { z } from 'zod';

export const searchUsersSchema = z.object({
  q: z.string().min(2),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
