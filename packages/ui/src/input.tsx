// input.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Whether the input has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, error = false, size = "md", type = "text", ...props },
    ref
  ) => {
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex w-full rounded-md border transition-colors",
          "placeholder:text-[var(--color-input-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-input-border-focus)] focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[var(--color-input-border-error)] bg-[var(--color-input-background)]"
            : "border-[var(--color-input-border)] bg-[var(--color-input-background)] hover:bg-[var(--color-input-background-hover)]",
          "text-[var(--color-input-text)]",
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
