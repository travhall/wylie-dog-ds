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
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden border shadow-md",
        "rounded-(--spacing-tooltip-radius)",
        "bg-(--color-tooltip-background)",
        "px-(--spacing-tooltip-padding-x)",
        "py-(--spacing-tooltip-padding-y)",
        "text-(length:--spacing-tooltip-font-size)",
        "text-(--color-tooltip-text)",
        "max-w-(--spacing-tooltip-max-width)",
        "border-(--color-tooltip-border)",
        "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
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
