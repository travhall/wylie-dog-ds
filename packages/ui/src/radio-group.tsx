import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "./lib/utils";

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {}

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn("grid gap-(--spacing-radio-group-item-gap)", className)}
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
    sm: "h-(--spacing-radio-size-sm) w-(--spacing-radio-size-sm)",
    md: "h-(--spacing-radio-size-md) w-(--spacing-radio-size-md)",
    lg: "h-(--spacing-radio-size-lg) w-(--spacing-radio-size-lg)",
  };

  const indicatorSizes = {
    sm: "h-(--spacing-radio-indicator-size-sm) w-(--spacing-radio-indicator-size-sm)",
    md: "h-(--spacing-radio-indicator-size-md) w-(--spacing-radio-indicator-size-md)",
    lg: "h-(--spacing-radio-indicator-size-lg) w-(--spacing-radio-indicator-size-lg)",
  };

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square border text-(--color-radio-indicator)",
        sizes[size],
        "rounded-(--spacing-radio-border-radius)",
        "border-(--color-radio-border)",
        "focus:outline-none",
        "focus:ring-(--spacing-radio-focus-ring-width)",
        "focus:ring-(--color-border-focus)",
        "focus:ring-offset-(--spacing-radio-focus-ring-offset)",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-(--color-radio-border-checked)",
        "data-[state=checked]:bg-(--color-radio-background-checked)",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div
          className={cn(
            "bg-current rounded-(--spacing-radio-border-radius)",
            indicatorSizes[size]
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
