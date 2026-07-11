"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { api, unwrap } from "@/lib/api";
import { JournalEntry, MOODS, Profile } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SharedEntryPage() {
  const { token } = useParams<{ token: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["shared", token],
    queryFn: () =>
      unwrap<{ entry: JournalEntry; owner: { username: string; profile: Profile }; permission: string }>(
        api.get(`/shares/public/${token}`)
      ),
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-2xl">This link isn't available</h1>
        <p className="mt-2 text-sm text-ink/50">It may have been revoked by the owner, or the link is incorrect.</p>
        <Link href="/" className="btn-secondary mt-6">Go to Ruth</Link>
      </main>
    );
  }

  const { entry, owner } = data;
  const mood = MOODS.find((m) => m.value === entry.mood);

  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-14 md:px-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.25em] text-ink/40">
        Shared by {owner.profile.displayName}
      </p>

      <article className="paper-card p-8">
        <p className="text-sm text-ink/45">{format(new Date(entry.entryDate), "EEEE, MMMM d, yyyy")}</p>
        <h1 className="mt-2 font-serif text-3xl leading-tight">{entry.title}</h1>
        {mood && <span className="mt-3 inline-block rounded-pill bg-accent/50 px-2.5 py-1 text-xs text-ink/70">{mood.emoji} {mood.label}</span>}

        <div
          className="prose prose-neutral mt-6 max-w-none text-[16px] leading-[1.8] text-text"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />

        {entry.photos.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {entry.photos.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.url} alt="" className="rounded-2xl object-cover" />
            ))}
          </div>
        )}
      </article>

      <p className="mt-10 text-center text-xs text-ink/35">Ruth — Document Yourself</p>
    </main>
  );
}
