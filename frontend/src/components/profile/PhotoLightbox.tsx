"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Download, Trash2, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { ProfilePhoto } from "@/hooks/useProfile";

export function PhotoLightbox({
  photos,
  startIndex,
  isOwner,
  onClose,
  onDeleted,
}: {
  photos: ProfilePhoto[];
  startIndex: number;
  isOwner: boolean;
  onClose: () => void;
  onDeleted: (photoId: string) => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [deleting, setDeleting] = useState(false);
  const { show } = useToast();
  const photo = photos[index];
  if (!photo) return null;

  async function handleDownload() {
    try {
      const res = await fetch(photo.url, { mode: "cors" });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ruth-photo-${photo.id}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      show("Couldn't download that image. Try opening it in a new tab instead.", "error");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/photos/${photo.id}`);
      onDeleted(photo.id);
      show("Photo deleted.");
      if (photos.length <= 1) onClose();
      else setIndex((i) => Math.max(0, i - 1));
    } catch {
      show("Couldn't delete that photo. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95" onClick={onClose}>
      <div className="flex items-center justify-between p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="text-sm text-white/70">
          {format(new Date(photo.journalEntry.entryDate), "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/journal/${photo.journalEntry.id}`}
            className="flex items-center gap-1.5 rounded-pill border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10"
          >
            <BookOpen size={13} /> View journal
          </Link>
          <button onClick={handleDownload} className="rounded-full p-2 hover:bg-white/10" aria-label="Download">
            <Download size={18} />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-full p-2 hover:bg-white/10 disabled:opacity-50"
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4 pb-4" onClick={(e) => e.stopPropagation()}>
        {index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:left-6"
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />
        {index < photos.length - 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:right-6"
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      <p className="px-4 pb-4 text-center text-sm text-white/60">{photo.journalEntry.title}</p>
    </div>
  );
}
