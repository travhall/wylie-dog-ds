// input.tsx
import React from "react";

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  variant?: "default" | "error";
  size?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant = "default", size = "md", type = "text", ...props },
    ref
  ) => {
    const variants = {
      default:
        "border-[var(--color-input-border)] focus:border-[var(--color-border-focus)] focus:ring-[var(--color-border-focus)]",
      error:
        "border-[var(--color-input-border-error)] focus:border-[var(--color-input-border-error)] focus:ring-[var(--color-input-border-error)]",
    };

    const sizes = {
      sm: "h-[var(--input-height-sm)] text-xs",
      md: "h-[var(--input-height-md)] text-sm",
      lg: "h-[var(--input-height-lg)] text-base",
    };

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full rounded-[var(--input-radius)] border bg-[var(--color-background-primary)]",
          "px-[var(--input-padding-x)] py-2 text-[var(--color-input-text)]",
          "placeholder:text-[var(--color-input-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:bg-[var(--color-input-disabled-background)] disabled:text-[var(--color-input-disabled-text)]",
          "transition-colors",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
