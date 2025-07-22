// skeleton.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "text" | "circular" | "rectangular";
  size?: "sm" | "md" | "lg" | "xl";
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", size, ...props }, ref) => {
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
        {...props}
      />
    );
  }
);
Skeleton.displayName = "Skeleton";
