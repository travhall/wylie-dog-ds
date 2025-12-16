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
      default: "rounded-md",
      text: "rounded h-4",
      circular: "rounded-full",
      rectangular: "rounded-sm",
    };

    const sizes = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-[var(--color-skeleton-background)]",
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
