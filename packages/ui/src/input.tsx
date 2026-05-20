import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const inputVariants = cva(
  cn(
    "flex w-full border transition-colors",
    "rounded-(--space-input-radius)",
    "placeholder:text-(--color-input-placeholder)",
    "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-input-border-focus) focus:ring-offset-(--space-focus-ring-offset)",
    "disabled:cursor-not-allowed disabled:bg-(--color-input-disabled-background) disabled:text-(--color-input-disabled-text)",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "py-(--space-input-padding-y-sm) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-sm)",
        md: "py-(--space-input-padding-y-md) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-md)",
        lg: "py-(--space-input-padding-y-lg) px-(--space-input-padding-x) text-(length:--font-size-input-font-size-lg)",
      },
      inputState: {
        default:
          "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
        error:
          "border-(--color-input-border-error) bg-(--color-input-default-background)",
        success:
          "border-(--color-border-success) bg-(--color-input-default-background)",
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
  /** Whether the input has an error */
  error?: boolean;
  /** Whether the input has a success/valid state */
  success?: boolean;
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
      success = false,
      size,
      type = "text",
      errorId,
      descriptionId,
      ...props
    },
    ref
  ) => {
    const inputState = error ? "error" : success ? "success" : "default";

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
