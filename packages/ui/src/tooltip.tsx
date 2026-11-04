// tooltip.tsx
import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-(--tooltip-z-index) overflow-hidden border-(length:--space-tooltip-border-width) shadow-(--shadow-tooltip-shadow)",
        "rounded-(--space-tooltip-radius)",
        "bg-(--color-tooltip-background)",
        "px-(--space-tooltip-padding-x)",
        "py-(--space-tooltip-padding-y)",
        "text-(length:--font-size-tooltip-font-size)",
        "text-(--color-tooltip-text)",
        "max-w-(--space-tooltip-max-width)",
        "border-(--color-tooltip-border)",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
};
