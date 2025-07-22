import React from "react";
import { cn } from "./lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field has an error */
  error?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, error, size = "md", children, ...props }, ref) => {
    const sizes = {
      sm: "text-xs",
      md: "text-sm", 
      lg: "text-base",
    };

    return (
      <label
        ref={ref}
        className={cn(
          "font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error
            ? "text-[var(--color-text-danger)]"
            : "text-[var(--color-text-primary)]",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span 
            className="text-[var(--color-text-danger)] ml-1" 
            aria-label="required"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";