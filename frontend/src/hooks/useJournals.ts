"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { JournalEntry } from "@/types";

export function useJournalList(
  params: { page?: number; limit?: number; favoritesOnly?: boolean; tag?: string } = {}
) {
  return useQuery({
    queryKey: ["journals", params],
    queryFn: () =>
      unwrap<{ entries: JournalEntry[]; total: number; totalPages: number }>(
        api.get("/journals", { params })
      ),
  });
}

export function useJournal(id: string | undefined) {
  return useQuery({
    queryKey: ["journal", id],
    queryFn: () => unwrap<{ entry: JournalEntry }>(api.get(`/journals/${id}`)),
    enabled: Boolean(id),
  });
}

export function useHomeSummary() {
  return useQuery({
    queryKey: ["home-summary"],
    queryFn: () =>
      unwrap<{ todayEntry: JournalEntry | null; recentEntries: JournalEntry[]; totalEntries: number }>(
        api.get("/journals/home-summary")
      ),
  });
}

export function useMemories() {
  return useQuery({
    queryKey: ["memories"],
    queryFn: () =>
      unwrap<{ memories: { yearsAgo: number; entries: JournalEntry[] }[] }>(api.get("/journals/memories")),
  });
}

export function useCreateJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<JournalEntry> & { title: string; rawContent: string }) =>
      unwrap<{ entry: JournalEntry }>(api.post("/journals", payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["journals"] });
      qc.invalidateQueries({ queryKey: ["home-summary"] });
    },
  });
}

export function useUpdateJournal(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<JournalEntry>) =>
      unwrap<{ entry: JournalEntry }>(api.patch(`/journals/${id}`, payload)),
    onSuccess: (data) => {
      qc.setQueryData(["journal", id], { entry: data.entry });
      qc.invalidateQueries({ queryKey: ["journals"] });
    },
  });
}

export function useDeleteJournal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => unwrap(api.delete(`/journals/${id}`)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journals"] }),
  });
}
