"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Heart, Lock, Users, Globe, MessageCircle } from "lucide-react";
import { JournalEntry, MOODS } from "@/types";
import { LikeButton } from "@/components/journal/LikeButton";

const VISIBILITY_ICON = { PUBLIC: Globe, FRIENDS: Users, PRIVATE: Lock };

export function JournalCard({ entry, showAuthor = false }: { entry: JournalEntry; showAuthor?: boolean }) {
  const mood = MOODS.find((m) => m.value === entry.mood);
  const cover = entry.photos?.[0];
  const plainText = entry.content.replace(/<[^>]+>/g, " ").trim();
  const VisibilityIcon = VISIBILITY_ICON[entry.visibility];
  const showSocial = entry.likeCount !== undefined;

  return (
    <div className="paper-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      {showAuthor && entry.user && (
        <Link
          href={`/profile/${entry.user.username}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 px-5 pt-4 text-sm hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-medium text-ink">
            {entry.user.profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.user.profile.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              entry.user.profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-medium text-ink/80">{entry.user.profile.displayName}</span>
        </Link>
      )}

      <Link href={`/journal/${entry.id}`} className="flex flex-1 flex-col">
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
              <VisibilityIcon size={13} />
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

      {showSocial && (
        <div className="flex items-center gap-4 border-t border-ink/8 px-5 py-3">
          <LikeButton
            journalEntryId={entry.id}
            initialLiked={entry.likedByMe ?? false}
            initialCount={entry.likeCount ?? 0}
            size="sm"
          />
          <Link
            href={`/journal/${entry.id}`}
            className="flex items-center gap-1.5 text-ink/60 hover:text-ink"
          >
            <MessageCircle size={15} />
            <span className="text-xs">{entry.commentCount ? entry.commentCount : ""}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
