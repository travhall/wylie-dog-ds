// badge.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center border font-semibold transition-colors",
    "rounded-(--space-badge-radius)"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-(--color-badge-default-background) text-(--color-badge-default-text) border-(--color-badge-default-border)",
        secondary:
          "bg-(--color-badge-secondary-background) text-(--color-badge-secondary-text) border-(--color-badge-secondary-border)",
        success:
          "bg-(--color-badge-success-background) text-(--color-badge-success-text) border-(--color-badge-success-border)",
        warning:
          "bg-(--color-badge-warning-background) text-(--color-badge-warning-text) border-(--color-badge-warning-border)",
        destructive:
          "bg-(--color-badge-destructive-background) text-(--color-badge-destructive-text) border-(--color-badge-destructive-border)",
        outline:
          "bg-(--color-badge-outline-background) text-(--color-badge-outline-text) border-(--color-badge-outline-border)",
      },
      size: {
        sm: "px-(--space-badge-padding-sm) text-(length:--font-size-badge-font-size-sm)",
        md: "px-(--space-badge-padding-md) text-(length:--font-size-badge-font-size-md)",
        lg: "px-(--space-badge-padding-lg) text-(length:--font-size-badge-font-size-lg)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
