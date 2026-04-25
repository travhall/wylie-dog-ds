import React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

// Tabs Root
export const Tabs = TabsPrimitive.Root;

export const tabsListVariants = cva(
  cn(
    "inline-flex items-center justify-center bg-(--color-tabs-list-background) text-(--color-tabs-list-text)",
    "border-b-(--space-tabs-list-border-width) border-(--color-tabs-list-border-color) gap-(--space-tabs-list-gap)"
  ),
  {
    variants: {
      size: {
        sm: "h-(--space-tabs-list-height-sm) p-(--space-tabs-list-padding-sm)",
        md: "h-(--space-tabs-list-height-md) p-(--space-tabs-list-padding-md)",
        lg: "h-(--space-tabs-list-height-lg) p-(--space-tabs-list-padding-lg)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface TabsListProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ size }), className)}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

export const tabsTriggerVariants = cva(
  cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all",
    "border-b-(--space-tabs-trigger-indicator-width) border-transparent",
    "-mb-[1px]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)",
    "data-[state=active]:bg-(--color-tabs-trigger-background-active) data-[state=active]:text-(--color-tabs-trigger-text-active) data-[state=active]:shadow-(--shadow-sm) data-[state=active]:border-(--color-tabs-trigger-indicator-color)",
    "hover:bg-(--color-tabs-trigger-background-hover) hover:text-(--color-tabs-trigger-text-hover)"
  ),
  {
    variants: {
      size: {
        sm: "px-(--space-tabs-trigger-padding-x-sm) py-(--space-tabs-trigger-padding-y-sm) text-(length:--font-size-tabs-trigger-font-size-sm)",
        md: "px-(--space-tabs-trigger-padding-x-md) py-(--space-tabs-trigger-padding-y-md) text-(length:--font-size-tabs-trigger-font-size-md)",
        lg: "px-(--space-tabs-trigger-padding-x-lg) py-(--space-tabs-trigger-padding-y-lg) text-(length:--font-size-tabs-trigger-font-size-lg)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface TabsTriggerProps
  extends
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ size }), className)}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// Tabs Content
export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ring-offset-background",
      "mt-(--space-tabs-content-margin-top)",
      "p-(--space-tabs-content-padding)",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-border-focus) focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
