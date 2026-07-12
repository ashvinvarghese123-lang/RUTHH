import { z } from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    body: z.string().min(1, "Write something before posting.").max(1000),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }), // journal entry id
});

export const journalIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const commentIdParamSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({ commentId: z.string().uuid() }),
});

export const feedQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(15),
  }),
  params: z.object({}).optional(),
});
