"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { api, unwrap } from "@/lib/api";
import { MOODS } from "@/types";

export function CalendarView() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["calendar", cursor],
    queryFn: () =>
      unwrap<{ entriesByDay: Record<string, any[]> }>(
        api.get("/calendar", { params: cursor })
      ),
  });

  const firstOfMonth = new Date(cursor.year, cursor.month - 1, 1);
  const daysInMonth = new Date(cursor.year, cursor.month, 0).getDate();
  const startWeekday = firstOfMonth.getDay();
  const todayKey = new Date().toISOString().slice(0, 10);

  const cells = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function shift(delta: number) {
    let { year, month } = cursor;
    month += delta;
    if (month < 1) { month = 12; year -= 1; }
    if (month > 12) { month = 1; year += 1; }
    setCursor({ year, month });
  }

  return (
    <div className="paper-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-serif text-xl">
          {firstOfMonth.toLocaleString("default", { month: "long" })} {cursor.year}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => shift(-1)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => shift(1)} className="rounded-full p-2 hover:bg-ink/5" aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-xs text-ink/40">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${cursor.year}-${String(cursor.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const entries = data?.entriesByDay?.[key] ?? [];
          const isToday = key === todayKey;
          const primary = entries[0];
          const mood = primary ? MOODS.find((m) => m.value === primary.mood) : null;

          return (
            <button
              key={i}
              onClick={() => entries.length && router.push(`/journal/${primary.id}`)}
              className={clsx(
                "flex aspect-square flex-col items-center justify-center rounded-xl text-sm transition-colors",
                entries.length ? "bg-accent/40 hover:bg-accent/70" : "hover:bg-ink/5",
                isToday && "ring-1 ring-ink/40"
              )}
            >
              <span>{day}</span>
              {mood && <span className="text-xs">{mood.emoji}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
