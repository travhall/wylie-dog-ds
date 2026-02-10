// progress.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "destructive";
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizes = {
      sm: "h-(--space-progress-height)",
      md: "h-(--space-progress-height)",
      lg: "h-(--space-progress-height)",
    };

    const variants = {
      default: "bg-(--color-progress-default-fill)",
      success: "bg-(--color-progress-success-fill)",
      warning: "bg-(--color-progress-warning-fill)",
      destructive: "bg-(--color-progress-destructive-fill)",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden bg-(--color-progress-background)",
          "rounded-(--space-progress-radius)",
          sizes[size],
          className
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-(--transition-duration-slow) ease-in-out",
            variants[variant]
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
