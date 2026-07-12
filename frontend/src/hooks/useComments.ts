"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { Comment } from "@/types";

export function useComments(journalEntryId: string | undefined) {
  return useQuery({
    queryKey: ["comments", journalEntryId],
    queryFn: () => unwrap<{ comments: Comment[] }>(api.get(`/journals/${journalEntryId}/comments`)),
    enabled: Boolean(journalEntryId),
  });
}

export function useAddComment(journalEntryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) =>
      unwrap<{ comment: Comment }>(api.post(`/journals/${journalEntryId}/comments`, { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", journalEntryId] }),
  });
}

export function useDeleteComment(journalEntryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => unwrap(api.delete(`/comments/${commentId}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", journalEntryId] }),
  });
}
