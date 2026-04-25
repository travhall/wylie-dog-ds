import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const textareaVariants = cva(
  cn(
    "flex w-full border font-normal transition-colors",
    "rounded-(--space-textarea-radius)",
    "placeholder:text-(--color-input-placeholder)",
    "focus:outline-none focus:ring-2 focus:ring-(--color-input-border-focus) focus:ring-offset-1",
    "disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
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
      error: {
        true: "border-(--color-input-border-error) bg-(--color-input-default-background)",
        false:
          "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
      },
    },
    defaultVariants: {
      size: "md",
      resize: "vertical",
      error: false,
    },
  }
);

type TextareaVariantProps = VariantProps<typeof textareaVariants>;

export interface TextareaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    Omit<TextareaVariantProps, "error"> {
  /** Whether the textarea has an error */
  error?: boolean;
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
      size,
      resize,
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    // Build aria-describedby from provided IDs
    const describedBy = [descriptionId, errorId].filter(Boolean).join(" ");

    return (
      <textarea
        className={cn(textareaVariants({ size, resize, error }), className)}
        ref={ref}
        aria-invalid={error}
        aria-describedby={describedBy || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
