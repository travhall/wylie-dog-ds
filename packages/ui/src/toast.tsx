import React from "react";
import { XIcon } from "lucide-react";
import { Icon } from "./icon";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";

export const toastVariants = cva(
  cn(
    // A two-column grid: title and description stack in the first column, the close button and
    // the action stack in the second, right-aligned (ToastTitle, ToastDescription, ToastClose and
    // ToastAction place themselves, so they sit directly inside the Toast).
    "group pointer-events-auto relative grid grid-cols-[1fr_auto] items-start overflow-hidden border-(length:--space-toast-border-width) shadow-(--shadow-toast-shadow) transition-all",
    "wd-motion-slide [--wd-motion-duration:var(--duration-toast-duration)] [--wd-motion-easing:var(--toast-easing)] [--wd-motion-y:100%]",
    "w-(--space-toast-width)",
    "gap-x-(--space-toast-gap)",
    "rounded-(--space-toast-radius)",
    "p-(--space-toast-padding)",
    "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-(--radix-toast-swipe-end-x) data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=move]:transition-none"
  ),
  {
    variants: {
      variant: {
        default:
          "border-(--color-toast-default-border) bg-(--color-toast-default-background) text-(--color-toast-text)",
        destructive:
          "border-(--color-toast-destructive-border) bg-(--color-toast-destructive-background) text-(--color-toast-destructive-text)",
        success:
          "border-(--color-toast-success-border) bg-(--color-toast-success-background) text-(--color-toast-success-text)",
        warning:
          "border-(--color-toast-warning-border) bg-(--color-toast-warning-background) text-(--color-toast-warning-text)",
        info: "border-(--color-toast-info-border) bg-(--color-toast-info-background) text-(--color-toast-info-text)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ToastProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      data-variant={variant ?? "default"}
      role="alert"
      aria-live="assertive"
      {...props}
    />
  )
);
Toast.displayName = "Toast";

// A solid toast paints its own fill, so the shared neutral hover would put the
// label on a near-white patch. Its buttons take the role's hover and pressed tones.
// The classes are written out in full so Tailwind can see them.
const solidControlFill = [
  "group-data-[variant=destructive]:hover:bg-(--color-toast-destructive-control-background-hover) group-data-[variant=destructive]:active:bg-(--color-toast-destructive-control-background-active)",
  "group-data-[variant=success]:hover:bg-(--color-toast-success-control-background-hover) group-data-[variant=success]:active:bg-(--color-toast-success-control-background-active)",
  "group-data-[variant=warning]:hover:bg-(--color-toast-warning-control-background-hover) group-data-[variant=warning]:active:bg-(--color-toast-warning-control-background-active)",
  "group-data-[variant=info]:hover:bg-(--color-toast-info-control-background-hover) group-data-[variant=info]:active:bg-(--color-toast-info-control-background-active)",
].join(" ");

const solidCloseColor = [
  "group-data-[variant=destructive]:text-(--color-toast-destructive-close-icon) group-data-[variant=destructive]:hover:text-(--color-toast-destructive-close-icon)",
  "group-data-[variant=success]:text-(--color-toast-success-close-icon) group-data-[variant=success]:hover:text-(--color-toast-success-close-icon)",
  "group-data-[variant=warning]:text-(--color-toast-warning-close-icon) group-data-[variant=warning]:hover:text-(--color-toast-warning-close-icon)",
  "group-data-[variant=info]:text-(--color-toast-info-close-icon) group-data-[variant=info]:hover:text-(--color-toast-info-close-icon)",
].join(" ");

type ToastActionProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "col-start-2 row-start-2 mt-(--space-toast-controls-gap) self-end justify-self-end inline-flex shrink-0 items-center justify-center rounded-(--space-toast-action-radius) border-(length:--space-toast-border-width) bg-transparent transition-colors hover:bg-(--color-toast-action-hover)",
        focusRingClasses,
        "disabled:pointer-events-none disabled:text-(--color-toast-action-text-disabled) disabled:border-(--color-toast-action-border-disabled)",
        "h-(--space-toast-action-height)",
        "px-(--space-toast-action-padding-x)",
        "text-(length:--font-size-toast-action-font-size) leading-(--line-height-toast-action-line-height)",
        "font-(--font-weight-toast-description-font-weight)",
        solidControlFill,
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
        "col-start-2 row-start-1 self-start justify-self-end inline-flex shrink-0 items-center justify-center p-(--space-toast-close-button-padding) text-(--color-toast-close) opacity-(--toast-close-button-opacity) transition-opacity hover:text-(--color-toast-close-hover) focus:opacity-(--toast-close-button-opacity-hover)",
        focusRingClasses,
        "group-hover:opacity-(--toast-close-button-opacity-hover)",
        "rounded-(--space-toast-close-button-radius)",
        "h-(--space-toast-close-size) w-(--space-toast-close-size)",
        solidCloseColor,
        solidControlFill,
        className
      )}
      aria-label={srText}
      {...props}
    >
      <Icon
        icon={XIcon}
        className="h-(--space-toast-close-button-icon-size) w-(--space-toast-close-button-icon-size) shrink-0"
      />
      <span className="sr-only">{srText}</span>
    </button>
  )
);
ToastClose.displayName = "ToastClose";

type ToastTitleProps = React.HTMLAttributes<HTMLDivElement>;

const ToastTitle = React.forwardRef<HTMLDivElement, ToastTitleProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "col-start-1",
        "font-(--font-weight-toast-title-font-weight)",
        "text-(length:--font-size-toast-title-font-size) leading-(--line-height-toast-title-line-height)",
        className
      )}
      {...props}
    />
  )
);
ToastTitle.displayName = "ToastTitle";

type ToastDescriptionProps = React.HTMLAttributes<HTMLDivElement>;

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  ToastDescriptionProps
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "col-start-1 not-first:mt-(--space-toast-content-gap)",
      "opacity-(--toast-description-opacity)",
      "text-(length:--font-size-toast-description-font-size) leading-(--line-height-toast-description-line-height)",
      className
    )}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

// ─── Imperative toast API ────────────────────────────────────────────────────

type ToastData = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "warning" | "success" | "info";
  duration?: number;
};

type ToastState = {
  toasts: ToastData[];
};

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(toasts: ToastData[]) {
  memoryState = { toasts };
  listeners.forEach((l) => l(memoryState));
}

export function toast(data: Omit<ToastData, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast = { ...data, id, duration: data.duration ?? 5000 };
  dispatch([...memoryState.toasts, newToast]);
  if (newToast.duration !== 0) {
    setTimeout(() => {
      dispatch(memoryState.toasts.filter((t) => t.id !== id));
    }, newToast.duration);
  }
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
  return {
    toasts: state.toasts,
    toast,
    dismiss: (id: string) =>
      dispatch(memoryState.toasts.filter((t) => t.id !== id)),
  };
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      className="fixed bottom-0 right-0 z-(--toast-viewport-z-index) flex max-h-screen w-full flex-col-reverse gap-(--space-toast-viewport-gap) p-(--space-toast-viewport-padding) sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-(--space-toast-max-width)"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant} role="status" aria-atomic="true">
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && (
            <ToastDescription>{t.description}</ToastDescription>
          )}
          <ToastClose onClick={() => dismiss(t.id)} />
        </Toast>
      ))}
    </div>
  );
}

export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription };
