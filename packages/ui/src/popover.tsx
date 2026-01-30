import React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "./lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Content
> {
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  size?: "sm" | "md" | "lg";
}

const PopoverContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  PopoverContentProps
>(
  (
    { className, align = "center", sideOffset = 4, size = "md", ...props },
    ref
  ) => {
    const sizes = {
      sm: "w-(--spacing-popover-content-width-sm)",
      md: "w-(--spacing-popover-content-width-md)",
      lg: "w-(--spacing-popover-content-width-lg)",
    };

    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={ref}
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "z-50 border outline-none shadow-md",
            sizes[size],
            "rounded-(--spacing-popover-content-radius)",
            "p-(--spacing-popover-content-padding)",
            "border-(--color-popover-border)",
            "bg-(--color-popover-background)",
            "text-(--color-popover-text)",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent };
