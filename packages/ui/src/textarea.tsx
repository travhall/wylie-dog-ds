"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";
import { useOptionalFormField } from "./form-field-context";

export const textareaVariants = cva(
  cn(
    "flex w-full border-(length:--space-textarea-border-width) font-(--font-weight-textarea-font-weight) transition-colors",
    "rounded-(--space-textarea-radius)",
    "placeholder:text-(--color-input-placeholder)",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--textarea-opacity-disabled)",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "min-h-(--space-textarea-min-height-sm) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size-sm) leading-(--line-height-textarea-line-height)",
        md: "min-h-(--space-textarea-min-height-md) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size-md) leading-(--line-height-textarea-line-height)",
        lg: "min-h-(--space-textarea-min-height-lg) px-(--space-textarea-padding) py-(--space-textarea-padding) text-(length:--font-size-textarea-font-size-lg) leading-(--line-height-textarea-line-height)",
      },
      resize: {
        none: "resize-none",
        both: "resize",
        horizontal: "resize-x",
        vertical: "resize-y",
      },
      textareaState: {
        default:
          "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
        error:
          "border-(--color-input-border-error) bg-(--color-input-default-background)",
        success:
          "border-(--color-input-border-success) bg-(--color-input-default-background)",
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
  /** Whether the textarea has an error. Inside a `FormField` it follows the field's `error`. */
  error?: boolean;
  /** Whether the textarea has a success/valid state */
  success?: boolean;
  /** ID of error message element for aria-describedby (inside a `FormField`, the field's) */
  errorId?: string;
  /** ID of description element for aria-describedby (inside a `FormField`, the field's) */
  descriptionId?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      success = false,
      size,
      resize,
      id,
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    // Inside a FormField the textarea takes its id, error state, description and required state
    // from the field, so the label points at it without a wrapper; any prop set here wins.
    const field = useOptionalFormField();
    const isError = error ?? field?.isInvalid ?? false;
    const textareaState = isError ? "error" : success ? "success" : "default";

    // Build aria-describedby from provided IDs
    const describedBy = [
      descriptionId ?? field?.descriptionId,
      errorId ?? field?.errorId,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <textarea
        className={cn(
          textareaVariants({ size, resize, textareaState }),
          className
        )}
        ref={ref}
        id={id ?? field?.id}
        aria-invalid={isError}
        aria-describedby={describedBy || undefined}
        aria-required={field?.isRequired || undefined}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
