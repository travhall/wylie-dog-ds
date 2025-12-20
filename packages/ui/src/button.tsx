// button.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "destructive";
  size?: "default" | "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variants = {
      default:
        "bg-[var(--color-button-primary-background)] hover:bg-[var(--color-button-primary-background-hover)] active:bg-[var(--color-button-primary-background-active)] text-[var(--color-button-primary-text)] border-[var(--color-button-primary-border)]",
      primary:
        "bg-[var(--color-button-primary-background)] hover:bg-[var(--color-button-primary-background-hover)] active:bg-[var(--color-button-primary-background-active)] text-[var(--color-button-primary-text)] border-[var(--color-button-primary-border)]",
      secondary:
        "bg-[var(--color-button-secondary-background)] hover:bg-[var(--color-button-secondary-background-hover)] active:bg-[var(--color-button-secondary-background-active)] text-[var(--color-button-secondary-text)] border-[var(--color-button-secondary-border)]",
      outline:
        "border border-[var(--color-button-outline-border)] bg-transparent hover:bg-[var(--color-button-outline-hover)] text-[var(--color-button-outline-text)]",
      ghost:
        "bg-[var(--color-button-ghost-background)] hover:bg-[var(--color-button-ghost-background-hover)] active:bg-[var(--color-button-ghost-background-active)] text-[var(--color-button-ghost-text)] border-transparent",
      link: "text-[var(--color-button-link-text)] underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
      destructive:
        "bg-[var(--color-background-danger)] hover:bg-[var(--color-red-700)] text-[var(--color-text-inverse)] border-[var(--color-background-danger)]",
    };

    const sizes = {
      default: "h-10 px-4 text-sm rounded-md",
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 text-sm rounded-md",
      lg: "h-12 px-6 text-base rounded-lg",
      icon: "h-10 w-10 rounded-md",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="mr-2" aria-hidden="true">
            Loading...
          </span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
