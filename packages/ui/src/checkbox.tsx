import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const checkboxVariants = cva(
  cn(
    "peer transition-all",
    "rounded-(--space-checkbox-border-radius)",
    "border-(length:--space-checkbox-border-width)",
    "focus:outline-none",
    "focus:ring-(length:--space-checkbox-focus-ring-width)",
    "focus:ring-(--color-border-focus)",
    "focus:ring-offset-(--space-checkbox-focus-ring-offset)",
    "disabled:cursor-not-allowed disabled:opacity-(--checkbox-disabled-opacity)",
    "data-[state=checked]:bg-(--color-checkbox-checked-background) data-[state=checked]:text-(--color-checkbox-checked-text)",
    "data-[state=checked]:border-(--color-checkbox-checked-border)",
    "data-[state=indeterminate]:bg-(--color-checkbox-checked-background) data-[state=indeterminate]:text-(--color-checkbox-checked-text)",
    "data-[state=indeterminate]:border-(--color-checkbox-checked-border)"
  ),
  {
    variants: {
      size: {
        sm: "h-(--space-checkbox-size-sm) w-(--space-checkbox-size-sm)",
        md: "h-(--space-checkbox-size-md) w-(--space-checkbox-size-md)",
        lg: "h-(--space-checkbox-size-lg) w-(--space-checkbox-size-lg)",
      },
      error: {
        true: "border-(--color-checkbox-error-border)",
        false: "border-(--color-checkbox-border-color)",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  }
);

const iconSizes = {
  sm: "h-(--space-checkbox-icon-size-sm) w-(--space-checkbox-icon-size-sm)",
  md: "h-(--space-checkbox-icon-size-md) w-(--space-checkbox-icon-size-md)",
  lg: "h-(--space-checkbox-icon-size-lg) w-(--space-checkbox-icon-size-lg)",
} as const;

type CheckboxVariantProps = VariantProps<typeof checkboxVariants>;

export interface CheckboxProps
  extends
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    Omit<CheckboxVariantProps, "error"> {
  /** Whether the checkbox has an error */
  error?: boolean;
}

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", error = false, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    checked={checked}
    className={cn(checkboxVariants({ size, error }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-start")}>
      {checked === "indeterminate" ? (
        <svg
          className={iconSizes[size ?? "md"]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" y1="12" x2="20" y2="12" />
        </svg>
      ) : (
        <svg
          className={iconSizes[size ?? "md"]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20,2 9,15 4,10" />
        </svg>
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
