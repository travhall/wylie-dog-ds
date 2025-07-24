// alert.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success";
  /** Override the ARIA role for custom urgency handling */
  role?: "alert" | "status" | "region";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", role, ...props }, ref) => {
    const variants = {
      default:
        "bg-[var(--color-alert-default-background)] border-[var(--color-alert-default-border)] text-[var(--color-alert-default-text)]",
      destructive:
        "bg-[var(--color-alert-destructive-background)] border-[var(--color-alert-destructive-border)] text-[var(--color-alert-destructive-text)]",
      warning:
        "bg-[var(--color-alert-warning-background)] border-[var(--color-alert-warning-border)] text-[var(--color-alert-warning-text)]",
      success:
        "bg-[var(--color-alert-success-background)] border-[var(--color-alert-success-border)] text-[var(--color-alert-success-text)]",
    };

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
        className={cn(
          "relative w-full rounded-lg border border-l-4 px-4 py-3 text-sm",
          variants[variant],
          className
        )}
        role={getAriaRole()}
        aria-live={getAriaLive()}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
