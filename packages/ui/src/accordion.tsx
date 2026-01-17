import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "./lib/utils";

const Accordion = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Root
    ref={ref}
    className={cn(
      "w-full min-w-(--spacing-accordion-root-min-width)",
      className
    )}
    {...props}
  />
));
Accordion.displayName = AccordionPrimitive.Root.displayName;

export interface AccordionItemProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Item
> {}

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-b-(--spacing-accordion-item-border-width) border-(--color-accordion-border) w-full relative",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Trigger
> {}

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between p-(--spacing-accordion-trigger-padding) text-(length:--spacing-accordion-trigger-font-size) font-medium transition-all",
        "hover:bg-(--color-accordion-trigger-hover) hover:text-(--color-accordion-trigger-text-hover)",
        "focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2",
        "data-[state=open]:text-(--color-accordion-trigger-text-open)",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="h-(--spacing-accordion-trigger-icon-size) w-(--spacing-accordion-trigger-icon-size) shrink-0 text-(--color-accordion-icon) transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

export interface AccordionContentProps extends React.ComponentPropsWithoutRef<
  typeof AccordionPrimitive.Content
> {}

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-(--spacing-accordion-content-font-size) data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div
      className={cn(
        "p-(--spacing-accordion-content-padding) text-(--spacing-accordion-content-font-size)",
        className
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
