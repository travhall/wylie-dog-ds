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
      destructive: "destructive border-red-500 bg-red-500 text-white",
      success: "border-green-500 bg-green-500 text-white",
      warning: "border-yellow-500 bg-yellow-500 text-black",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
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
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-(--color-background) transition-colors hover:bg-(--color-toast-action-hover) focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
        "absolute right-2 top-2 rounded-md p-1 text-(--color-toast-close) opacity-0 transition-opacity hover:text-(--color-toast-close-hover) focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        className
      )}
      aria-label={srText}
      {...props}
    >
      <XIcon className="h-4 w-4" />
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
      className={cn("text-sm font-semibold", className)}
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
  <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
));
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription };
