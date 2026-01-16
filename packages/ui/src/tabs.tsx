import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./lib/utils";

// Tabs Root
export const Tabs = TabsPrimitive.Root;

// Tabs List (container for triggers)
export interface TabsListProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  /** Size variant for the tabs */
  size?: "sm" | "md" | "lg";
}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "h-(--spacing-tabs-list-height-sm) p-(--spacing-tabs-list-padding-sm)",
    md: "h-(--spacing-tabs-list-height-md) p-(--spacing-tabs-list-padding-md)",
    lg: "h-(--spacing-tabs-list-height-lg) p-(--spacing-tabs-list-padding-lg)",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center bg-(--color-tabs-list-background) text-(--color-tabs-list-text)",
        "rounded-(--spacing-tabs-trigger-radius-top)",
        "border-b border-(--color-tabs-list-border-color) gap-(--spacing-tabs-list-gap)",
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// Tabs Trigger (individual tab button)
export interface TabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "px-(--spacing-tabs-trigger-padding-x-sm) py-(--spacing-tabs-trigger-padding-y-sm) text-(length:--spacing-tabs-trigger-font-size-sm)",
    md: "px-(--spacing-tabs-trigger-padding-x-md) py-(--spacing-tabs-trigger-padding-y-md) text-(length:--spacing-tabs-trigger-font-size-md)",
    lg: "px-(--spacing-tabs-trigger-padding-x-lg) py-(--spacing-tabs-trigger-padding-y-lg) text-(length:--spacing-tabs-trigger-font-size-lg)",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all",
        "rounded-(--spacing-tabs-trigger-radius-top)",
        "border-b-(length:--spacing-tabs-trigger-indicator-width) border-transparent",
        "-mb-[1px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-(--color-tabs-trigger-background-active) data-[state=active]:text-(--color-tabs-trigger-text-active) data-[state=active]:shadow-sm data-[state=active]:border-(--color-tabs-trigger-indicator-color)",
        "hover:bg-(--color-tabs-trigger-background-hover) hover:text-(--color-tabs-trigger-text-hover)",
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Tabs Content (content for each tab)
export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background",
      "mt-(--spacing-tabs-content-margin-top)",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
