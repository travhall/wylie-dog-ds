import React from "react";
import { cn } from "./lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to resize */
  resize?: "none" | "both" | "horizontal" | "vertical";
  /** ID of error message element for aria-describedby */
  errorId?: string;
  /** ID of description element for aria-describedby */
  descriptionId?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error = false,
      size = "md",
      resize = "vertical",
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "min-h-(--spacing-textarea-min-height-sm) px-(--spacing-textarea-padding) py-(--spacing-textarea-padding) text-(length:--spacing-textarea-font-size)",
      md: "min-h-(--spacing-textarea-min-height-md) px-(--spacing-textarea-padding) py-(--spacing-textarea-padding) text-(length:--spacing-textarea-font-size)",
      lg: "min-h-(--spacing-textarea-min-height-lg) px-(--spacing-textarea-padding) py-(--spacing-textarea-padding) text-(length:--spacing-textarea-font-size)",
    };

    const resizeClasses = {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x",
      vertical: "resize-y",
    };

    // Build aria-describedby from provided IDs
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <textarea
        className={cn(
          // Base styles
          "flex w-full border font-normal transition-colors",
          "rounded-(--spacing-textarea-radius)",
          "placeholder:text-(--color-input-placeholder)",
          "focus:outline-none focus:ring-2 focus:ring-(--color-input-border-focus) focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Background and border
          error
            ? "border-(--color-input-border-error) bg-(--color-input-background)"
            : "border-(--color-input-border) bg-(--color-input-background) hover:bg-(--color-input-background-hover)",
          // Text color
          "text-(--color-input-text)",
          // Size variants
          sizes[size],
          // Resize behavior
          resizeClasses[resize],
          className
        )}
        ref={ref}
        aria-invalid={error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
