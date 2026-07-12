"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { api } from "@/lib/api";

export function LikeButton({
  journalEntryId,
  initialLiked,
  initialCount,
  size = "md",
}: {
  journalEntryId: string;
  initialLiked: boolean;
  initialCount: number;
  size?: "sm" | "md";
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // in case this sits inside a <Link> card
    e.stopPropagation();
    if (busy) return;
    setBusy(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    try {
      if (nextLiked) {
        await api.post(`/journals/${journalEntryId}/like`);
      } else {
        await api.delete(`/journals/${journalEntryId}/like`);
      }
    } catch {
      // revert on failure
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    } finally {
      setBusy(false);
    }
  }

  const iconSize = size === "sm" ? 15 : 18;

  return (
    <button
      onClick={toggle}
      className={clsx(
        "flex items-center gap-1.5 text-ink/60 transition-colors hover:text-red-500",
        liked && "text-red-500"
      )}
      aria-pressed={liked}
      aria-label={liked ? "Unlike" : "Like"}
    >
      <Heart size={iconSize} className={liked ? "fill-red-500" : ""} />
      <span className={size === "sm" ? "text-xs" : "text-sm"}>{count > 0 ? count : ""}</span>
    </button>
  );
}
