import React from "react";
import { cn } from "./lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
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
      error,
      size = "md",
      children,
      requiredIndicator = "*",
      requiredIndicatorSrOnly = false,
      ...props
    },
    ref
  ) => {
    const sizes = {
      sm: "text-(length:--spacing-label-font-size)",
      md: "text-(length:--spacing-label-font-size)",
      lg: "text-(length:--spacing-label-font-size)",
    };

    return (
      <label
        ref={ref}
        className={cn(
          "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error ? "text-(--color-text-danger)" : "text-(--color-text-primary)",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className={cn(
              "text-(--color-text-danger) ml-(--spacing-label-required-margin-left)",
              requiredIndicatorSrOnly && "sr-only"
            )}
            aria-label="required"
          >
            {requiredIndicator}
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
