import React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "./lib/utils";

const Collapsible = CollapsiblePrimitive.Root;
const CollapsibleTrigger = CollapsiblePrimitive.Trigger;

export interface CollapsibleContentProps extends React.ComponentPropsWithoutRef<
  typeof CollapsiblePrimitive.Content
> {}

const CollapsibleContent = React.forwardRef<
  React.ComponentRef<typeof CollapsiblePrimitive.Content>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      "rounded-(--space-collapsible-radius) bg-(--color-collapsible-background)"
    )}
    {...props}
  >
    <div className={className}>{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
