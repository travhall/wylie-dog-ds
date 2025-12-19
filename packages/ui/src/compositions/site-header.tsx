import React from "react";
import { cn } from "../lib/utils";

// Import primitives as needed
// import { Button } from "../button";
// import { Card } from "../card";

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default";
}

export const SiteHeader = React.forwardRef<HTMLDivElement, SiteHeaderProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-background text-foreground",
    };

    return (
      <div
        className={cn("relative", variants[variant], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

SiteHeader.displayName = "SiteHeader";
