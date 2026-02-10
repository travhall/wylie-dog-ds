import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "./lib/utils";

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {}

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, orientation, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn(
      "gap-(--space-radio-group-item-gap)",
      orientation === "horizontal" ? "flex flex-wrap" : "grid",
      className
    )}
    orientation={orientation}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  /** Size variant for the radio button */
  size?: "sm" | "md" | "lg";
}

const RadioGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "h-(--space-radio-size-sm) w-(--space-radio-size-sm)",
    md: "h-(--space-radio-size-md) w-(--space-radio-size-md)",
    lg: "h-(--space-radio-size-lg) w-(--space-radio-size-lg)",
  };

  const indicatorSizes = {
    sm: "h-(--space-radio-indicator-size-sm) w-(--space-radio-indicator-size-sm)",
    md: "h-(--space-radio-indicator-size-md) w-(--space-radio-indicator-size-md)",
    lg: "h-(--space-radio-indicator-size-lg) w-(--space-radio-indicator-size-lg)",
  };

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square border text-(--color-radio-indicator)",
        sizes[size],
        "rounded-(--space-radio-border-radius)",
        "border-(--color-radio-border)",
        "focus:outline-none",
        "focus:ring-(length:--space-radio-focus-ring-width)",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-(length:--space-radio-focus-ring-offset)",
        "disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
        "data-[state=checked]:border-(--color-radio-border-checked)",
        "data-[state=checked]:bg-(--color-radio-background-checked)",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div
          className={cn(
            "bg-current rounded-(--space-radio-border-radius)",
            indicatorSizes[size]
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
