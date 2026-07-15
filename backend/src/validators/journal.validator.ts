import { z } from "zod";

const moodEnum = z.enum([
  "HAPPY", "SAD", "EXCITED", "CALM", "ANXIOUS", "GRATEFUL",
  "ANGRY", "TIRED", "LOVED", "NEUTRAL", "HOPEFUL", "NOSTALGIC",
]);

const visibilityEnum = z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]);

export const createJournalSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Give your entry a title.").max(150),
    rawContent: z.string().min(1, "Write something before saving."),
    content: z.string().optional(), // if omitted, equals rawContent until AI transforms it
    mood: moodEnum.optional(),
    location: z.string().max(120).optional(),
    weather: z.string().max(60).optional(),
    tags: z.array(z.string().max(30)).max(15).optional(),
    isFavorite: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    visibility: visibilityEnum.optional(),
    entryDate: z.string().datetime().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateJournalSchema = z.object({
  body: createJournalSchema.shape.body.partial(),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().uuid() }),
});

export const listJournalsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    favoritesOnly: z.coerce.boolean().optional(),
    tag: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

export const searchJournalsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    q: z.string().optional(),
    mood: moodEnum.optional(),
    location: z.string().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    semantic: z.coerce.boolean().optional(),
  }),
  params: z.object({}).optional(),
});
