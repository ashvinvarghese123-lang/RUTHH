import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ok } from "../utils/apiResponse";
import { embedQuery } from "../services/ai.service";

/**
 * Searches the current user's journal entries by title, mood, location,
 * date range and free-text keyword. When `semantic=true` and an OpenAI
 * key is configured, ranks free-text matches by embedding similarity;
 * otherwise falls back to keyword matching against title/content/tags.
 */
export const searchJournals = asyncHandler(async (req: Request, res: Response) => {
  const { q, mood, location, from, to, semantic } = req.query as {
    q?: string; mood?: string; location?: string; from?: string; to?: string; semantic?: boolean;
  };

  const userId = req.user!.userId;

  const where: any = { userId };
  if (mood) where.mood = mood;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (from || to) {
    where.entryDate = {};
    if (from) where.entryDate.gte = new Date(from);
    if (to) where.entryDate.lte = new Date(to);
  }
  if (q && !semantic) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  let entries = await prisma.journalEntry.findMany({
    where,
    orderBy: { entryDate: "desc" },
    include: { photos: { take: 1 } },
  });

  if (q && semantic) {
    entries = await semanticRank(q, entries);
  }

  return ok(res, { entries, count: entries.length });
});

async function semanticRank(query: string, entries: any[]) {
  const queryEmbedding = await embedQuery(query);
  if (!queryEmbedding) {
    // No AI key configured — degrade gracefully to keyword filtering.
    const lower = query.toLowerCase();
    return entries.filter(
      (e) => e.title.toLowerCase().includes(lower) || e.content.toLowerCase().includes(lower)
    );
  }

  // NOTE: for a production system, entry embeddings should be pre-computed
  // and stored (e.g. in a pgvector column) rather than computed on the fly.
  // This inline version keeps the demo self-contained.
  const scored = await Promise.all(
    entries.map(async (e) => {
      const embedding = await embedQuery(`${e.title} ${e.content}`);
      const score = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0;
      return { entry: e, score };
    })
  );

  return scored.sort((a, b) => b.score - a.score).map((s) => s.entry);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}
