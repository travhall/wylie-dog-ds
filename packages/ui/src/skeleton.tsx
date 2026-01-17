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
      default: "rounded-(--spacing-skeleton-radius)",
      text: "h-(--spacing-skeleton-height-text) rounded-(--spacing-skeleton-radius)",
      circular: "rounded-(--spacing-skeleton-rounded-full)",
      rectangular: "rounded-(--spacing-skeleton-rounded-sm)",
    };

    const sizes = {
      sm: "h-(--spacing-skeleton-height-text) w-(--spacing-skeleton-height-text)",
      md: "h-(--spacing-skeleton-height-title) w-(--spacing-skeleton-height-title)",
      lg: "h-(--spacing-skeleton-height-button) w-(--spacing-skeleton-height-button)",
      xl: "h-(--spacing-skeleton-height-avatar) w-(--spacing-skeleton-height-avatar)",
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
