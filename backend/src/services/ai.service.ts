import OpenAI from "openai";
import { env } from "../config/env";
import { logger } from "../utils/logger";

// Treat obviously-placeholder keys (like the one shipped in .env.example) as "no key",
// so a fresh checkout degrades gracefully instead of making a doomed API call.
const hasRealKey = Boolean(env.openai.apiKey) && !env.openai.apiKey.includes("replace_me");
const client = hasRealKey ? new OpenAI({ apiKey: env.openai.apiKey }) : null;

export type AIMode = "KEEP_ORIGINAL" | "DIARY_STYLE" | "STORYTELLING" | "MINIMAL";

export interface AITransformInput {
  rawContent: string;
  mode: AIMode;
  mood?: string;
  location?: string;
  weather?: string;
  photoCount?: number;
}

export interface AITransformResult {
  content: string;
  suggestedTitle?: string;
  suggestedQuote?: string;
  reflection?: string;
  gratitude?: string;
  photoPlacement?: { paragraphIndex: number }[];
}

// ------------------------------------------------------------
// Prompt templates
// ------------------------------------------------------------
// The system prompt encodes Ruth's non-negotiable editorial rules:
// preserve meaning, never invent events, never exaggerate, never
// drop details, write in first person. Mode-specific instructions
// only change *style*, never these rules.
// ------------------------------------------------------------

const BASE_RULES = `You are Ruth's journal writing assistant. Your job is to turn a person's rough,
unpolished notes into a beautifully written journal entry while staying strictly
faithful to what they actually wrote.

Non-negotiable rules:
- Preserve the original meaning and every factual detail exactly. Do not invent events,
  people, places, or feelings that were not mentioned or clearly implied.
- Never exaggerate emotions or outcomes beyond what the notes support.
- Never remove details the person included, even small ones.
- Always write in first person, past tense, as the journal owner.
- Correct grammar and spelling; improve flow and readability.
- Do not add generic filler like "it was a day I'll never forget" unless the notes support it.
- Return ONLY strict JSON matching the requested schema. No markdown fences, no commentary.`;

const MODE_INSTRUCTIONS: Record<AIMode, string> = {
  KEEP_ORIGINAL:
    "Mode: Keep Original. Only fix grammar, spelling and punctuation. Keep sentence structure and wording as close to the original as possible. Do not add literary flourishes.",
  DIARY_STYLE:
    "Mode: Diary Style. Rewrite as a warm, natural, first-person diary entry — the way a thoughtful person would write in their personal journal. 2-4 short paragraphs.",
  STORYTELLING:
    "Mode: Storytelling. Rewrite with cinematic, vivid, sensory language and a clear narrative arc, while staying 100% factually faithful to the notes. Slightly longer, evocative but not purple prose.",
  MINIMAL:
    "Mode: Minimal. Produce a short, clean, condensed version — 1-2 tight sentences or a short paragraph capturing only the essence.",
};

function buildUserPrompt(input: AITransformInput): string {
  const context = [
    input.mood ? `Mood: ${input.mood}` : null,
    input.location ? `Location: ${input.location}` : null,
    input.weather ? `Weather: ${input.weather}` : null,
    input.photoCount ? `The entry has ${input.photoCount} photo(s) attached that should be distributed across the paragraphs.` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `${MODE_INSTRUCTIONS[input.mode]}

${context ? `Context:\n${context}\n` : ""}
Raw notes from the user:
"""
${input.rawContent}
"""

Respond with strict JSON in exactly this shape:
{
  "content": "the rewritten journal entry, as HTML with <p> paragraphs",
  "suggestedTitle": "a short evocative title (omit if KEEP_ORIGINAL or MINIMAL mode)",
  "suggestedQuote": "one short quote/line that captures the entry's spirit, or null",
  "reflection": "one optional reflective sentence, or null",
  "gratitude": "one optional gratitude sentence if the notes support it, or null",
  "paragraphCount": number of <p> paragraphs in content
}`;
}

/**
 * Transforms a user's rough notes into a polished journal entry.
 * Falls back to a light local transformation (paragraph-wrapping only)
 * if no OpenAI key is configured, so the app remains usable in dev
 * without external credentials.
 */
export async function transformEntry(input: AITransformInput): Promise<AITransformResult> {
  if (!client) {
    return localFallback(input);
  }

  try {
    const completion = await client.chat.completions.create({
      model: env.openai.model,
      temperature: 0.6,
      messages: [
        { role: "system", content: BASE_RULES },
        { role: "user", content: buildUserPrompt(input) },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from OpenAI.");

    const parsed = JSON.parse(raw);

    return {
      content: parsed.content ?? input.rawContent,
      suggestedTitle: parsed.suggestedTitle ?? undefined,
      suggestedQuote: parsed.suggestedQuote ?? undefined,
      reflection: parsed.reflection ?? undefined,
      gratitude: parsed.gratitude ?? undefined,
      photoPlacement: distributePhotos(input.photoCount ?? 0, parsed.paragraphCount ?? 1),
    };
  } catch (err) {
    // Bad/expired key, no billing configured, rate limit, network hiccup, malformed
    // response, etc. — never let the AI writer hard-fail the editor. Degrade instead.
    logger.warn(`AI writer falling back to local formatting: ${err instanceof Error ? err.message : String(err)}`);
    return localFallback(input);
  }
}

/** Evenly distributes photo indices across available paragraphs (chronological fallback). */
function distributePhotos(photoCount: number, paragraphCount: number) {
  if (photoCount === 0 || paragraphCount === 0) return [];
  const step = Math.max(1, Math.floor(paragraphCount / photoCount));
  return Array.from({ length: photoCount }, (_, i) => ({
    paragraphIndex: Math.min(i * step, paragraphCount - 1),
  }));
}

function localFallback(input: AITransformInput): AITransformResult {
  const paragraphs = input.rawContent
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const content = (paragraphs.length ? paragraphs : [input.rawContent])
    .map((p) => `<p>${p.charAt(0).toUpperCase()}${p.slice(1)}</p>`)
    .join("");

  return {
    content,
    photoPlacement: distributePhotos(input.photoCount ?? 0, paragraphs.length || 1),
  };
}

/**
 * Lightweight semantic-ish search fallback: when OPENAI_API_KEY is present,
 * uses embeddings to rank entries by relevance to the query. Without a key,
 * callers should fall back to plain keyword search (see search.controller.ts).
 */
export async function embedQuery(query: string): Promise<number[] | null> {
  if (!client) return null;
  const res = await client.embeddings.create({ model: "text-embedding-3-small", input: query });
  return res.data[0]?.embedding ?? null;
}
