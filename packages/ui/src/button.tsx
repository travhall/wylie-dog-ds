// button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center font-(--font-weight-button-font-weight) leading-(--line-height-button-line-height) border transition-colors",
    "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-border-focus) focus:ring-offset-(--space-focus-ring-offset)",
    "disabled:opacity-(--button-disabled-opacity) disabled:pointer-events-none"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-(--color-button-primary-background) hover:bg-(--color-button-primary-background-hover) active:bg-(--color-button-primary-background-active) text-(--color-button-primary-text) border-(--color-button-primary-border)",
        secondary:
          "bg-(--color-button-secondary-background) hover:bg-(--color-button-secondary-background-hover) active:bg-(--color-button-secondary-background-active) text-(--color-button-secondary-text) border-(--color-button-secondary-border)",
        outline:
          "border border-(--color-button-outline-border) bg-(--color-button-outline-background) hover:bg-(--color-button-outline-background-hover) text-(--color-button-outline-text)",
        ghost:
          "bg-(--color-button-ghost-background) hover:bg-(--color-button-ghost-background-hover) active:bg-(--color-button-ghost-background-active) text-(--color-button-ghost-text) border-transparent",
        link: "text-(--color-button-link-text) underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
        destructive:
          "bg-(--color-button-destructive-background) hover:bg-(--color-button-destructive-background-hover) text-(--color-button-destructive-text) border-(--color-button-destructive-border)",
      },
      size: {
        default:
          "px-(--space-button-padding-x-md) py-(--space-button-padding-y-md) text-(length:--font-size-button-font-size-md) rounded-(--space-button-radius)",
        sm: "px-(--space-button-padding-x-sm) py-(--space-button-padding-y-sm) text-(length:--font-size-button-font-size-sm) rounded-(--space-button-radius)",
        md: "px-(--space-button-padding-x-md) py-(--space-button-padding-y-md) text-(length:--font-size-button-font-size-md) rounded-(--space-button-radius)",
        lg: "px-(--space-button-padding-x-lg) py-(--space-button-padding-y-lg) text-(length:--font-size-button-font-size-lg) rounded-(--space-button-radius)",
        icon: "h-(--space-button-icon-size) w-(--space-button-icon-size) rounded-(--space-button-radius)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled, children, ...props },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span
            className={cn(
              "inline-block w-(--space-icon-size-sm) h-(--space-icon-size-sm) border-(length:--border-width-2) border-current border-t-transparent rounded-(--border-radius-full) animate-spin",
              size !== "icon" && "mr-2"
            )}
            aria-hidden="true"
          />
        )}
        {!(loading && size === "icon") && children}
      </button>
    );
  }
);

Button.displayName = "Button";
