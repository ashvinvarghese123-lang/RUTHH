"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { JournalEntry } from "@/types";

export function useProfileJournals(username: string | undefined, page = 1) {
  return useQuery({
    queryKey: ["profile-journals", username, page],
    queryFn: () =>
      unwrap<{ entries: JournalEntry[]; total: number; totalPages: number }>(
        api.get(`/profile/${username}/journals`, { params: { page, limit: 12 } })
      ),
    enabled: Boolean(username),
  });
}

export interface ProfilePhoto {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  journalEntry: { id: string; title: string; entryDate: string };
}

export function useProfilePhotos(username: string | undefined, year?: string, month?: string) {
  return useQuery({
    queryKey: ["profile-photos", username, year, month],
    queryFn: () =>
      unwrap<{ photos: ProfilePhoto[] }>(
        api.get(`/profile/${username}/photos`, { params: { year, month } })
      ),
    enabled: Boolean(username),
  });
}
