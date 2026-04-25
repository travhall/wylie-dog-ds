import React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const toggleVariants = cva(
  cn(
    "inline-flex items-center justify-center rounded-(--space-toggle-radius) text-(length:--font-size-toggle-font-size) font-medium transition-colors",
    "hover:bg-(--color-toggle-background-hover) hover:text-(--color-toggle-text-hover)",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
    "data-[state=on]:bg-(--color-toggle-pressed) data-[state=on]:text-(--color-toggle-text-pressed)"
  ),
  {
    variants: {
      variant: {
        default: "bg-transparent text-(--color-toggle-text)",
        outline:
          "border border-(--color-toggle-border) bg-transparent text-(--color-toggle-text)",
      },
      size: {
        default:
          "h-(--space-toggle-size-default-height) px-(--space-toggle-size-default-padding-x)",
        sm: "h-(--space-toggle-size-sm-height) px-(--space-toggle-size-sm-padding-x)",
        lg: "h-(--space-toggle-size-lg-height) px-(--space-toggle-size-lg-padding-x)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ToggleProps
  extends
    React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size }), className)}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle };
