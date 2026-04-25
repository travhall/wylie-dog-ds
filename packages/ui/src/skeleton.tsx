// skeleton.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const skeletonVariants = cva(
  "animate-pulse bg-(--color-skeleton-background)",
  {
    variants: {
      variant: {
        default: "rounded-(--space-skeleton-radius)",
        text: "h-(--space-skeleton-height-text) rounded-(--space-skeleton-radius)",
        circular: "rounded-(--space-skeleton-rounded-full)",
        rectangular: "rounded-(--space-skeleton-rounded-sm)",
      },
      size: {
        sm: "h-(--space-skeleton-height-text) w-(--space-skeleton-height-text)",
        md: "h-(--space-skeleton-height-title) w-(--space-skeleton-height-title)",
        lg: "h-(--space-skeleton-height-button) w-(--space-skeleton-height-button)",
        xl: "h-(--space-skeleton-height-avatar) w-(--space-skeleton-height-avatar)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SkeletonProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Custom loading message for screen readers */
  loadingText?: string;
  /** Whether to show loading message to screen readers */
  showLoadingText?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant,
      size,
      loadingText = "Loading content",
      showLoadingText = true,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(skeletonVariants({ variant, size }), className)}
      role="status"
      aria-live="polite"
      aria-label={showLoadingText ? loadingText : undefined}
      {...props}
    >
      {showLoadingText && <span className="sr-only">{loadingText}</span>}
    </div>
  )
);
Skeleton.displayName = "Skeleton";
