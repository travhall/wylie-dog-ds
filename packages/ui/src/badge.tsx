// badge.tsx
import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { cn, focusRingClasses } from "./lib/utils";
import { Icon } from "./icon";

export const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-(--space-badge-icon-gap) border-(length:--space-badge-border-width) font-(family-name:--badge-font-family) font-(--font-weight-badge-font-weight) leading-(--line-height-badge-line-height) transition-colors",
    "rounded-(--space-badge-radius)",
    // An icon (the `icon` prop, an `Icon` child, or any svg, the dismiss button's X included) takes
    // the badge's icon size and the sm stroke (every badge icon is 16px or less), whatever size it
    // was given, and the label's colour through currentColor. The stroke is non-scaling so it draws
    // as written, like the Icon component's.
    "[&_svg]:shrink-0 [&_svg]:stroke-(length:--space-icon-stroke-width-sm) [&_svg_*]:[vector-effect:non-scaling-stroke]",
    // The dismiss button: a round target the size of `badge.dismiss-size`. It borrows the badge's
    // vertical padding (a negative margin) so a dismissible badge is as tall as a plain one.
    "[&>button]:inline-flex [&>button]:size-(--space-badge-dismiss-size) [&>button]:shrink-0 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-(--space-badge-radius) [&>button]:transition-colors"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-(--color-badge-default-background) text-(--color-badge-default-text) border-(--color-badge-default-border) [&>button]:hover:bg-(--color-badge-default-background-hover) [&>button]:active:bg-(--color-badge-default-background-active)",
        secondary:
          "bg-(--color-badge-secondary-background) text-(--color-badge-secondary-text) border-(--color-badge-secondary-border) [&>button]:hover:bg-(--color-badge-secondary-background-hover) [&>button]:active:bg-(--color-badge-secondary-background-active)",
        success:
          "bg-(--color-badge-success-background) text-(--color-badge-success-text) border-(--color-badge-success-border) [&>button]:hover:bg-(--color-badge-success-background-hover) [&>button]:active:bg-(--color-badge-success-background-active)",
        warning:
          "bg-(--color-badge-warning-background) text-(--color-badge-warning-text) border-(--color-badge-warning-border) [&>button]:hover:bg-(--color-badge-warning-background-hover) [&>button]:active:bg-(--color-badge-warning-background-active)",
        info: "bg-(--color-badge-info-background) text-(--color-badge-info-text) border-(--color-badge-info-border) [&>button]:hover:bg-(--color-badge-info-background-hover) [&>button]:active:bg-(--color-badge-info-background-active)",
        destructive:
          "bg-(--color-badge-destructive-background) text-(--color-badge-destructive-text) border-(--color-badge-destructive-border) [&>button]:hover:bg-(--color-badge-destructive-background-hover) [&>button]:active:bg-(--color-badge-destructive-background-active)",
        outline:
          "bg-(--color-badge-outline-background) text-(--color-badge-outline-text) border-(--color-badge-outline-border) [&>button]:hover:bg-(--color-badge-outline-background-hover) [&>button]:active:bg-(--color-badge-outline-background-active)",
      },
      size: {
        sm: "px-(--space-badge-padding-x-sm) py-(--space-badge-padding-y-sm) text-(length:--font-size-badge-font-size-sm) [&_svg]:h-(--space-badge-icon-size-sm) [&_svg]:w-(--space-badge-icon-size-sm) [&>button]:-my-(--space-badge-padding-y-sm)",
        md: "px-(--space-badge-padding-x-md) py-(--space-badge-padding-y-md) text-(length:--font-size-badge-font-size-md) [&_svg]:h-(--space-badge-icon-size-md) [&_svg]:w-(--space-badge-icon-size-md) [&>button]:-my-(--space-badge-padding-y-md)",
        lg: "px-(--space-badge-padding-x-lg) py-(--space-badge-padding-y-lg) text-(length:--font-size-badge-font-size-lg) [&_svg]:h-(--space-badge-icon-size-lg) [&_svg]:w-(--space-badge-icon-size-lg) [&>button]:-my-(--space-badge-padding-y-lg)",
      },
      interactive: {
        true: cn(
          "cursor-pointer",
          focusRingClasses,
          "disabled:cursor-not-allowed disabled:opacity-(--badge-opacity-disabled)",
          "aria-disabled:cursor-not-allowed aria-disabled:opacity-(--badge-opacity-disabled)"
        ),
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-default-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-default-background-active)",
      },
      {
        variant: "secondary",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-secondary-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-secondary-background-active)",
      },
      {
        variant: "success",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-success-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-success-background-active)",
      },
      {
        variant: "warning",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-warning-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-warning-background-active)",
      },
      {
        variant: "info",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-info-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-info-background-active)",
      },
      {
        variant: "destructive",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-destructive-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-destructive-background-active)",
      },
      {
        variant: "outline",
        interactive: true,
        className:
          "not-disabled:not-aria-disabled:hover:bg-(--color-badge-outline-background-hover) not-disabled:not-aria-disabled:active:bg-(--color-badge-outline-background-active)",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      interactive: false,
    },
  }
);

