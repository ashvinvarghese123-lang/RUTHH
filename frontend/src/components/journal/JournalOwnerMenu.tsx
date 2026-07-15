"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Pin, PinOff, Share2, Trash2, Globe, Users, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useDeleteJournal } from "@/hooks/useJournals";
import { useToast } from "@/components/ui/Toast";
import { useQueryClient } from "@tanstack/react-query";
import { ShareModal } from "@/components/share/ShareModal";
import { JournalEntry, Visibility } from "@/types";

const VISIBILITY_CYCLE: { value: Visibility; label: string; icon: React.ReactNode }[] = [
  { value: "PUBLIC", label: "Public", icon: <Globe size={13} /> },
  { value: "FRIENDS", label: "Friends", icon: <Users size={13} /> },
  { value: "PRIVATE", label: "Private", icon: <Lock size={13} /> },
];

/** A "⋮" overflow menu for journal cards on your own profile — edit, pin, change privacy, share, delete. */
export function JournalOwnerMenu({ entry }: { entry: JournalEntry }) {
  const [open, setOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { show } = useToast();
  const deleteJournal = useDeleteJournal();
  const qc = useQueryClient();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPrivacyOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function togglePin(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/journals/${entry.id}`, { isPinned: !entry.isPinned });
      qc.invalidateQueries({ queryKey: ["profile-journals"] });
      show(entry.isPinned ? "Unpinned." : "Pinned to the top of your journals.");
    } catch {
      show("Couldn't update that. Please try again.", "error");
    }
    setOpen(false);
  }

  async function changeVisibility(e: React.MouseEvent, visibility: Visibility) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.patch(`/journals/${entry.id}`, { visibility });
      qc.invalidateQueries({ queryKey: ["profile-journals"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      show("Privacy updated.");
    } catch {
      show("Couldn't update privacy. Please try again.", "error");
    }
    setOpen(false);
    setPrivacyOpen(false);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this journal page? This can't be undone.")) return;
    await deleteJournal.mutateAsync(entry.id);
    qc.invalidateQueries({ queryKey: ["profile-journals"] });
    show("Entry deleted.");
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm hover:bg-black/60"
        aria-label="Journal options"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-2xl border border-ink/10 bg-card shadow-lift">
          <Link
            href={`/journal/${entry.id}/edit`}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-ink/5"
            onClick={(e) => e.stopPropagation()}
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            onClick={togglePin}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-ink/5"
          >
            {entry.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
            {entry.isPinned ? "Unpin" : "Pin to top"}
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPrivacyOpen(!privacyOpen);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-ink/5"
            >
              {VISIBILITY_CYCLE.find((v) => v.value === entry.visibility)?.icon}
              Change privacy
            </button>
            {privacyOpen && (
              <div className="border-t border-ink/8 bg-ink/[0.02]">
                {VISIBILITY_CYCLE.map((v) => (
                  <button
                    key={v.value}
                    onClick={(e) => changeVisibility(e, v.value)}
                    className="flex w-full items-center gap-2.5 px-6 py-2 text-left text-xs hover:bg-ink/5"
                  >
                    {v.icon} {v.label}
                    {entry.visibility === v.value && <span className="ml-auto text-ink/40">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShareOpen(true);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm hover:bg-ink/5"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} journalEntryId={entry.id} />
    </div>
  );
}
