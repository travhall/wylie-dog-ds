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
    sm: "h-8 p-1",
    md: "h-10 p-1",
    lg: "h-12 p-1.5",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center bg-(--color-background-secondary) text-(--color-text-secondary)",
        "rounded-(--spacing-tabs-trigger-radius-top)",
        "border-b-(length:--spacing-tabs-list-border-width)",
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
    sm: "px-(--spacing-tabs-trigger-padding-x) py-(--spacing-tabs-trigger-padding-y) text-(length:--spacing-tabs-trigger-font-size)",
    md: "px-(--spacing-tabs-trigger-padding-x) py-(--spacing-tabs-trigger-padding-y) text-(length:--spacing-tabs-trigger-font-size)",
    lg: "px-(--spacing-tabs-trigger-padding-x) py-(--spacing-tabs-trigger-padding-y) text-(length:--spacing-tabs-trigger-font-size)",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all",
        "rounded-(--spacing-tabs-trigger-radius-top)",
        "border-b-(length:--spacing-tabs-trigger-border-width)",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-(--color-background-primary) data-[state=active]:text-(--color-text-primary) data-[state=active]:shadow-sm",
        "hover:bg-(--color-background-tertiary) hover:text-(--color-text-primary)",
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
