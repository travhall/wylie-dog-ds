"use client";

import { XIcon } from "lucide-react";
import { Icon } from "./icon";
import React, { useRef } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const dialogContentVariants = cva(
  cn(
    "wd-motion-pop [--wd-motion-duration:var(--duration-dialog-content-duration)] [--wd-motion-easing:var(--dialog-content-easing)] [--wd-motion-scale:var(--dialog-content-scale)]",
    "fixed left-[50%] top-[50%] z-(--dialog-content-z-index) grid w-full translate-x-[-50%] translate-y-[-50%]",
    "gap-(--space-dialog-content-gap)",
    "border-(length:--space-dialog-border-width) bg-(--color-dialog-background) shadow-(--shadow-dialog-shadow) duration-(--duration-dialog-content-duration)",
    "p-(--space-dialog-content-padding)",
    "rounded-(--space-dialog-content-radius)",
    "border-(--color-dialog-border)"
  ),
  {
    variants: {
      size: {
        sm: "max-w-(--space-dialog-content-width-sm)",
        md: "max-w-(--space-dialog-content-width-md)",
        lg: "max-w-(--space-dialog-content-width-lg)",
        xl: "max-w-(--space-dialog-content-max-width)",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

// Dialog Root and Trigger
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogPortal = DialogPrimitive.Portal;
export const DialogClose = DialogPrimitive.Close;

/**
 * Props for the Dialog root component (controlled `open`/`onOpenChange`,
 * `defaultOpen`, `modal`, etc). Re-exported so consumers don't have to
 * reach into `@radix-ui/react-dialog` directly.
 */
export type DialogProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Root
>;
export type DialogTriggerProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Trigger
>;
export type DialogPortalProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Portal
>;
export type DialogCloseProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Close
>;

// Dialog Overlay
export const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "wd-motion-fade [--wd-motion-duration:var(--duration-dialog-content-duration)] [--wd-motion-easing:var(--dialog-content-easing)]",
      "fixed inset-0 z-(--dialog-overlay-z-index) bg-(--color-dialog-overlay) opacity-(--dialog-overlay-opacity) backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content
export interface DialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

export const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, ...props }, ref) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          ref={closeButtonRef}
          className={`absolute right-(--space-dialog-close-button-offset) top-(--space-dialog-close-button-offset) rounded-(--space-dialog-close-button-radius) text-(--color-dialog-close-button-text) opacity-(--dialog-close-button-opacity) transition-opacity hover:opacity-(--dialog-close-button-opacity-hover) ${focusRingClasses}`}
        >
          <Icon
            icon={XIcon}
            size="md"
            className="h-(--space-dialog-close-button-icon-size) w-(--space-dialog-close-button-icon-size)"
          />
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
      "space-y-(--space-dialog-header-gap)",
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
      "gap-(--space-dialog-footer-gap)",
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
      "font-(--font-weight-dialog-title-font-weight) leading-(--line-height-dialog-title-line-height) tracking-(--space-dialog-title-letter-spacing) text-(--color-dialog-title)",
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
      "text-(length:--font-size-dialog-description-font-size) leading-(--line-height-dialog-description-line-height)",
      "text-(--color-dialog-description)",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
