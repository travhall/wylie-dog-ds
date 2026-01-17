import React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "./lib/utils";

export interface SeparatorProps extends React.ComponentPropsWithoutRef<
  typeof SeparatorPrimitive.Root
> {
  /** Orientation of the separator */
  orientation?: "horizontal" | "vertical";
  /** Whether the separator is decorative (affects accessibility) */
  decorative?: boolean;
}

export const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-(--color-border-primary)",
        orientation === "horizontal"
          ? "h-(--spacing-separator-height-horizontal) w-full my-(--spacing-separator-margin-horizontal)"
          : "h-full w-(--spacing-separator-width-vertical) mx-(--spacing-separator-margin-vertical)",
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = SeparatorPrimitive.Root.displayName;
