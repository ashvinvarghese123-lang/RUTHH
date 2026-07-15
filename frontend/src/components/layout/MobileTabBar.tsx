"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Home, PenLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const homeActive = pathname === "/home";
  const profileActive = pathname?.startsWith("/profile");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-ink/8 bg-card/95 py-2 backdrop-blur md:hidden">
      <Link
        href="/home"
        className={clsx("flex flex-col items-center gap-1 px-6 py-1 text-[11px]", homeActive ? "text-ink" : "text-ink/40")}
      >
        <Home size={22} />
        Home
      </Link>

      <Link
        href="/journal/new"
        aria-label="New Journal"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lift transition-transform active:scale-95"
      >
        <PenLine size={22} />
      </Link>

      <Link
        href={user ? `/profile/${user.username}` : "/home"}
        className={clsx("flex flex-col items-center gap-1 px-6 py-1 text-[11px]", profileActive ? "text-ink" : "text-ink/40")}
      >
        <span
          className={clsx(
            "flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-accent text-[10px] font-medium text-ink",
            profileActive && "ring-2 ring-ink ring-offset-1 ring-offset-card"
          )}
        >
          {user?.profile.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.profile.profilePhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            user?.profile.displayName?.charAt(0).toUpperCase() ?? "?"
          )}
        </span>
        Profile
      </Link>
    </nav>
  );
}
