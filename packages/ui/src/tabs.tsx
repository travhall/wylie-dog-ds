import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./lib/utils";

// Tabs Root
export const Tabs = TabsPrimitive.Root;

// Tabs List (container for triggers)
export interface TabsListProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
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
        "inline-flex items-center justify-center rounded-md bg-[var(--color-background-secondary)] text-[var(--color-text-secondary)]",
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

// Tabs Trigger (individual tab button)
export interface TabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-medium ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-[var(--color-background-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:shadow-sm",
        "hover:bg-[var(--color-background-tertiary)] hover:text-[var(--color-text-primary)]",
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
      "mt-2 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;