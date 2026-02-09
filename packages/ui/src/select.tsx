import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "./lib/utils";

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

  const sizes = {
    sm: "h-(--spacing-select-trigger-height-sm) px-(--spacing-select-trigger-padding-x-sm) text-(length:--font-size-select-trigger-font-size-sm)",
    md: "h-(--spacing-select-trigger-height-md) px-(--spacing-select-trigger-padding-x-md) text-(length:--font-size-select-trigger-font-size-md)",
    lg: "h-(--spacing-select-trigger-height-lg) px-(--spacing-select-trigger-padding-x-lg) text-(length:--font-size-select-trigger-font-size-lg)",
  };

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between border transition-colors",
        "rounded-(--spacing-select-trigger-radius)",
        "placeholder:text-(--color-input-placeholder)",
        "focus:outline-none focus:ring-2 focus:ring-(--color-input-border-focus) focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-(--state-opacity-disabled)",
        "[&>span]:line-clamp-1",
        error
          ? "border-(--color-input-border-error) bg-(--color-input-background)"
          : "border-(--color-input-border) bg-(--color-input-background) hover:bg-(--color-input-background-hover)",
        "text-(--color-input-text)",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <svg
          className="h-(--spacing-icon-size-md) w-(--spacing-icon-size-md) opacity-(--state-opacity-disabled)"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
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
        "relative z-50 overflow-hidden border",
        "max-h-(--spacing-select-content-max-height)",
        "min-w-(--spacing-select-content-min-width)",
        "rounded-(--spacing-select-content-radius)",
        "bg-(--color-background-primary) text-(--color-text-primary) shadow-(--shadow-md)",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-(--spacing-select-content-padding)",
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

  const fontSizes = {
    sm: "text-(length:--font-size-select-trigger-font-size-sm)",
    md: "text-(length:--font-size-select-trigger-font-size-md)",
    lg: "text-(length:--font-size-select-trigger-font-size-lg)",
  };

  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center outline-none",
        "rounded-(--spacing-select-item-radius)",
        "py-(--spacing-select-item-padding-y)",
        "pl-(--spacing-select-item-padding-left)",
        "pr-(--spacing-select-item-padding-right)",
        fontSizes[size],
        "focus:bg-(--color-interactive-secondary) focus:text-(--color-text-primary)",
        "data-disabled:pointer-events-none data-disabled:opacity-(--state-opacity-disabled)",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-(--spacing-icon-size-sm) w-(--spacing-icon-size-sm) items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <svg
            className="h-(--spacing-icon-size-md) w-(--spacing-icon-size-md)"
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
      "-mx-(--spacing-select-separator-margin-x) my-(--spacing-select-separator-margin-y) bg-(--color-border-primary)",
      "h-(--spacing-select-separator-height)",
      className
    )}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
