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
  size?: "sm" | "md" | "lg";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants = {
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
    };

    const sizes = {
      sm: "px-(--spacing-badge-padding-sm) text-(length:--font-size-badge-font-size-sm)",
      md: "px-(--spacing-badge-padding-md) text-(length:--font-size-badge-font-size-md)",
      lg: "px-(--spacing-badge-padding-lg) text-(length:--font-size-badge-font-size-lg)",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center border font-semibold transition-colors",
          "rounded-(--spacing-badge-radius)",
          sizes[size],
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
