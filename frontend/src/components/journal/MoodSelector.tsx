"use client";

import clsx from "clsx";
import { MOODS, Mood } from "@/types";

export function MoodSelector({ value, onChange }: { value: Mood; onChange: (mood: Mood) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((m) => (
        <button
          key={m.value}
          type="button"
          onClick={() => onChange(m.value)}
          className={clsx(
            "flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-sm transition-colors",
            value === m.value ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/70 hover:bg-ink/5"
          )}
        >
          <span>{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
