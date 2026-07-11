"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, className, children, disabled, ...props }, ref) => {
    const base =
      variant === "primary"
        ? "btn-primary"
        : variant === "secondary"
        ? "btn-secondary"
        : variant === "danger"
        ? "inline-flex items-center justify-center gap-2 rounded-pill bg-red-500 text-white px-6 py-3 text-sm font-medium tracking-wide transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-600 active:translate-y-0"
        : "text-ink/70 hover:text-ink transition-colors text-sm";

    return (
      <button
        ref={ref}
        className={clsx(base, isLoading && "opacity-70 cursor-wait", className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? "Please wait…" : children}
      </button>
    );
  }
);
Button.displayName = "Button";
