import React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const toggleVariants = cva(
  cn(
    // Same box model as Button: padding, font size, 100% line height and a 1px border (transparent
    // unless outlined) set the height, so a toggle lines up with a button of the same size
    "inline-flex items-center justify-center gap-(--space-toggle-icon-gap) rounded-(--space-toggle-radius) border-(length:--space-toggle-border-width) border-transparent leading-(--line-height-toggle-line-height) font-(--font-weight-toggle-font-weight) transition-colors",
    "not-disabled:hover:bg-(--color-toggle-background-hover) not-disabled:hover:text-(--color-toggle-text-hover)",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--toggle-opacity-disabled)",
    "data-[state=on]:bg-(--color-toggle-pressed) data-[state=on]:text-(--color-toggle-text-pressed)"
  ),
  {
    variants: {
      variant: {
        default: "bg-transparent text-(--color-toggle-text)",
        outline:
          "border-(length:--space-toggle-border-width) border-(--color-toggle-border) bg-transparent text-(--color-toggle-text)",
      },
      size: {
        default:
          "py-(--space-toggle-size-default-padding-y) px-(--space-toggle-size-default-padding-x) text-(length:--font-size-toggle-font-size-md)",
        sm: "py-(--space-toggle-size-sm-padding-y) px-(--space-toggle-size-sm-padding-x) text-(length:--font-size-toggle-font-size-sm)",
        lg: "py-(--space-toggle-size-lg-padding-y) px-(--space-toggle-size-lg-padding-x) text-(length:--font-size-toggle-font-size-lg)",
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
