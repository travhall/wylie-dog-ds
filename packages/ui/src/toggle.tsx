import React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "./lib/utils";

export interface ToggleProps extends React.ComponentPropsWithoutRef<
  typeof TogglePrimitive.Root
> {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-transparent text-(--color-toggle-text)",
    outline:
      "border border-(--color-toggle-border) bg-transparent text-(--color-toggle-text)",
  };

  const sizes = {
    default:
      "h-(--space-toggle-size-default-height) px-(--space-toggle-size-default-padding-x)",
    sm: "h-(--space-toggle-size-sm-height) px-(--space-toggle-size-sm-padding-x)",
    lg: "h-(--space-toggle-size-lg-height) px-(--space-toggle-size-lg-padding-x)",
  };

  return (
    <TogglePrimitive.Root
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-(--space-toggle-radius) text-(length:--font-size-toggle-font-size) font-medium transition-colors",
        "hover:bg-(--color-toggle-hover) hover:text-(--color-toggle-text-hover)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=on]:bg-(--color-toggle-pressed) data-[state=on]:text-(--color-toggle-text-pressed)",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
