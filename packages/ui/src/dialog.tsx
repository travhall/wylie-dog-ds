"use client";

import React, { useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./lib/utils";

// Dialog Root and Trigger
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

// Dialog Overlay
export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-(--color-dialog-overlay) backdrop-blur-sm",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export interface DialogContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  /** Size variant for the dialog */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size = "md", ...props }, ref) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const sizes = {
    sm: "max-w-(--spacing-dialog-content-width-sm)",
    md: "max-w-(--spacing-dialog-content-width-md)",
    lg: "max-w-(--spacing-dialog-content-width-lg)",
    xl: "max-w-(--spacing-dialog-content-max-width)",
    full: "max-w-[95vw] max-h-[95vh]",
  };

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%]",
          "gap-(--spacing-dialog-header-gap)",
          "border bg-(--color-background-primary) shadow-lg duration-200",
          "p-(--spacing-dialog-content-padding)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
          "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "rounded-(--spacing-dialog-content-radius)",
          "border-(--color-border-primary)",
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          ref={closeButtonRef}
          className="absolute right-4 top-4 rounded-(--spacing-dialog-close-button-radius) opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2 disabled:pointer-events-none"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header
export const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col text-center sm:text-left",
      "space-y-(--spacing-dialog-header-gap)",
      className
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

// Dialog Footer
export const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end",
      "sm:space-x-(--spacing-dialog-footer-gap)",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

// Dialog Title
export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight text-(--color-text-primary)",
      "text-(length:--font-size-dialog-title-font-size)",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description
export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-(length:--font-size-dialog-description-font-size)",
      "text-(--color-text-secondary)",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
