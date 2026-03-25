import { z } from 'zod';

export const createChatroomSchema = z.object({
  roomName: z.string().min(1),
});

export type CreateChatroomInput = z.infer<typeof createChatroomSchema>;
