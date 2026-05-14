// badge.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center border font-(--font-weight-badge-font-weight) leading-(--line-height-badge-line-height) transition-colors",
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
        sm: "px-(--space-badge-padding-x-sm) py-(--space-badge-padding-y-sm) text-(length:--font-size-badge-font-size-sm)",
        md: "px-(--space-badge-padding-x-md) py-(--space-badge-padding-y-md) text-(length:--font-size-badge-font-size-md)",
        lg: "px-(--space-badge-padding-x-lg) py-(--space-badge-padding-y-lg) text-(length:--font-size-badge-font-size-lg)",
      },
      interactive: {
        true: cn(
          "cursor-pointer",
          "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-border-focus) focus:ring-offset-(--space-focus-ring-offset)",
          "disabled:opacity-(--state-opacity-disabled) disabled:cursor-not-allowed"
        ),
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        interactive: true,
        className:
          "hover:bg-(--color-badge-default-background-hover) focus:bg-(--color-badge-default-background-focus) disabled:bg-(--color-badge-default-background-disabled)",
      },
      {
        variant: "secondary",
        interactive: true,
        className:
          "hover:bg-(--color-badge-secondary-background-hover) focus:bg-(--color-badge-secondary-background-focus) disabled:bg-(--color-badge-secondary-background-disabled)",
      },
      {
        variant: "success",
        interactive: true,
        className:
          "hover:bg-(--color-badge-success-background-hover) focus:bg-(--color-badge-success-background-focus) disabled:bg-(--color-badge-success-background-disabled)",
      },
      {
        variant: "warning",
        interactive: true,
        className:
          "hover:bg-(--color-badge-warning-background-hover) focus:bg-(--color-badge-warning-background-focus) disabled:bg-(--color-badge-warning-background-disabled)",
      },
      {
        variant: "destructive",
        interactive: true,
        className:
          "hover:bg-(--color-badge-destructive-background-hover) focus:bg-(--color-badge-destructive-background-focus) disabled:bg-(--color-badge-destructive-background-disabled)",
      },
      {
        variant: "outline",
        interactive: true,
        className:
          "hover:bg-(--color-badge-outline-background-hover) focus:bg-(--color-badge-outline-background-focus) disabled:bg-(--color-badge-outline-background-disabled)",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Render the badge's styles on a child element (e.g. `<a>` or `<button>`). */
  asChild?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    { className, variant, size, interactive, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, size, interactive }), className)}
        {...(interactive && !asChild ? { role: "button", tabIndex: 0 } : {})}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
