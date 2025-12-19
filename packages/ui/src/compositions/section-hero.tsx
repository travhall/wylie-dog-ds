import React from "react";
import { cn } from "../lib/utils";

// Import primitives as needed
// import { Button } from "../button";
// import { Card } from "../card";

export interface SectionHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default";
}

export const SectionHero = React.forwardRef<HTMLDivElement, SectionHeroProps>(
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

SectionHero.displayName = "SectionHero";
