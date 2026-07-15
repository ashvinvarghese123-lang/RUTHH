"use client";

import Link from "next/link";
import { Bell, Users, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api, unwrap } from "@/lib/api";

export function Topbar({ title }: { title: string }) {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => unwrap<{ unreadCount: number }>(api.get("/notifications")),
    refetchInterval: 60_000,
  });

  return (
    <header className="flex items-center justify-between px-4 py-5 sm:px-6 sm:py-6 md:px-10">
      <h1 className="font-serif text-2xl md:text-3xl">{title}</h1>
      <div className="flex items-center gap-1">
        <Link href="/search" className="rounded-full p-2 hover:bg-ink/5" aria-label="Search">
          <Search size={20} />
        </Link>
        <Link href="/friends" className="rounded-full p-2 hover:bg-ink/5" aria-label="Friends">
          <Users size={20} />
        </Link>
        <Link href="/notifications" className="relative rounded-full p-2 hover:bg-ink/5" aria-label="Notifications">
          <Bell size={20} />
          {!!data?.unreadCount && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent-dark" />
          )}
        </Link>
      </div>
    </header>
  );
}
