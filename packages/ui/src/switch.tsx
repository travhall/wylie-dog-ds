import React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./lib/utils";

export interface SwitchProps extends React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> {
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "h-(--spacing-switch-track-height-sm) w-(--spacing-switch-track-width-sm)",
    md: "h-(--spacing-switch-track-height-md) w-(--spacing-switch-track-width-md)",
    lg: "h-(--spacing-switch-track-height-lg) w-(--spacing-switch-track-width-lg)",
  };

  const thumbSizes = {
    sm: "h-(--spacing-switch-thumb-size-sm) w-(--spacing-switch-thumb-size-sm) data-[state=checked]:translate-x-(--spacing-switch-thumb-translate-sm) data-[state=unchecked]:translate-x-0",
    md: "h-(--spacing-switch-thumb-size-md) w-(--spacing-switch-thumb-size-md) data-[state=checked]:translate-x-(--spacing-switch-thumb-translate-md) data-[state=unchecked]:translate-x-0",
    lg: "h-(--spacing-switch-thumb-size-lg) w-(--spacing-switch-thumb-size-lg) data-[state=checked]:translate-x-(--spacing-switch-thumb-translate-lg) data-[state=unchecked]:translate-x-0",
  };

  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center border-transparent",
        "rounded-(--spacing-switch-track-radius)",
        "border-(--spacing-switch-track-border-width)",
        "transition-colors focus:outline-none",
        "focus:ring-(--spacing-switch-focus-ring-width)",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-(--spacing-switch-focus-ring-offset)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-(--color-switch-track-background-checked)",
        "data-[state=unchecked]:bg-(--color-switch-track-background-unchecked)",
        sizes[size],
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block shadow-lg ring-0 transition-transform",
          "rounded-(--spacing-switch-thumb-radius)",
          "bg-(--color-switch-thumb-background)",
          thumbSizes[size]
        )}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;
