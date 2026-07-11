"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, CalendarDays, PenLine, Images, Search } from "lucide-react";

const TABS = [
  { href: "/home", icon: Home, label: "Home" },
  { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/journal/new", icon: PenLine, label: "Add" },
  { href: "/gallery", icon: Images, label: "Gallery" },
  { href: "/search", icon: Search, label: "Search" },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-ink/8 bg-card/95 py-2 backdrop-blur md:hidden">
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx("flex flex-col items-center gap-1 px-3 py-1 text-[11px]", active ? "text-ink" : "text-ink/40")}
          >
            <Icon size={20} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
