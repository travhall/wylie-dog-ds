import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const switchVariants = cva(
  cn(
    "peer inline-flex shrink-0 cursor-pointer items-center border-transparent",
    "rounded-(--space-switch-track-radius)",
    "border-(--space-switch-track-border-width)",
    "transition-colors",
    "focus-visible:outline-solid focus-visible:outline-(length:--space-switch-focus-ring-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-switch-focus-ring-offset) focus-visible:shadow-[0_0_0_calc(var(--space-switch-focus-ring-offset)+var(--space-switch-focus-ring-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none",
    "disabled:cursor-not-allowed data-[state=checked]:disabled:bg-(--color-switch-track-background-disabled) data-[state=unchecked]:disabled:bg-(--color-switch-track-background-disabled)",
    "data-[state=checked]:bg-(--color-switch-track-background-checked)",
    "data-[state=unchecked]:bg-(--color-switch-track-background-unchecked)"
  ),
  {
    variants: {
      size: {
        sm: "h-(--space-switch-track-height-sm) w-(--space-switch-track-width-sm)",
        md: "h-(--space-switch-track-height-md) w-(--space-switch-track-width-md)",
        lg: "h-(--space-switch-track-height-lg) w-(--space-switch-track-width-lg)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const thumbSizes = {
  sm: "h-(--space-switch-thumb-size-sm) w-(--space-switch-thumb-size-sm) data-[state=checked]:translate-x-(--space-switch-thumb-translate-sm) data-[state=unchecked]:translate-x-0",
  md: "h-(--space-switch-thumb-size-md) w-(--space-switch-thumb-size-md) data-[state=checked]:translate-x-(--space-switch-thumb-translate-md) data-[state=unchecked]:translate-x-0",
  lg: "h-(--space-switch-thumb-size-lg) w-(--space-switch-thumb-size-lg) data-[state=checked]:translate-x-(--space-switch-thumb-translate-lg) data-[state=unchecked]:translate-x-0",
} as const;

export interface SwitchProps
  extends
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchVariants> {}

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(switchVariants({ size }), className)}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block shadow-(--shadow-switch-thumb-shadow) ring-0 transition-transform",
        "rounded-(--space-switch-thumb-radius)",
        "bg-(--color-switch-thumb-background)",
        thumbSizes[size ?? "md"]
      )}
    />
  </SwitchPrimitive.Root>
));

Switch.displayName = SwitchPrimitive.Root.displayName;
