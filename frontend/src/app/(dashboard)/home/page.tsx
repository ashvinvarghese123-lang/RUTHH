"use client";

import { useState } from "react";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { JournalCard } from "@/components/journal/JournalCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { useFeed } from "@/hooks/useFeed";
import { useAuth } from "@/context/AuthContext";
import { JournalEntry } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [allEntries, setAllEntries] = useState<JournalEntry[]>([]);
  const { data, isLoading, isFetching } = useFeed(page);

  // Append each newly-fetched page onto the running list (simple "load more" pagination).
  const seenIds = new Set(allEntries.map((e) => e.id));
  const merged = data ? [...allEntries, ...data.entries.filter((e) => !seenIds.has(e.id))] : allEntries;
  const hasMore = data ? page < data.totalPages : false;

  function loadMore() {
    if (data) setAllEntries(merged);
    setPage((p) => p + 1);
  }

  const entries = page === 1 ? data?.entries ?? [] : merged;

  return (
    <div>
      <Topbar title="Feed" />

      <div className="mx-auto max-w-2xl px-4 pb-24 sm:px-6 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-ink/45">
            {user ? `Welcome back, ${user.profile.displayName.split(" ")[0]}.` : ""}
          </p>
          <Link href="/journal/new" className="btn-primary">
            <PenLine size={15} /> Write
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-72 w-full" />)}
          </div>
        ) : entries.length ? (
          <div className="flex flex-col gap-5">
            {entries.map((entry) => (
              <JournalCard key={entry.id} entry={entry} showAuthor />
            ))}
          </div>
        ) : (
          <div className="paper-card flex flex-col items-center gap-3 py-16 text-center text-ink/50">
            <p>Your feed is quiet right now.</p>
            <p className="text-sm text-ink/40">
              Write your first entry, or add friends to see what they're sharing.
            </p>
            <Link href="/journal/new" className="btn-primary mt-2">
              <PenLine size={15} /> Write your first page
            </Link>
          </div>
        )}

        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={loadMore} isLoading={isFetching}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
