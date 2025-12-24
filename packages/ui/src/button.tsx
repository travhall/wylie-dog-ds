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
        "bg-(--color-button-primary-background) hover:bg-(--color-button-primary-background-hover) active:bg-(--color-button-primary-background-active) text-(--color-button-primary-text) border-(--color-button-primary-border)",
      primary:
        "bg-(--color-button-primary-background) hover:bg-(--color-button-primary-background-hover) active:bg-(--color-button-primary-background-active) text-(--color-button-primary-text) border-(--color-button-primary-border)",
      secondary:
        "bg-(--color-button-secondary-background) hover:bg-(--color-button-secondary-background-hover) active:bg-(--color-button-secondary-background-active) text-(--color-button-secondary-text) border-(--color-button-secondary-border)",
      outline:
        "border border-(--color-button-outline-border) bg-transparent hover:bg-(--color-button-outline-hover) text-(--color-button-outline-text)",
      ghost:
        "bg-(--color-button-ghost-background) hover:bg-(--color-button-ghost-background-hover) active:bg-(--color-button-ghost-background-active) text-(--color-button-ghost-text) border-transparent",
      link: "text-(--color-button-link-text) underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
      destructive:
        "bg-(--color-background-danger) hover:bg-(--color-red-700) text-(--color-text-inverse) border-(--color-background-danger)",
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
