"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Send, Trash2 } from "lucide-react";
import { useComments, useAddComment, useDeleteComment } from "@/hooks/useComments";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";

export function CommentSection({ journalEntryId, entryOwnerId }: { journalEntryId: string; entryOwnerId: string }) {
  const { data, isLoading } = useComments(journalEntryId);
  const addComment = useAddComment(journalEntryId);
  const deleteComment = useDeleteComment(journalEntryId);
  const { user } = useAuth();
  const { show } = useToast();
  const [body, setBody] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      await addComment.mutateAsync(body.trim());
      setBody("");
    } catch {
      show("Couldn't post your comment. Please try again.", "error");
    }
  }

  return (
    <div className="mt-10">
      <p className="mb-4 text-sm font-medium text-ink/70">
        Comments{data?.comments?.length ? ` (${data.comments.length})` : ""}
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment…"
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={addComment.isPending || !body.trim()}
          className="flex items-center justify-center rounded-full bg-ink px-3 text-paper disabled:opacity-40"
          aria-label="Post comment"
        >
          <Send size={16} />
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-ink/40">Loading comments…</p>
      ) : data?.comments?.length ? (
        <div className="flex flex-col gap-4">
          {data.comments.map((c) => {
            const canDelete = user?.id === c.userId || user?.id === entryOwnerId;
            return (
              <div key={c.id} className="flex gap-3">
                <Link href={`/profile/${c.user.username}`} className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-medium text-ink">
                    {c.user.profile.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.user.profile.profilePhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      c.user.profile.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Link href={`/profile/${c.user.username}`} className="text-sm font-medium hover:underline">
                      {c.user.profile.displayName}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-ink/35">
                      <span>{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                      {canDelete && (
                        <button
                          onClick={() => deleteComment.mutate(c.id)}
                          aria-label="Delete comment"
                          className="hover:text-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 text-sm text-ink/70">{c.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ink/40">No comments yet.</p>
      )}
    </div>
  );
}
