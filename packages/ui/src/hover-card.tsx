import React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const hoverCardContentVariants = cva(
  cn(
    "z-(--z-index-popover) border outline-none shadow-(--shadow-md)",
    "rounded-(--space-hover-card-content-radius)",
    "p-(--space-hover-card-content-padding)",
    "border-(--color-hover-card-border)",
    "bg-(--color-hover-card-background)",
    "text-(--color-hover-card-text)",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
  ),
  {
    variants: {
      size: {
        sm: "w-(--space-hover-card-content-width-sm)",
        md: "w-(--space-hover-card-content-width-md)",
        lg: "w-(--space-hover-card-content-width-lg)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface HoverCardContentProps
  extends
    React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>,
    VariantProps<typeof hoverCardContentVariants> {}

const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, size, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(hoverCardContentVariants({ size }), className)}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
