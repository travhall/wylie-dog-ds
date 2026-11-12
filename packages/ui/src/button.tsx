// button.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, focusRingClasses } from "./lib/utils";
import { Icon } from "./icon";

export const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-(--space-button-icon-gap) font-(--font-weight-button-font-weight) leading-(--line-height-button-line-height) border-(length:--button-border-width) transition-colors",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--button-opacity-disabled)",
    // An icon (the `icon` prop, an `Icon` child or any svg) is sized by the button's size and
    // draws its stroke as written, whatever size it was given; it takes the label's colour
    // through currentColor.
    "[&_svg]:shrink-0 [&_svg_*]:[vector-effect:non-scaling-stroke]"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-(--color-button-primary-background) not-disabled:hover:bg-(--color-button-primary-background-hover) not-disabled:active:bg-(--color-button-primary-background-active) text-(--color-button-primary-text) border-(--color-button-primary-border)",
        secondary:
          "bg-(--color-button-secondary-background) not-disabled:hover:bg-(--color-button-secondary-background-hover) not-disabled:active:bg-(--color-button-secondary-background-active) text-(--color-button-secondary-text) border-(--color-button-secondary-border)",
        outline:
          "border-(--color-button-outline-border) bg-(--color-button-outline-background) not-disabled:hover:bg-(--color-button-outline-background-hover) not-disabled:active:bg-(--color-button-outline-background-active) text-(--color-button-outline-text)",
        ghost:
          "bg-(--color-button-ghost-background) not-disabled:hover:bg-(--color-button-ghost-background-hover) not-disabled:active:bg-(--color-button-ghost-background-active) text-(--color-button-ghost-text) border-transparent",
        link: "text-(--color-button-link-text) underline-offset-(--space-button-link-underline-offset) not-disabled:hover:underline bg-transparent border-transparent p-0 h-auto",
        destructive:
          "bg-(--color-button-destructive-background) not-disabled:hover:bg-(--color-button-destructive-background-hover) not-disabled:active:bg-(--color-button-destructive-background-active) text-(--color-button-destructive-text) border-(--color-button-destructive-border)",
      },
      size: {
        default:
          "px-(--space-button-padding-x-md) py-(--space-button-padding-y-md) text-(length:--font-size-button-font-size-md) rounded-(--space-button-radius) [&_svg]:h-(--space-button-icon-size-md) [&_svg]:w-(--space-button-icon-size-md) [&_svg]:stroke-(length:--space-icon-stroke-width-sm)",
        sm: "px-(--space-button-padding-x-sm) py-(--space-button-padding-y-sm) text-(length:--font-size-button-font-size-sm) rounded-(--space-button-radius) [&_svg]:h-(--space-button-icon-size-sm) [&_svg]:w-(--space-button-icon-size-sm) [&_svg]:stroke-(length:--space-icon-stroke-width-sm)",
        md: "px-(--space-button-padding-x-md) py-(--space-button-padding-y-md) text-(length:--font-size-button-font-size-md) rounded-(--space-button-radius) [&_svg]:h-(--space-button-icon-size-md) [&_svg]:w-(--space-button-icon-size-md) [&_svg]:stroke-(length:--space-icon-stroke-width-sm)",
        lg: "px-(--space-button-padding-x-lg) py-(--space-button-padding-y-lg) text-(length:--font-size-button-font-size-lg) rounded-(--space-button-radius) [&_svg]:h-(--space-button-icon-size-lg) [&_svg]:w-(--space-button-icon-size-lg) [&_svg]:stroke-(length:--space-icon-stroke-width-sm)",
        icon: "h-(--space-button-icon-only-size) w-(--space-button-icon-only-size) rounded-(--space-button-radius) [&_svg]:h-(--space-button-icon-only-icon-size) [&_svg]:w-(--space-button-icon-only-icon-size) [&_svg]:stroke-(length:--space-icon-stroke-width-md)",
      },
    },
    compoundVariants: [
      {
        // A link is plain underlined text: the size padding must not apply to it. Compound
        // classes come after the size classes, so these win where `p-0` on the variant lost.
        variant: "link",
        size: ["default", "sm", "md", "lg"],
        className: "px-0 py-0 h-auto",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// The `icon` prop's size follows the button's size: 12px in sm (under its 14px line, so an icon never
// grows the button), 16px in md and lg (the sm stroke), 24px in the
// icon-only button (the md stroke). The pairs are checked by
// scripts/__tests__/icon-stroke-tier.test.mjs.
const buttonIcons = {
  default: {
    size: "sm",
    className:
      "h-(--space-button-icon-size-md) w-(--space-button-icon-size-md)",
  },
  sm: {
    size: "sm",
    className:
      "h-(--space-button-icon-size-sm) w-(--space-button-icon-size-sm)",
  },
  md: {
    size: "sm",
    className:
      "h-(--space-button-icon-size-md) w-(--space-button-icon-size-md)",
  },
  lg: {
    size: "sm",
    className:
      "h-(--space-button-icon-size-lg) w-(--space-button-icon-size-lg)",
  },
  icon: {
    size: "md",
    className:
      "h-(--space-button-icon-only-icon-size) w-(--space-button-icon-only-icon-size)",
  },
} as const;

const ButtonGlyph = ({
  icon,
  buttonSize,
}: {
  icon: React.ElementType;
  buttonSize: "default" | "sm" | "md" | "lg" | "icon" | null | undefined;
}) => {
  const glyph = buttonIcons[buttonSize ?? "default"];
  return (
    <Icon
      icon={icon}
      size={glyph.size}
      className={glyph.className}
      aria-hidden="true"
    />
  );
};

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  /**
   * An icon before the label: a lucide-react icon or any component that renders an SVG. The
   * button sizes it (12px in sm, 16px in md and lg, 24px in `size="icon"`), draws its stroke and hides it from assistive
   * technology, so give an icon-only button an `aria-label`. While `loading` the spinner takes its
   * place.
   */
  icon?: React.ElementType;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      disabled,
      icon,
      type = "button",
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const isIconLoading = loading && size === "icon";
    const ariaLabel =
      props["aria-label"] ?? (isIconLoading ? "Loading" : undefined);

    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        {...props}
      >
        {loading && (
          <span
            className="inline-block w-(--space-button-spinner-size) h-(--space-button-spinner-size) border-(length:--space-button-spinner-border-width) border-current border-t-transparent rounded-(--space-button-spinner-radius) wd-motion-spin [--wd-motion-duration:var(--duration-button-spinner-duration)] [--wd-motion-easing:var(--button-spinner-easing)]"
            aria-hidden="true"
          />
        )}
        {icon && !loading && <ButtonGlyph icon={icon} buttonSize={size} />}
        {!(loading && size === "icon") && children}
      </button>
    );
  }
);

Button.displayName = "Button";
