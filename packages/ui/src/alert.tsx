// alert.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

export const alertVariants = cva(
  "relative w-full rounded-(--space-alert-radius) border border-l-4 px-(--space-alert-padding-x) py-(--space-alert-padding-y) text-(length:--font-size-alert-description-font-size)",
  {
    variants: {
      variant: {
        default:
          "bg-(--color-alert-default-background) border-(--color-alert-default-border) text-(--color-alert-default-text)",
        destructive:
          "bg-(--color-alert-destructive-background) border-(--color-alert-destructive-border) text-(--color-alert-destructive-text)",
        warning:
          "bg-(--color-alert-warning-background) border-(--color-alert-warning-border) text-(--color-alert-warning-text)",
        success:
          "bg-(--color-alert-success-background) border-(--color-alert-success-border) text-(--color-alert-success-text)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /** Override the ARIA role for custom urgency handling */
  role?: "alert" | "status" | "region";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, role, ...props }, ref) => {
    // Smart urgency handling based on variant
    const getAriaRole = () => {
      if (role) return role; // Allow override

      switch (variant) {
        case "destructive":
        case "warning":
          return "alert"; // High urgency - interrupts screen reader
        case "success":
          return "status"; // Medium urgency - announced politely
        default:
          return "region"; // Low urgency - announced when focused
      }
    };

    const getAriaLive = () => {
      if (role) return undefined; // Don't set if role is overridden

      switch (variant) {
        case "destructive":
          return "assertive";
        case "warning":
        case "success":
          return "polite";
        default:
          return "off";
      }
    };

    return (
      <div
        ref={ref}
        className={cn(alertVariants({ variant }), className)}
        role={getAriaRole()}
        aria-live={getAriaLive()}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        "mb-(--space-alert-title-margin-bottom) text-(length:--font-size-alert-title-font-size) font-medium leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-(length:--font-size-alert-description-font-size) opacity-90",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
