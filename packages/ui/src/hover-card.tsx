import React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "./lib/utils";

const HoverCard = HoverCardPrimitive.Root;
const HoverCardTrigger = HoverCardPrimitive.Trigger;

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<
  typeof HoverCardPrimitive.Content
> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  /** Size variant for the hover card width */
  size?: "sm" | "md" | "lg";
}

const HoverCardContent = React.forwardRef<
  React.ComponentRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(
  (
    { className, align = "center", sideOffset = 4, size = "md", ...props },
    ref
  ) => {
    const sizes = {
      sm: "w-(--spacing-hover-card-content-width-sm)",
      md: "w-(--spacing-hover-card-content-width-md)",
      lg: "w-(--spacing-hover-card-content-width-lg)",
    };

    return (
      <HoverCardPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 border outline-none shadow-(--shadow-md)",
          sizes[size],
          "rounded-(--spacing-hover-card-content-radius)",
          "p-(--spacing-hover-card-content-padding)",
          "border-(--color-hover-card-border)",
          "bg-(--color-hover-card-background)",
          "text-(--color-hover-card-text)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    );
  }
);
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
