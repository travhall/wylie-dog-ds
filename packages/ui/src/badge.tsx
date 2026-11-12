// badge.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-(--space-badge-icon-gap) border-(length:--space-badge-border-width) font-(family-name:--badge-font-family) font-(--font-weight-badge-font-weight) leading-(--line-height-badge-line-height) transition-colors",
    "rounded-(--space-badge-radius)",
    // An icon child (an `Icon`, or any svg) takes the badge's icon size and the sm stroke (every
    // badge icon is 16px or less), whatever size it was given, and the label's colour through
    // currentColor. The stroke is non-scaling so it draws as written, like the Icon component's.
    "[&>svg]:shrink-0 [&>svg]:stroke-(length:--space-icon-stroke-width-sm) [&>svg_*]:[vector-effect:non-scaling-stroke]"
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
        info: "bg-(--color-badge-info-background) text-(--color-badge-info-text) border-(--color-badge-info-border)",
        destructive:
          "bg-(--color-badge-destructive-background) text-(--color-badge-destructive-text) border-(--color-badge-destructive-border)",
        outline:
          "bg-(--color-badge-outline-background) text-(--color-badge-outline-text) border-(--color-badge-outline-border)",
      },
      size: {
        sm: "px-(--space-badge-padding-x-sm) py-(--space-badge-padding-y-sm) text-(length:--font-size-badge-font-size-sm) [&>svg]:h-(--space-badge-icon-size-sm) [&>svg]:w-(--space-badge-icon-size-sm)",
        md: "px-(--space-badge-padding-x-md) py-(--space-badge-padding-y-md) text-(length:--font-size-badge-font-size-md) [&>svg]:h-(--space-badge-icon-size-md) [&>svg]:w-(--space-badge-icon-size-md)",
        lg: "px-(--space-badge-padding-x-lg) py-(--space-badge-padding-y-lg) text-(length:--font-size-badge-font-size-lg) [&>svg]:h-(--space-badge-icon-size-lg) [&>svg]:w-(--space-badge-icon-size-lg)",
      },
      interactive: {
        true: cn(
          "cursor-pointer",
          focusRingClasses,
          "disabled:cursor-not-allowed disabled:opacity-(--badge-opacity-disabled)"
        ),
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-default-background-hover) not-disabled:active:bg-(--color-badge-default-background-active)",
      },
      {
        variant: "secondary",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-secondary-background-hover) not-disabled:active:bg-(--color-badge-secondary-background-active)",
      },
      {
        variant: "success",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-success-background-hover) not-disabled:active:bg-(--color-badge-success-background-active)",
      },
      {
        variant: "warning",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-warning-background-hover) not-disabled:active:bg-(--color-badge-warning-background-active)",
      },
      {
        variant: "info",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-info-background-hover) not-disabled:active:bg-(--color-badge-info-background-active)",
      },
      {
        variant: "destructive",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-destructive-background-hover) not-disabled:active:bg-(--color-badge-destructive-background-active)",
      },
      {
        variant: "outline",
        interactive: true,
        className:
          "not-disabled:hover:bg-(--color-badge-outline-background-hover) not-disabled:active:bg-(--color-badge-outline-background-active)",
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
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, size, interactive }), className)}
        {...(interactive && !asChild ? { role: "button", tabIndex: 0 } : {})}
        {...props}
        {...(interactive && !asChild ? { onKeyDown: handleKeyDown } : {})}
      />
    );
  }
);

Badge.displayName = "Badge";
