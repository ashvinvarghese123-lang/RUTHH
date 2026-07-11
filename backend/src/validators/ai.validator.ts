import { z } from "zod";

export const rewriteEntrySchema = z.object({
  body: z.object({
    rawContent: z.string().min(1, "Write something before asking Ruth to rewrite it."),
    mode: z.enum(["KEEP_ORIGINAL", "DIARY_STYLE", "STORYTELLING", "MINIMAL"]),
    mood: z.string().optional(),
    location: z.string().optional(),
    weather: z.string().optional(),
    photoCount: z.number().int().min(0).optional(),
    journalEntryId: z.string().uuid().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
