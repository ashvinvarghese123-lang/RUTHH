"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Heart, Lock, Users } from "lucide-react";
import { JournalEntry, MOODS } from "@/types";

export function JournalCard({ entry }: { entry: JournalEntry }) {
  const mood = MOODS.find((m) => m.value === entry.mood);
  const cover = entry.photos?.[0];
  const plainText = entry.content.replace(/<[^>]+>/g, " ").trim();

  return (
    <Link href={`/journal/${entry.id}`} className="paper-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      {cover && (
        <div className="aspect-[4/3] w-full overflow-hidden bg-ink/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cover.url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-center justify-between text-xs text-ink/45">
          <span>{format(new Date(entry.entryDate), "MMM d, yyyy")}</span>
          <div className="flex items-center gap-2">
            {entry.isFavorite && <Heart size={14} className="fill-ink/70 text-ink/70" />}
            {entry.isPrivate ? <Lock size={13} /> : <Users size={13} />}
          </div>
        </div>
        <h3 className="font-serif text-lg leading-snug">{entry.title}</h3>
        <p className="line-clamp-2 text-sm text-ink/55">{plainText}</p>
        {mood && (
          <span className="mt-auto w-fit rounded-pill bg-accent/50 px-2.5 py-1 text-xs text-ink/70">
            {mood.emoji} {mood.label}
          </span>
        )}
      </div>
    </Link>
  );
}
