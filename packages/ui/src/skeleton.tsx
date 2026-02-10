// skeleton.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom loading message for screen readers */
  loadingText?: string;
  /** Whether to show loading message to screen readers */
  showLoadingText?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "default",
      size,
      loadingText = "Loading content",
      showLoadingText = true,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "rounded-(--space-skeleton-radius)",
      text: "h-(--space-skeleton-height-text) rounded-(--space-skeleton-radius)",
      circular: "rounded-(--space-skeleton-rounded-full)",
      rectangular: "rounded-(--space-skeleton-rounded-sm)",
    };

    const sizes = {
      sm: "h-(--space-skeleton-height-text) w-(--space-skeleton-height-text)",
      md: "h-(--space-skeleton-height-title) w-(--space-skeleton-height-title)",
      lg: "h-(--space-skeleton-height-button) w-(--space-skeleton-height-button)",
      xl: "h-(--space-skeleton-height-avatar) w-(--space-skeleton-height-avatar)",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-(--color-skeleton-background)",
          variants[variant],
          size && sizes[size],
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={showLoadingText ? loadingText : undefined}
        {...props}
      >
        {showLoadingText && <span className="sr-only">{loadingText}</span>}
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";