// The icon's size follows the badge's size. Each icon is 16px or less, so every one draws the sm
// stroke (the pairs are checked by scripts/__tests__/icon-stroke-tier.test.mjs).
const badgeIcons = {
  sm: {
    size: "sm",
    className: "h-(--space-badge-icon-size-sm) w-(--space-badge-icon-size-sm)",
  },
  md: {
    size: "sm",
    className: "h-(--space-badge-icon-size-md) w-(--space-badge-icon-size-md)",
  },
  lg: {
    size: "sm",
    className: "h-(--space-badge-icon-size-lg) w-(--space-badge-icon-size-lg)",
  },
} as const;

const BadgeGlyph = ({
  icon,
  badgeSize,
}: {
  icon: React.ElementType;
  badgeSize: "sm" | "md" | "lg" | null | undefined;
}) => {
  const glyph = badgeIcons[badgeSize ?? "md"];
  return (
    <Icon
      icon={icon}
      size={glyph.size}
      className={glyph.className}
      aria-hidden="true"
    />
  );
};

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Render the badge's styles on a child element (e.g. `<a>` or `<button>`). */
  asChild?: boolean;
  /**
   * An icon before the label: a lucide-react icon or any component that renders an SVG. The badge
   * sizes it, draws its stroke and hides it from assistive technology, so the label has to carry
   * the meaning. Not used with `asChild`: put the icon inside the child.
   */
  icon?: React.ElementType;
  /**
   * Shows a dismiss button after the label and calls this when it is pressed. The badge itself
   * stays non-interactive (a button inside a button is invalid), so it ignores `interactive` and
   * `asChild`.
   */
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
  /** The dismiss button's accessible name. Name what goes away: "Remove React". */
  dismissLabel?: string;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      asChild = false,
      icon,
      onDismiss,
      dismissLabel = "Dismiss",
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "div";
    const dismissible = !asChild && onDismiss !== undefined;
    const isInteractive = Boolean(interactive) && !dismissible;
    const ariaDisabled = props["aria-disabled"];
    const disabled = ariaDisabled === true || ariaDisabled === "true";
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      props.onKeyDown?.(event);
      if (event.defaultPrevented || disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    };
    // An aria-disabled badge is not a form control, so the browser will not stop its clicks:
    // its own handler is skipped here (a child of `asChild` guards its own).
    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };
    // Only attach a click handler when there is something for it to do. A function prop on the
    // div would stop a plain badge (no onClick, not aria-disabled) from rendering in a React Server
    // Component, and a static label is by far the most common use.
    const clickHandler = onClick || disabled ? handleClick : undefined;
    return (
      <Comp
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, interactive: isInteractive }),
          className
        )}
        {...(isInteractive && !asChild ? { role: "button", tabIndex: 0 } : {})}
        {...props}
        onClick={clickHandler}
        {...(isInteractive && !asChild ? { onKeyDown: handleKeyDown } : {})}
      >
        {asChild ? (
          children
        ) : (
          <>
            {icon && <BadgeGlyph icon={icon} badgeSize={size} />}
            {children}
            {dismissible && (
              <button
                type="button"
                aria-label={dismissLabel}
                onClick={onDismiss}
                className={cn("cursor-pointer", focusRingClasses)}
              >
                <BadgeGlyph icon={XIcon} badgeSize={size} />
              </button>
            )}
          </>
        )}
      </Comp>
    );
  }
);

Badge.displayName = "Badge";
