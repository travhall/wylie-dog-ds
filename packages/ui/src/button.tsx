// button.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary:
        "bg-[var(--color-button-primary-background)] hover:bg-[var(--color-button-primary-background-hover)] active:bg-[var(--color-button-primary-background-active)] text-[var(--color-button-primary-text)] border-[var(--color-button-primary-border)]",
      secondary:
        "bg-[var(--color-button-secondary-background)] hover:bg-[var(--color-button-secondary-background-hover)] active:bg-[var(--color-button-secondary-background-active)] text-[var(--color-button-secondary-text)] border-[var(--color-button-secondary-border)]",
      ghost:
        "bg-[var(--color-button-ghost-background)] hover:bg-[var(--color-button-ghost-background-hover)] active:bg-[var(--color-button-ghost-background-active)] text-[var(--color-button-ghost-text)] border-transparent",
      destructive:
        "bg-[var(--color-background-danger)] hover:bg-[var(--color-red-700)] text-[var(--color-text-inverse)] border-[var(--color-background-danger)]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs rounded-md",
      md: "h-10 px-4 text-sm rounded-md",
      lg: "h-12 px-6 text-base rounded-lg",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium border transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
