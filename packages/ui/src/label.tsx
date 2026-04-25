import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const labelVariants = cva(
  "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:text-(--color-label-disabled-color)",
  {
    variants: {
      size: {
        sm: "text-(length:--font-size-label-font-size-sm)",
        md: "text-(length:--font-size-label-font-size-md)",
        lg: "text-(length:--font-size-label-font-size-lg)",
      },
      error: {
        true: "text-(--color-text-danger)",
        false: "text-(--color-label-default-color)",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  }
);

type LabelVariantProps = VariantProps<typeof labelVariants>;

export interface LabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement>,
    Omit<LabelVariantProps, "error"> {
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field has an error */
  error?: boolean;
  /** Custom required indicator text (default: "*") */
  requiredIndicator?: string;
  /** Hide the required indicator visually but keep it for screen readers */
  requiredIndicatorSrOnly?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      required,
      error = false,
      size,
      children,
      requiredIndicator = "*",
      requiredIndicatorSrOnly = false,
      ...props
    },
    ref
  ) => (
    <label
      ref={ref}
      className={cn(labelVariants({ size, error }), className)}
      {...props}
    >
      {children}
      {required && (
        <span
          className={cn(
            "text-(--color-text-danger) ml-(--space-label-required-margin-left)",
            requiredIndicatorSrOnly && "sr-only"
          )}
          aria-label="required"
        >
          {requiredIndicator}
        </span>
      )}
    </label>
  )
);

Label.displayName = "Label";
