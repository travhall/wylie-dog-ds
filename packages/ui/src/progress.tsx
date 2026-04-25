// progress.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const progressVariants = cva(
  cn(
    "relative w-full overflow-hidden bg-(--color-progress-background)",
    "rounded-(--space-progress-radius)"
  ),
  {
    variants: {
      size: {
        sm: "h-(--space-progress-height)",
        md: "h-(--space-progress-height)",
        lg: "h-(--space-progress-height)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-(--duration-slow) ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-(--color-progress-default-fill)",
        success: "bg-(--color-progress-success-fill)",
        warning: "bg-(--color-progress-warning-fill)",
        destructive: "bg-(--color-progress-destructive-fill)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof progressIndicatorVariants> {
  value?: number;
  max?: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, size, variant, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        className={cn(progressVariants({ size }), className)}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        {...props}
      >
        <div
          className={progressIndicatorVariants({ variant })}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";
