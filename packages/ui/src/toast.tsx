import React from "react";
import { XIcon } from "lucide-react";
import { cn } from "./lib/utils";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "warning";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "border bg-(--color-toast-background) text-(--color-toast-text)",
      destructive:
        "border-(--color-toast-destructive-border) bg-(--color-toast-destructive-background) text-white",
      success:
        "border-(--color-toast-success-border) bg-(--color-toast-success-background) text-white",
      warning:
        "border-(--color-toast-warning-border) bg-(--color-toast-warning-background) text-black",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex items-center justify-between overflow-hidden border shadow-(--shadow-lg) transition-all",
          "w-(--space-toast-width)",
          "space-x-(--space-toast-gap)",
          "rounded-(--space-toast-radius)",
          "p-(--space-toast-padding)",

          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
          variants[variant],
          className
        )}
        role="alert"
        aria-live="assertive"
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

interface ToastActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-(--space-toast-action-radius) border bg-transparent ring-offset-(--color-background) transition-colors hover:bg-(--color-toast-action-hover) focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "h-(--space-toast-action-height)",
        "px-(--space-toast-action-padding-x)",
        "text-(length:--font-size-toast-action-font-size)",
        "font-medium",
        className
      )}
      {...props}
    />
  )
);
ToastAction.displayName = "ToastAction";

interface ToastCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  srText?: string;
}

const ToastClose = React.forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ className, srText = "Close notification", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 p-(--space-toast-close-button-padding) text-(--color-toast-close) opacity-0 transition-opacity hover:text-(--color-toast-close-hover) focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        "rounded-(--space-toast-close-button-radius)",
        "h-(--space-toast-close-size) w-(--space-toast-close-size)",
        className
      )}
      aria-label={srText}
      {...props}
    >
      <XIcon className="h-(--space-icon-size-md) w-(--space-icon-size-md)" />
      <span className="sr-only">{srText}</span>
    </button>
  )
);
ToastClose.displayName = "ToastClose";

interface ToastTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "font-semibold",
        "text-(length:--font-size-toast-title-font-size)",
        className
      )}
      {...props}
    />
  )
);
ToastTitle.displayName = "ToastTitle";

interface ToastDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "opacity-(--state-opacity-subtle)",
      "text-(length:--font-size-toast-description-font-size)",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription };
