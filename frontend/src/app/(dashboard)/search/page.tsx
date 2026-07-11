"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import clsx from "clsx";
import { Topbar } from "@/components/layout/Topbar";
import { Input } from "@/components/ui/Input";
import { JournalCard } from "@/components/journal/JournalCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { api, unwrap } from "@/lib/api";
import { JournalEntry, MOODS, Mood } from "@/types";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [mood, setMood] = useState<Mood | "">("");
  const [location, setLocation] = useState("");
  const [semantic, setSemantic] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["search", q, mood, location, semantic],
    queryFn: () =>
      unwrap<{ entries: JournalEntry[]; count: number }>(
        api.get("/search", { params: { q: q || undefined, mood: mood || undefined, location: location || undefined, semantic } })
      ),
    enabled: false,
  });

  function handleSearch() {
    setSubmitted(true);
    refetch();
  }

  return (
    <div>
      <Topbar title="Search" />
      <div className="px-4 pb-16 sm:px-6 md:px-10">
        <div className="paper-card p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Search titles, keywords, entries…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1"
            />
            <button onClick={handleSearch} className="btn-primary w-full sm:w-auto" aria-label="Search">
              <SearchIcon size={16} />
              <span className="sm:hidden">Search</span>
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select value={mood} onChange={(e) => setMood(e.target.value as Mood | "")} className="input-field w-full sm:w-auto">
              <option value="">Any mood</option>
              {MOODS.map((m) => <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>)}
            </select>
            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field w-full sm:w-auto"
            />
            <button
              type="button"
              onClick={() => setSemantic(!semantic)}
              className={clsx(
                "flex w-full items-center justify-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs transition-colors sm:w-auto",
                semantic ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:bg-ink/5"
              )}
            >
              <Sparkles size={13} /> AI semantic search
            </button>
          </div>
        </div>

        <div className="mt-8">
          {isFetching ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          ) : submitted && data ? (
            data.entries.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.entries.map((entry) => <JournalCard key={entry.id} entry={entry} />)}
              </div>
            ) : (
              <p className="py-16 text-center text-sm text-ink/40">No entries matched your search.</p>
            )
          ) : (
            <p className="py-16 text-center text-sm text-ink/40">Search across your journal by keyword, mood, or location.</p>
          )}
        </div>
      </div>
    </div>
  );
}
