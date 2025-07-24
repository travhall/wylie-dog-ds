// badge.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-[var(--color-badge-default-background)] text-[var(--color-badge-default-text)] border-[var(--color-badge-default-border)]",
      secondary:
        "bg-[var(--color-badge-secondary-background)] text-[var(--color-badge-secondary-text)] border-[var(--color-badge-secondary-border)]",
      success:
        "bg-[var(--color-badge-success-background)] text-[var(--color-badge-success-text)] border-[var(--color-badge-success-border)]",
      warning:
        "bg-[var(--color-badge-warning-background)] text-[var(--color-badge-warning-text)] border-[var(--color-badge-warning-border)]",
      destructive:
        "bg-[var(--color-badge-destructive-background)] text-[var(--color-badge-destructive-text)] border-[var(--color-badge-destructive-border)]",
      outline:
        "bg-[var(--color-badge-outline-background)] text-[var(--color-badge-outline-text)] border-[var(--color-badge-outline-border)]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-[var(--badge-radius)] border px-2.5 py-0.5 text-xs font-semibold transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
