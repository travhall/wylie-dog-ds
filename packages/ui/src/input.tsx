import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const inputVariants = cva(
  cn(
    "flex w-full border transition-colors",
    "rounded-(--space-input-radius)",
    "placeholder:text-(--color-input-placeholder)",
    "focus:outline-none focus:ring-2 focus:ring-(--color-input-border-focus) focus:ring-offset-1",
    "disabled:cursor-not-allowed disabled:bg-(--color-input-disabled-background) disabled:text-(--color-input-disabled-text)",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "h-(--space-input-height-sm) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-sm)",
        md: "h-(--space-input-height-md) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-md)",
        lg: "h-(--space-input-height-lg) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-lg)",
      },
      error: {
        true: "border-(--color-input-border-error) bg-(--color-input-default-background)",
        false:
          "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  }
);

type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputProps
  extends
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Omit<InputVariantProps, "error"> {
  /** Whether the input has an error */
  error?: boolean;
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
      size,
      type = "text",
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    // Type-aware styling for native browser chrome
    const typeStyles: Partial<Record<string, string>> = {
      number: [
        "[&::-webkit-inner-spin-button]:appearance-auto",
        "[&::-webkit-outer-spin-button]:appearance-auto",
        "[&::-webkit-inner-spin-button]:opacity-100",
      ].join(" "),
      search: "appearance-none",
      date: "[&::-webkit-calendar-picker-indicator]:cursor-pointer",
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
          inputVariants({ size, error }),
          typeStyles[type],
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
