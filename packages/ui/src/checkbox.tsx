import React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "./lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<
  typeof CheckboxPrimitive.Root
> {
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether the checkbox has an error */
  error?: boolean;
}

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size = "md", error = false, ...props }, ref) => {
  const sizes = {
    sm: "h-(--spacing-checkbox-size-sm) w-(--spacing-checkbox-size-sm)",
    md: "h-(--spacing-checkbox-size-md) w-(--spacing-checkbox-size-md)",
    lg: "h-(--spacing-checkbox-size-lg) w-(--spacing-checkbox-size-lg)",
  };

  const iconSizes = {
    sm: "h-(--spacing-checkbox-icon-size-sm) w-(--spacing-checkbox-icon-size-sm)",
    md: "h-(--spacing-checkbox-icon-size-md) w-(--spacing-checkbox-icon-size-md)",
    lg: "h-(--spacing-checkbox-icon-size-lg) w-(--spacing-checkbox-icon-size-lg)",
  };

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer transition-all",
        "rounded-(--spacing-checkbox-border-radius)",
        "border-(length:--spacing-checkbox-border-width)",
        "focus:outline-none",
        "focus:ring-(--spacing-checkbox-focus-ring-width)",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-(--spacing-checkbox-focus-ring-offset)",
        "disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
        "data-[state=checked]:bg-(--color-interactive-primary) data-[state=checked]:text-(--color-text-inverse)",
        "data-[state=checked]:border-(--color-interactive-primary)",
        error
          ? "border-(--color-border-danger)"
          : "border-(--color-checkbox-border-color)",
        sizes[size],
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-start")}>
        <svg
          className={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20,2 9,15 4,10" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
