import React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "./lib/utils";

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
> {}

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Root
    className={cn("grid gap-2", className)}
    {...props}
    ref={ref}
  />
));
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {}

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      "aspect-square border text-(--color-radio-indicator)",
      "h-(--spacing-radio-size-md) w-(--spacing-radio-size-md)",
      "rounded-(--spacing-radio-border-radius)",
      "border-(--color-radio-border)",
      "focus:outline-none",
      "focus:ring-(length:--spacing-radio-focus-ring-width)",
      "focus:ring-(--color-border-focus)",
      "focus:ring-offset-(length:--spacing-radio-focus-ring-offset)",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:border-(--color-radio-border-checked)",
      "data-[state=checked]:bg-(--color-radio-background-checked)",
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="bg-current rounded-(--spacing-radio-border-radius) h-(--spacing-radio-indicator-size-md) w-(--spacing-radio-indicator-size-md)" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
