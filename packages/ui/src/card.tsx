// card.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border bg-(--color-background-primary) shadow-sm",
        "rounded-(--spacing-card-radius)",
        "border-(--color-border-primary)",
        "p-(--spacing-card-padding)",
        "gap-(--spacing-card-gap)",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col",
        "space-y-(--spacing-card-header-gap)",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        "text-(length:--spacing-card-header-title-font-size)",
        "text-(--color-card-header-title-color)",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pt-(--spacing-card-header-padding-top)",
        "text-(length:--spacing-card-header-description-font-size)",
        "text-(--color-card-header-description-color)",
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";
