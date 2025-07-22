import React from "react";
import { cn } from "./lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Whether the textarea has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to resize */
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error = false, 
    size = "md", 
    resize = "vertical",
    ...props 
  }, ref) => {
    const sizes = {
      sm: "min-h-[80px] px-3 py-2 text-xs",
      md: "min-h-[100px] px-3 py-2 text-sm",
      lg: "min-h-[120px] px-4 py-3 text-base",
    };

    const resizeClasses = {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x", 
      vertical: "resize-y",
    };

    return (
      <textarea
        className={cn(
          // Base styles
          "flex w-full rounded-md border font-normal transition-colors",
          "placeholder:text-[var(--color-input-placeholder)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-input-border-focus)] focus:ring-offset-1",
          "disabled:cursor-not-allowed disabled:opacity-50",
          // Background and border
          error
            ? "border-[var(--color-input-border-error)] bg-[var(--color-input-background)]"
            : "border-[var(--color-input-border)] bg-[var(--color-input-background)] hover:bg-[var(--color-input-background-hover)]",
          // Text color
          "text-[var(--color-input-text)]",
          // Size variants
          sizes[size],
          // Resize behavior
          resizeClasses[resize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";