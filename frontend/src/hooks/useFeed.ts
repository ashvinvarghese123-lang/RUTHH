"use client";

import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";
import { JournalEntry } from "@/types";

export function useFeed(page = 1) {
  return useQuery({
    queryKey: ["feed", page],
    queryFn: () =>
      unwrap<{ entries: JournalEntry[]; total: number; totalPages: number }>(
        api.get("/feed", { params: { page, limit: 15 } })
      ),
  });
}
