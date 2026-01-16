import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "./lib/utils";

// Sheet Root and Trigger (using Dialog primitives)
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;

// Sheet Overlay
export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 backdrop-blur-sm",
      "bg-(--color-sheet-overlay-background)",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Sheet Content
export interface SheetContentProps extends React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> {
  side?: "top" | "right" | "bottom" | "left";
}

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => {
  const sideVariants = {
    top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
    bottom:
      "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    left: "inset-y-0 left-0 h-full border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left w-3/4 sm:max-w-(--spacing-sheet-content-width-md)",
    right:
      "inset-y-0 right-0 h-full border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right w-3/4 sm:max-w-(--spacing-sheet-content-width-md)",
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 bg-(--color-background-primary) shadow-lg transition ease-in-out",
          "gap-(--spacing-sheet-header-gap)",
          "p-(--spacing-sheet-content-padding)",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          sideVariants[side],
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2 disabled:pointer-events-none">
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
    </SheetPortal>
  );
});
SheetContent.displayName = DialogPrimitive.Content.displayName;

// Sheet Header
export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col text-center sm:text-left",
      "space-y-(--spacing-sheet-header-gap)",
      className
    )}
    {...props}
  />
));
SheetHeader.displayName = "SheetHeader";

// Sheet Footer
export const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end",
      "sm:space-x-(--spacing-sheet-footer-gap)",
      className
    )}
    {...props}
  />
));
SheetFooter.displayName = "SheetFooter";

// Sheet Title
export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "font-semibold text-(--color-text-primary)",
      "text-(length:--spacing-sheet-title-font-size)",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = DialogPrimitive.Title.displayName;

// Sheet Description
export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-(length:--spacing-sheet-description-font-size)",
      "text-(--color-text-secondary)",
      className
    )}
    {...props}
  />
));
SheetDescription.displayName = DialogPrimitive.Description.displayName;
