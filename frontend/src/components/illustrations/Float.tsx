"use client";

import { ReactNode } from "react";
import clsx from "clsx";

/**
 * Wraps a paper illustration in a slow, ambient float animation.
 * Two speed variants (float / float-slow) and an optional delay so
 * multiple illustrations on one page don't move in lockstep.
 */
export function Float({
  children,
  speed = "float",
  delayMs = 0,
  className,
}: {
  children: ReactNode;
  speed?: "float" | "float-slow";
  delayMs?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(speed === "float" ? "animate-float" : "animate-float-slow", className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
