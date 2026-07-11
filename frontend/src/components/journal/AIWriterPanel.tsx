"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { AI_MODES, AIMode } from "@/types";
import { useAIRewrite } from "@/hooks/useAI";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function AIWriterPanel({
  rawContent,
  mood,
  location,
  weather,
  photoCount,
  onApply,
}: {
  rawContent: string;
  mood?: string;
  location?: string;
  weather?: string;
  photoCount: number;
  onApply: (result: { content: string; suggestedTitle?: string; suggestedQuote?: string; reflection?: string; gratitude?: string }) => void;
}) {
  const [mode, setMode] = useState<AIMode>("DIARY_STYLE");
  const rewrite = useAIRewrite();
  const { show } = useToast();

  async function handleGenerate() {
    if (!rawContent.trim()) {
      show("Write a few notes first — Ruth needs something to work with.", "error");
      return;
    }
    try {
      const { aiResult } = await rewrite.mutateAsync({ rawContent, mode, mood, location, weather, photoCount });
      onApply(aiResult);
      show("Your entry has been rewritten. Feel free to edit anything further.");
    } catch {
      show("The AI writer couldn't complete that request. Please try again.", "error");
    }
  }

  return (
    <div className="paper-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-ink/60" />
        <h3 className="text-sm font-medium text-ink/80">AI Writer</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {AI_MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={clsx(
              "rounded-xl border px-3 py-2.5 text-left text-xs transition-colors",
              mode === m.value ? "border-ink bg-ink text-paper" : "border-ink/12 hover:bg-ink/5"
            )}
          >
            <p className="font-medium">{m.label}</p>
            <p className={clsx("mt-0.5", mode === m.value ? "text-paper/70" : "text-ink/50")}>{m.description}</p>
          </button>
        ))}
      </div>

      <Button onClick={handleGenerate} isLoading={rewrite.isPending} className="mt-4 w-full">
        <Sparkles size={15} />
        Transform with AI
      </Button>

      <p className="mt-3 text-xs leading-relaxed text-ink/40">
        Ruth only rewrites what you've written — it never invents events or exaggerates your notes.
      </p>
    </div>
  );
}
