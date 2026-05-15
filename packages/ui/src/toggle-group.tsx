import React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "./lib/utils";

const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      "flex items-center justify-center gap-(--space-toggle-group-gap)",
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Root>
));

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-(--space-toggle-group-item-radius) text-(length:--font-size-toggle-group-item-font-size) font-(--font-weight-toggle-group-item-font-weight) transition-colors",
      "hover:bg-(--color-toggle-background-hover) hover:text-(--color-toggle-text-hover)",
      "focus-visible:outline-none focus-visible:ring-(length:--space-focus-ring-width) focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-(--space-focus-ring-offset)",
      "disabled:pointer-events-none disabled:opacity-(--toggle-group-item-disabled-opacity)",
      "data-[state=on]:bg-(--color-toggle-pressed) data-[state=on]:text-(--color-toggle-text-pressed)",
      "h-(--space-toggle-group-item-height) px-(--space-toggle-group-item-padding-x) bg-transparent text-(--color-toggle-text)",
      className
    )}
    {...props}
  >
    {children}
  </ToggleGroupPrimitive.Item>
));

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
