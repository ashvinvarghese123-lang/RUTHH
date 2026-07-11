"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { format } from "date-fns";
import { Topbar } from "@/components/layout/Topbar";
import { JournalCard } from "@/components/journal/JournalCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useJournalList } from "@/hooks/useJournals";

type Tab = "grid" | "timeline" | "favorites";

export default function GalleryPage() {
  const [tab, setTab] = useState<Tab>("grid");
  const { data, isLoading } = useJournalList({ favoritesOnly: tab === "favorites" || undefined, limit: 60 });

  const entries = data?.entries ?? [];
  const allPhotos = entries.flatMap((e) => e.photos.map((p) => ({ ...p, entryId: e.id })));

  return (
    <div>
      <Topbar title="Gallery" />
      <div className="px-4 pb-16 sm:px-6 md:px-10">
        <div className="mb-6 flex gap-2">
          {(["grid", "timeline", "favorites"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "rounded-pill border px-4 py-1.5 text-sm capitalize transition-colors",
                tab === t ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:bg-ink/5"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square" />)}
          </div>
        ) : tab === "grid" ? (
          allPhotos.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {allPhotos.map((photo) => (
                <Link key={photo.id} href={`/journal/${photo.entryId}`} className="block aspect-square overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt="" className="h-full w-full object-cover transition-transform hover:scale-105" />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState label="No photos yet — attach some when you write your next entry." />
          )
        ) : tab === "timeline" ? (
          entries.length ? (
            <div className="flex flex-col gap-8">
              {entries.map((entry) => (
                <div key={entry.id} className="flex gap-4">
                  <div className="w-20 shrink-0 pt-1 text-right text-xs text-ink/40">
                    {format(new Date(entry.entryDate), "MMM d")}
                  </div>
                  <div className="flex-1 border-l border-ink/10 pl-4">
                    <JournalCard entry={entry} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState label="Your timeline will fill up as you write." />
          )
        ) : entries.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => <JournalCard key={entry.id} entry={entry} />)}
          </div>
        ) : (
          <EmptyState label="Mark entries as favorites to find them here." />
        )}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-16 text-center text-sm text-ink/40">{label}</p>;
}
