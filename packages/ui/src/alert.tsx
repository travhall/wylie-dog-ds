// alert.tsx
import React from "react";
import { cn } from "./lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
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

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border border-l-4 px-4 py-3 text-sm",
          variants[variant],
          className
        )}
        role="alert"
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
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
