import React from "react";
import { cn } from "../lib/utils";

// Import primitives as needed
// import { Button } from "../button";
// import { Card } from "../card";

export interface SectionFeaturesProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default";
}

export const SectionFeatures = React.forwardRef<
  HTMLDivElement,
  SectionFeaturesProps
>(({ className, variant = "default", ...props }, ref) => {
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
});

SectionFeatures.displayName = "SectionFeatures";
