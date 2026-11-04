import React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

export const hoverCardContentVariants = cva(
  cn(
    "z-(--hover-card-z-index) border-(length:--space-hover-card-border-width) outline-hidden shadow-(--shadow-hover-card-content-shadow)",
    "rounded-(--space-hover-card-content-radius)",
    "p-(--space-hover-card-content-padding)",
    "border-(--color-hover-card-border)",
    "bg-(--color-hover-card-background)",
    "text-(--color-hover-card-text)"
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
>(({ className, align = "center", size, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    className={cn(
      hoverCardContentVariants({ size }),
      "data-[side=bottom]:mt-(--space-hover-card-side-offset) data-[side=top]:mb-(--space-hover-card-side-offset) data-[side=left]:mr-(--space-hover-card-side-offset) data-[side=right]:ml-(--space-hover-card-side-offset)",
      className
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
