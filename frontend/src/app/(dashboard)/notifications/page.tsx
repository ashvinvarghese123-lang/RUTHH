"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import clsx from "clsx";
import { Topbar } from "@/components/layout/Topbar";
import { api, unwrap } from "@/lib/api";
import { Notification } from "@/types";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => unwrap<{ notifications: Notification[]; unreadCount: number }>(api.get("/notifications")),
  });

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <div>
      <Topbar title="Notifications" />
      <div className="mx-auto max-w-xl px-4 pb-24 sm:px-6 md:px-10">
        {isLoading ? (
          <p className="py-16 text-center text-sm text-ink/40">Loading…</p>
        ) : data?.notifications?.length ? (
          <div className="flex flex-col gap-2">
            {data.notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={clsx("paper-card p-4 text-left transition-opacity", n.isRead && "opacity-60")}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{n.title}</p>
                  <span className="text-xs text-ink/35">{format(new Date(n.createdAt), "MMM d")}</span>
                </div>
                <p className="mt-1 text-sm text-ink/55">{n.body}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-ink/40">You're all caught up.</p>
        )}
      </div>
    </div>
  );
}
