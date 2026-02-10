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
    sm: "h-(--space-switch-track-height-sm) w-(--space-switch-track-width-sm)",
    md: "h-(--space-switch-track-height-md) w-(--space-switch-track-width-md)",
    lg: "h-(--space-switch-track-height-lg) w-(--space-switch-track-width-lg)",
  };

  const thumbSizes = {
    sm: "h-(--space-switch-thumb-size-sm) w-(--space-switch-thumb-size-sm) data-[state=checked]:translate-x-(--space-switch-thumb-translate-sm) data-[state=unchecked]:translate-x-0",
    md: "h-(--space-switch-thumb-size-md) w-(--space-switch-thumb-size-md) data-[state=checked]:translate-x-(--space-switch-thumb-translate-md) data-[state=unchecked]:translate-x-0",
    lg: "h-(--space-switch-thumb-size-lg) w-(--space-switch-thumb-size-lg) data-[state=checked]:translate-x-(--space-switch-thumb-translate-lg) data-[state=unchecked]:translate-x-0",
  };

  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center border-transparent",
        "rounded-(--space-switch-track-radius)",
        "border-(--space-switch-track-border-width)",
        "transition-colors focus:outline-none",
        "focus:ring-(--space-switch-focus-ring-width)",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-(--space-switch-focus-ring-offset)",
        "disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
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
          "pointer-events-none block shadow-(--shadow-lg) ring-0 transition-transform",
          "rounded-(--space-switch-thumb-radius)",
          "bg-(--color-switch-thumb-background)",
          thumbSizes[size]
        )}
      />
    </SwitchPrimitive.Root>
  );
});

Switch.displayName = SwitchPrimitive.Root.displayName;
