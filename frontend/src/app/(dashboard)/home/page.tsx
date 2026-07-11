"use client";

import Link from "next/link";
import { format } from "date-fns";
import { PenLine } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { JournalCard } from "@/components/journal/JournalCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useHomeSummary, useMemories } from "@/hooks/useJournals";
import { useAuth } from "@/context/AuthContext";
import { Float, Pencil, StickyNote } from "@/components/illustrations";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { user } = useAuth();
  const { data, isLoading } = useHomeSummary();
  const { data: memoriesData } = useMemories();

  return (
    <div>
      <Topbar title="Home" />

      <div className="relative px-4 sm:px-6 md:px-10">
        <Float speed="float-slow" className="pointer-events-none absolute right-6 top-0 hidden opacity-50 lg:block">
          <StickyNote size={40} />
        </Float>

        <p className="text-sm text-ink/45">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        <h2 className="mt-1 font-serif text-3xl">
          {greeting()}{user ? `, ${user.profile.displayName.split(" ")[0]}` : ""}.
        </h2>

        {/* ---- Today's entry ---- */}
        <section className="mt-8">
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : data?.todayEntry ? (
            <JournalCard entry={data.todayEntry} />
          ) : (
            <Link
              href="/journal/new"
              className="paper-card flex flex-col items-center justify-center gap-3 py-12 text-center text-ink/50 transition-colors hover:bg-ink/5"
            >
              <Pencil size={36} />
              <p>You haven't written today yet.</p>
              <span className="btn-primary mt-1">
                <PenLine size={15} /> Write today's page
              </span>
            </Link>
          )}
        </section>

        {/* ---- Memories ---- */}
        {!!memoriesData?.memories?.length && (
          <section className="mt-12">
            <h3 className="mb-4 font-serif text-xl">On this day</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {memoriesData.memories.map((m) =>
                m.entries.map((entry) => (
                  <div key={entry.id} className="relative">
                    <span className="absolute -top-2 left-4 z-10 rounded-pill bg-ink px-2.5 py-0.5 text-[11px] text-paper">
                      {m.yearsAgo === 1 ? "1 year ago" : `${m.yearsAgo} years ago`}
                    </span>
                    <JournalCard entry={entry} />
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ---- Recent entries ---- */}
        <section className="mt-12 pb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-serif text-xl">Recent entries</h3>
            <Link href="/gallery" className="text-sm text-ink/50 hover:text-ink">View all</Link>
          </div>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          ) : data?.recentEntries?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.recentEntries.map((entry) => <JournalCard key={entry.id} entry={entry} />)}
            </div>
          ) : (
            <p className="text-sm text-ink/40">Your written pages will appear here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
