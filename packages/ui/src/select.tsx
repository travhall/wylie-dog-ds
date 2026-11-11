import { ChevronDownIcon } from "lucide-react";
import { Icon } from "./icon";
import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cva } from "class-variance-authority";
import { cn, focusRingClasses, focusRingInsetClasses } from "./lib/utils";

export const selectTriggerVariants = cva(
  cn(
    "flex w-full items-center justify-between border-(length:--space-select-border-width) border-(--color-input-border) transition-colors",
    "rounded-(--space-select-trigger-radius)",
    // Radix marks an empty trigger with data-placeholder; the placeholder: variant only
    // matches the ::placeholder pseudo-element of an input, never a button
    "data-[placeholder]:text-(--color-input-placeholder)",
    focusRingClasses,
    "disabled:cursor-not-allowed disabled:opacity-(--select-opacity-disabled)",
    "[&>span]:line-clamp-1",
    "text-(--color-input-default-text)"
  ),
  {
    variants: {
      size: {
        sm: "py-(--space-select-trigger-padding-y-sm) px-(--space-select-trigger-padding-x-sm) text-(length:--font-size-select-trigger-font-size-sm) leading-(--line-height-select-trigger-line-height)",
        md: "py-(--space-select-trigger-padding-y-md) px-(--space-select-trigger-padding-x-md) text-(length:--font-size-select-trigger-font-size-md) leading-(--line-height-select-trigger-line-height)",
        lg: "py-(--space-select-trigger-padding-y-lg) px-(--space-select-trigger-padding-x-lg) text-(length:--font-size-select-trigger-font-size-lg) leading-(--line-height-select-trigger-line-height)",
      },
      error: {
        true: "border-(--color-input-border-error) bg-(--color-input-default-background)",
        false:
          "border-(--color-input-border) bg-(--color-input-default-background) hover:bg-(--color-input-background-hover)",
      },
    },
    defaultVariants: {
      size: "md",
      error: false,
    },
  }
);

const selectItemFontSizes = {
  sm: "text-(length:--font-size-select-trigger-font-size-sm) leading-(--line-height-select-trigger-line-height)",
  md: "text-(length:--font-size-select-trigger-font-size-md) leading-(--line-height-select-trigger-line-height)",
  lg: "text-(length:--font-size-select-trigger-font-size-lg) leading-(--line-height-select-trigger-line-height)",
} as const;

// Select Context
type SelectContextValue = {
  size: "sm" | "md" | "lg";
};

const SelectContext = React.createContext<SelectContextValue>({
  size: "md",
});

const useSelectContext = () => React.useContext(SelectContext);

// Select Root
export interface SelectProps extends React.ComponentProps<
  typeof SelectPrimitive.Root
> {
  size?: "sm" | "md" | "lg";
}

export const Select: React.FC<SelectProps> = ({
  size = "md",
  children,
  ...props
}) => (
  <SelectContext.Provider value={{ size }}>
    <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>
  </SelectContext.Provider>
);

export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

// Select Trigger
export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Trigger
> {
  /** @deprecated Size should be passed to the Select root component */
  size?: "sm" | "md" | "lg";
  error?: boolean;
}

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, size: propSize, error = false, children, ...props }, ref) => {
  const context = useSelectContext();
  // Fallback to propSize for backward compatibility, otherwise use context
  const size = propSize || context.size;

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(selectTriggerVariants({ size, error }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <Icon
          icon={ChevronDownIcon}
          className="h-(--space-select-trigger-icon-size) w-(--space-select-trigger-icon-size) opacity-(--select-trigger-icon-opacity)"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

// Select Content
export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "wd-motion-float [--wd-motion-duration:var(--duration-select-content-duration)] [--wd-motion-easing:var(--select-content-easing)] [--wd-motion-distance:var(--space-select-content-distance)] [--wd-motion-scale:var(--select-content-scale)] relative z-(--select-content-z-index) overflow-hidden border-(length:--space-select-border-width) border-(--color-input-border)",
        "max-h-(--space-select-content-max-height)",
        "min-w-(--space-select-content-min-width)",
        "rounded-(--space-select-content-radius)",
        "bg-(--color-select-content-background) text-(--color-select-content-text) shadow-(--shadow-select-content-shadow)",
        position === "popper" &&
          "data-[side=bottom]:mt-(--space-select-content-side-offset) data-[side=top]:mb-(--space-select-content-side-offset) data-[side=left]:mr-(--space-select-content-side-offset) data-[side=right]:ml-(--space-select-content-side-offset)",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-(--space-select-content-padding)",
          position === "popper" &&
            "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

// Select Item
export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  const { size } = useSelectContext();

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center outline-hidden",
        focusRingInsetClasses,
        "rounded-(--space-select-item-radius)",
        "py-(--space-select-item-padding-y)",
        "pl-(--space-select-item-padding-left)",
        "pr-(--space-select-item-padding-right)",
        selectItemFontSizes[size],
        "focus:bg-(--color-select-item-background-highlighted) focus:text-(--color-select-item-text-highlighted) hover:bg-(--color-select-item-background-highlighted) hover:text-(--color-select-item-text-highlighted)",
        "data-disabled:pointer-events-none data-disabled:opacity-(--select-opacity-disabled)",
        className
      )}
      {...props}
    >
      <span className="absolute left-(--space-select-item-indicator-left) flex h-(--space-select-item-indicator-size) w-(--space-select-item-indicator-size) items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <svg
            className="h-(--space-select-item-icon-size) w-(--space-select-item-icon-size)"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

// Select Separator
export const SelectSeparator = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-(--space-select-separator-margin-x) my-(--space-select-separator-margin-y) bg-(--color-select-separator-background)",
      "h-(--space-select-separator-height)",
      className
    )}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
