// card.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const cardVariants = cva(
  cn(
    "flex flex-col",
    "border",
    "bg-(--color-card-background)",
    "shadow-(--shadow-card-shadow)",
    "rounded-(--space-card-radius)",
    "border-(--color-card-border)",
    "p-(--space-card-padding)",
    "gap-(--space-card-gap)"
  ),
  {
    variants: {
      interactive: {
        true: cn(
          "cursor-pointer transition-colors",
          "hover:bg-(--color-card-background-hover)",
          "hover:border-(--color-card-border-hover)",
          "focus:bg-(--color-card-background-focus)",
          focusRingClasses,
          "active:bg-(--color-card-background-active)",
          "disabled:bg-(--color-card-background-disabled)",
          "disabled:cursor-not-allowed disabled:opacity-(--card-disabled-opacity)"
        ),
        false: "",
      },
    },
    defaultVariants: {
      interactive: false,
    },
  }
);

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Render the card's styles on a child element (e.g. `<a>` or `<button>`). */
  asChild?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ interactive }), className)}
        {...(interactive && !asChild ? { role: "button", tabIndex: 0 } : {})}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col",
        "gap-(--space-card-header-gap)",
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
        "tracking-(--space-card-title-letter-spacing)",
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
        "text-(length:--font-size-card-content-font-size)",
        "text-(--color-card-content-color)",
        "leading-(--line-height-card-content-line-height)",
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
      "leading-(--line-height-card-header-description-line-height)",
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
        "pt-(--space-card-footer-padding-top)",
        "gap-(--space-card-footer-gap)",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
