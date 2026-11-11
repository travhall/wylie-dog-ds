// button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-(--space-button-icon-gap) font-(--font-weight-button-font-weight) leading-(--line-height-button-line-height) border-(length:--button-border-width) transition-colors",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--button-opacity-disabled)"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-(--color-button-primary-background) not-disabled:hover:bg-(--color-button-primary-background-hover) not-disabled:active:bg-(--color-button-primary-background-active) text-(--color-button-primary-text) border-(--color-button-primary-border)",
        secondary:
          "bg-(--color-button-secondary-background) not-disabled:hover:bg-(--color-button-secondary-background-hover) not-disabled:active:bg-(--color-button-secondary-background-active) text-(--color-button-secondary-text) border-(--color-button-secondary-border)",
        outline:
          "border-(--color-button-outline-border) bg-(--color-button-outline-background) not-disabled:hover:bg-(--color-button-outline-background-hover) not-disabled:active:bg-(--color-button-outline-background-active) text-(--color-button-outline-text)",
        ghost:
          "bg-(--color-button-ghost-background) not-disabled:hover:bg-(--color-button-ghost-background-hover) not-disabled:active:bg-(--color-button-ghost-background-active) text-(--color-button-ghost-text) border-transparent",
        link: "text-(--color-button-link-text) underline-offset-(--space-button-link-underline-offset) not-disabled:hover:underline bg-transparent border-transparent p-0 h-auto",
        destructive:
          "bg-(--color-button-destructive-background) not-disabled:hover:bg-(--color-button-destructive-background-hover) not-disabled:active:bg-(--color-button-destructive-background-active) text-(--color-button-destructive-text) border-(--color-button-destructive-border)",
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
    compoundVariants: [
      {
        // A link is plain underlined text: the size padding must not apply to it. Compound
        // classes come after the size classes, so these win where `p-0` on the variant lost.
        variant: "link",
        size: ["default", "sm", "md", "lg"],
        className: "px-0 py-0 h-auto",
      },
    ],
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
    const isIconLoading = loading && size === "icon";
    const ariaLabel =
      props["aria-label"] ?? (isIconLoading ? "Loading" : undefined);

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        {...props}
      >
        {loading && (
          <span
            className="inline-block w-(--space-button-spinner-size) h-(--space-button-spinner-size) border-(length:--space-button-spinner-border-width) border-current border-t-transparent rounded-(--space-button-spinner-radius) wd-motion-spin [--wd-motion-duration:var(--duration-button-spinner-duration)] [--wd-motion-easing:var(--button-spinner-easing)]"
            aria-hidden="true"
          />
        )}
        {!(loading && size === "icon") && children}
      </button>
    );
  }
);

Button.displayName = "Button";
