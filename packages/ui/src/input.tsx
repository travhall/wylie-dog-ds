import React from "react";
import { cn } from "./lib/utils";

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  /** Whether the input has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** ID of description element for aria-describedby */
  descriptionId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error = false,
      size = "md",
      type = "text",
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-3 text-sm",
      lg: "h-12 px-4 text-base",
    };

    // Build aria-describedby from provided IDs
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={error}
        aria-describedby={describedBy || undefined}
        className={cn(
          "flex w-full rounded-md border transition-colors",
          "placeholder:text-(--color-input-placeholder)",
          "focus:outline-none focus:ring-2 focus:ring-(--color-input-border-focus) focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-(--color-input-border-error) bg-(--color-input-background)"
            : "border-(--color-input-border) bg-(--color-input-background) hover:bg-(--color-input-background-hover)",
          "text-(--color-input-text)",
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
