import React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "./lib/utils";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

export type CollapsibleContentProps = React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
>;

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "wd-motion-expand [--wd-motion-duration:var(--duration-collapsible-content-duration)] [--wd-motion-easing:var(--collapsible-content-easing)] [--wd-motion-height:var(--radix-collapsible-content-height)]",
      "overflow-hidden",
      "rounded-(--space-collapsible-radius) bg-(--color-collapsible-background)"
    )}
    {...props}
  >
    <div className={className}>{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
