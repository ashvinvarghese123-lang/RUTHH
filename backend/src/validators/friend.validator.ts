import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  body: z.object({
    username: z.string().min(1, "Enter a username."),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const friendshipIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ friendshipId: z.string().uuid() }),
});

export const friendStatusParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ username: z.string().min(1) }),
});
