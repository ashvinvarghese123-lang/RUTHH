"use client";

import { useMutation } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { AIMode, JournalEntry } from "@/types";

interface RewriteInput {
  rawContent: string;
  mode: AIMode;
  mood?: string;
  location?: string;
  weather?: string;
  photoCount?: number;
  journalEntryId?: string;
}

interface RewriteResult {
  content: string;
  suggestedTitle?: string;
  suggestedQuote?: string;
  reflection?: string;
  gratitude?: string;
}

export function useAIRewrite() {
  return useMutation({
    mutationFn: (input: RewriteInput) =>
      unwrap<{ entry?: JournalEntry; aiResult: RewriteResult }>(api.post("/ai/rewrite", input)),
  });
}
