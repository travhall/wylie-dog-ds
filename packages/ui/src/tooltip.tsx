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
>(({ className, side = "top", ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      className={cn(
        "data-[side=bottom]:mt-(--space-tooltip-side-offset) data-[side=top]:mb-(--space-tooltip-side-offset) data-[side=left]:mr-(--space-tooltip-side-offset) data-[side=right]:ml-(--space-tooltip-side-offset)",
        "wd-motion-float [--wd-motion-duration:var(--duration-tooltip-content-duration)] [--wd-motion-easing:var(--tooltip-content-easing)] [--wd-motion-distance:var(--space-tooltip-content-distance)] [--wd-motion-scale:var(--tooltip-content-scale)]",
        "z-(--tooltip-z-index) overflow-hidden border-(length:--space-tooltip-border-width) shadow-(--shadow-tooltip-shadow)",
        "rounded-(--space-tooltip-radius)",
        "bg-(--color-tooltip-background)",
        "px-(--space-tooltip-padding-x)",
        "py-(--space-tooltip-padding-y)",
        "text-(length:--font-size-tooltip-font-size) leading-(--line-height-tooltip-line-height)",
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
