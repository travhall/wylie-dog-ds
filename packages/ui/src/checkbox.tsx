import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const checkboxVariants = cva(
  cn(
    "peer transition-all",
    "rounded-(--space-checkbox-border-radius)",
    "border-(length:--space-checkbox-border-width)",
    "focus-visible:outline-solid focus-visible:outline-(length:--space-checkbox-focus-ring-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-checkbox-focus-ring-offset) focus-visible:shadow-[0_0_0_calc(var(--space-checkbox-focus-ring-offset)+var(--space-checkbox-focus-ring-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none",
    "disabled:cursor-not-allowed disabled:opacity-(--checkbox-opacity-disabled)",
    "data-[state=checked]:bg-(--color-checkbox-background-checked) data-[state=checked]:text-(--color-checkbox-text-checked)",
    "data-[state=checked]:border-(--color-checkbox-border-checked)",
    "data-[state=indeterminate]:bg-(--color-checkbox-background-checked) data-[state=indeterminate]:text-(--color-checkbox-text-checked)",
    "data-[state=indeterminate]:border-(--color-checkbox-border-checked)"
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

// Size and stroke per checkbox size, each from its own token. The stroke is non-scaling, so the
// token is the width drawn (1.5, 2.5, 3.5px), the same number a Figma stroke bound to it draws,
// instead of a width in the glyph's 24 unit grid that the browser scales invisibly.
const iconSizes = {
  sm: "h-(--space-checkbox-icon-size-sm) w-(--space-checkbox-icon-size-sm) stroke-(length:--space-checkbox-icon-stroke-width-sm) [&_*]:[vector-effect:non-scaling-stroke]",
  md: "h-(--space-checkbox-icon-size-md) w-(--space-checkbox-icon-size-md) stroke-(length:--space-checkbox-icon-stroke-width-md) [&_*]:[vector-effect:non-scaling-stroke]",
  lg: "h-(--space-checkbox-icon-size-lg) w-(--space-checkbox-icon-size-lg) stroke-(length:--space-checkbox-icon-stroke-width-lg) [&_*]:[vector-effect:non-scaling-stroke]",
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
