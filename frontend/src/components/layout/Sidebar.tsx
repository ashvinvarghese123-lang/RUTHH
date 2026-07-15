"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, PenLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Kept deliberately minimal to match the app's 3-destination philosophy:
// Home, New Journal (the button below), and Profile (the card at the
// bottom, which also hosts Calendar/Gallery/Friends/Settings as tabs
// and links rather than separate top-level nav items).
const NAV_ITEMS = [{ href: "/home", label: "Home", icon: Home }];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink/8 bg-paper px-5 py-8">
      <Link href="/home" className="mb-10 flex items-center gap-2 px-2">
        <span className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="" className="h-6 w-6 object-contain" />
          <span className="font-serif text-2xl">Ruth</span>
        </span>
      </Link>

      <Link href="/journal/new" className="btn-primary mb-8 w-full">
        <PenLine size={16} />
        New Journal
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-accent/60 text-ink font-medium" : "text-ink/60 hover:bg-ink/5 hover:text-ink"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {user && (
        <Link
          href={`/profile/${user.username}`}
          className={clsx(
            "mt-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-ink/5",
            pathname?.startsWith("/profile") && "bg-accent/60"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-medium text-ink overflow-hidden">
            {user.profile.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.profile.profilePhoto} alt="" className="h-full w-full object-cover" />
            ) : (
              user.profile.displayName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{user.profile.displayName}</p>
            <p className="truncate text-xs text-ink/50">@{user.username}</p>
          </div>
        </Link>
      )}
    </aside>
  );
}
