// card.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "border",
        "bg-(--color-card-background)",
        "shadow-(--shadow-card-shadow)",
        "rounded-(--spacing-card-radius)",
        "border-(--color-card-border)",
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
        "pt-(--spacing-card-header-padding-top)",
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
        "font-(--font-weight-card-title-font-weight)",
        "leading-(--line-height-card-title-line-height)",
        "tracking-(--spacing-card-title-letter-spacing)",
        "text-(length:--font-size-card-header-title-font-size)",
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
        "pt-(--spacing-card-content-padding-top)",
        "text-(length:--font-size-card-content-font-size)",
        "text-(--color-card-content-color)",
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-(length:--font-size-card-header-description-font-size)",
      "text-(--color-card-header-description-color)",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        "pt-(--spacing-card-footer-padding-top)",
        "gap-(--spacing-card-footer-gap)",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
