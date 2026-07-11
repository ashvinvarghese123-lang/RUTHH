"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { PermissionLevel, SharedEntrySummary } from "@/types";

export function useSharesForEntry(journalEntryId: string | undefined) {
  return useQuery({
    queryKey: ["shares", journalEntryId],
    queryFn: () => unwrap<{ shares: any[] }>(api.get(`/shares/entry/${journalEntryId}`)),
    enabled: Boolean(journalEntryId),
  });
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ["shared-with-me"],
    queryFn: () => unwrap<{ shares: SharedEntrySummary[] }>(api.get("/shares/shared-with-me")),
  });
}

export function useCreateShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      journalEntryId: string;
      username?: string;
      email?: string;
      generateLink?: boolean;
      permission: PermissionLevel;
    }) => unwrap<{ share: any; shareLink?: string }>(api.post("/shares", payload)),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["shares", variables.journalEntryId] });
    },
  });
}

export function useRevokeShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) => unwrap(api.delete(`/shares/${shareId}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shares"] }),
  });
}
