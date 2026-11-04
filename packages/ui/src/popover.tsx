import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

export const popoverContentVariants = cva(
  cn(
    "z-(--popover-z-index) border-(length:--space-popover-border-width) outline-hidden shadow-(--shadow-popover-content-shadow)",
    "rounded-(--space-popover-content-radius)",
    "p-(--space-popover-content-padding)",
    "border-(--color-popover-border)",
    "bg-(--color-popover-background)",
    "text-(--color-popover-text)"
  ),
  {
    variants: {
      size: {
        sm: "w-(--space-popover-content-width-sm)",
        md: "w-(--space-popover-content-width-md)",
        lg: "w-(--space-popover-content-width-lg)",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface PopoverContentProps
  extends
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
    VariantProps<typeof popoverContentVariants> {}

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(({ className, align = "center", sideOffset = 4, size, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(popoverContentVariants({ size }), className)}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
