"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";
import { useOptionalFormField } from "./form-field-context";

export const inputVariants = cva(
  cn(
    "flex w-full border-(length:--space-input-border-width) transition-colors",
    "rounded-(--space-input-radius)",
    "placeholder:text-(--color-input-placeholder)",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--input-opacity-disabled)",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "py-(--space-input-padding-y-sm) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-sm) leading-(--line-height-input-line-height)",
        md: "py-(--space-input-padding-y-md) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-md) leading-(--line-height-input-line-height)",
        lg: "py-(--space-input-padding-y-lg) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-lg) leading-(--line-height-input-line-height)",
      },
      inputState: {
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
      inputState: "default",
    },
  }
);

type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<InputVariantProps, "inputState"> {
  /** Whether the input has an error. Inside a `FormField` it follows the field's `error`. */
  error?: boolean;
  /** Whether the input has a success/valid state */
  success?: boolean;
  /** ID of error message element for aria-describedby (inside a `FormField`, the field's) */
  errorId?: string;
  /** ID of description element for aria-describedby (inside a `FormField`, the field's) */
  descriptionId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      success = false,
      size,
      type = "text",
      id,
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    // Inside a FormField the input takes its id, error state, description and required state from
    // the field, so the label points at it without a wrapper; any prop set here wins.
    const field = useOptionalFormField();
    const isError = error ?? field?.isInvalid ?? false;
    const inputState = isError ? "error" : success ? "success" : "default";

    const typeStyles: Partial<Record<string, string>> = {
      number: [
        "[&::-webkit-inner-spin-button]:appearance-auto",
        "[&::-webkit-outer-spin-button]:appearance-auto",
        "[&::-webkit-inner-spin-button]:opacity-(--input-spin-button-opacity)",
      ].join(" "),
      search: "appearance-none",
      date: "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
    };

    // Build aria-describedby from provided IDs
    const describedBy = [
      descriptionId ?? field?.descriptionId,
      errorId ?? field?.errorId,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <input
        ref={ref}
        type={type}
        id={id ?? field?.id}
        aria-invalid={isError}
        aria-describedby={describedBy || undefined}
        aria-required={field?.isRequired || undefined}
        className={cn(
          inputVariants({ size, inputState }),
          typeStyles[type],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
