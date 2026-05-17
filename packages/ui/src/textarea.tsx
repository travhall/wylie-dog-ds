import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const textareaVariants = cva(
  cn(
    "flex w-full border font-(--font-weight-textarea-font-weight) transition-colors",
    "rounded-(--space-textarea-radius)",
    "placeholder:text-(--color-input-placeholder)",
    "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-input-border-focus) focus:ring-offset-(--space-focus-ring-offset)",
    "disabled:cursor-not-allowed disabled:opacity-(--textarea-disabled-opacity)",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "min-h-(--space-textarea-min-height-sm) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size)",
        md: "min-h-(--space-textarea-min-height-md) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size)",
        lg: "min-h-(--space-textarea-min-height-lg) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size)",
      },
      resize: {
        none: "resize-none",
        both: "resize",
        horizontal: "resize-x",
        vertical: "resize-y",
      },
      textareaState: {
        default: "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
        error:   "border-(--color-input-border-error) bg-(--color-input-default-background)",
        success: "border-(--color-border-success) bg-(--color-input-default-background)",
      },
    },
    defaultVariants: {
      size: "md",
      resize: "vertical",
      textareaState: "default",
    },
  }
);

type TextareaVariantProps = VariantProps<typeof textareaVariants>;

export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Omit<TextareaVariantProps, "textareaState"> {
  /** Whether the textarea has an error */
  error?: boolean;
  /** Whether the textarea has a success/valid state */
  success?: boolean;
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
      success = false,
      size,
      resize,
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    const textareaState = error ? "error" : success ? "success" : "default";

    // Build aria-describedby from provided IDs
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <textarea
        className={cn(textareaVariants({ size, resize, textareaState }), className)}
        ref={ref}
        aria-invalid={error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
