"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Pencil, Share2, Trash2, Heart, MapPin, CloudSun } from "lucide-react";
import { useJournal, useDeleteJournal } from "@/hooks/useJournals";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ShareModal } from "@/components/share/ShareModal";
import { MOODS } from "@/types";
import { useToast } from "@/components/ui/Toast";

export default function JournalViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useJournal(id);
  const deleteJournal = useDeleteJournal();
  const { show } = useToast();
  const [shareOpen, setShareOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-10 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const entry = data?.entry;
  if (!entry) return null;

  const mood = MOODS.find((m) => m.value === entry.mood);

  async function handleDelete() {
    if (!entry) return;
    if (!confirm("Delete this journal page? This can't be undone.")) return;
    await deleteJournal.mutateAsync(entry.id);
    show("Entry deleted.");
    router.push("/home");
  }

  return (
    <article className="mx-auto max-w-2xl px-4 pb-32 pt-8 sm:px-6 sm:pt-10 md:px-10">
      <div className="mb-6 flex items-center justify-between text-sm text-ink/50">
        <span>{format(new Date(entry.entryDate), "EEEE, MMMM d, yyyy")}</span>
        <div className="flex items-center gap-3">
          <Link href={`/journal/${entry.id}/edit`} aria-label="Edit" className="hover:text-ink">
            <Pencil size={17} />
          </Link>
          <button onClick={() => setShareOpen(true)} aria-label="Share" className="hover:text-ink">
            <Share2 size={17} />
          </button>
          <button onClick={handleDelete} aria-label="Delete" className="hover:text-red-500">
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <h1 className="mb-3 font-serif text-3xl leading-tight sm:text-4xl">{entry.title}</h1>

      <div className="mb-8 flex flex-wrap items-center gap-3 text-xs text-ink/50">
        {mood && <span className="rounded-pill bg-accent/50 px-2.5 py-1 text-ink/70">{mood.emoji} {mood.label}</span>}
        {entry.location && (
          <span className="flex items-center gap-1"><MapPin size={12} /> {entry.location}</span>
        )}
        {entry.weather && (
          <span className="flex items-center gap-1"><CloudSun size={12} /> {entry.weather}</span>
        )}
        {entry.isFavorite && <Heart size={13} className="fill-ink/60 text-ink/60" />}
      </div>

      {entry.suggestedQuote && (
        <blockquote className="mb-8 border-l-2 border-accent pl-4 font-serif text-lg italic text-ink/70">
          “{entry.suggestedQuote}”
        </blockquote>
      )}

      <div
        className="prose prose-neutral max-w-none text-[17px] leading-[1.8] text-text prose-p:my-4"
        dangerouslySetInnerHTML={{ __html: entry.content }}
      />

      {entry.photos.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3">
          {entry.photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={photo.id} src={photo.url} alt="" className="rounded-2xl object-cover" />
          ))}
        </div>
      )}

      {entry.reflection && (
        <div className="mt-10 rounded-2xl bg-ink/5 p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">Reflection</p>
          <p className="text-sm text-ink/70">{entry.reflection}</p>
        </div>
      )}

      {entry.gratitude && (
        <div className="mt-4 rounded-2xl bg-accent/30 p-5">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink/40">Gratitude</p>
          <p className="text-sm text-ink/70">{entry.gratitude}</p>
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {entry.tags.map((t) => (
            <span key={t} className="rounded-pill bg-ink/5 px-3 py-1 text-xs text-ink/60">#{t}</span>
          ))}
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} journalEntryId={entry.id} />
    </article>
  );
}
