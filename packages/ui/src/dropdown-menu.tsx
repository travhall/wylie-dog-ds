import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import { Icon } from "./icon";
import { cn, focusRingInsetClasses } from "./lib/utils";

// Root components
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

// Dropdown Menu Content
export const DropdownMenuContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={cn(
        "data-[side=bottom]:mt-(--space-dropdown-menu-side-offset) data-[side=top]:mb-(--space-dropdown-menu-side-offset) data-[side=left]:mr-(--space-dropdown-menu-side-offset) data-[side=right]:ml-(--space-dropdown-menu-side-offset)",
        "wd-motion-float [--wd-motion-duration:var(--duration-dropdown-menu-content-duration)] [--wd-motion-easing:var(--dropdown-menu-content-easing)] [--wd-motion-distance:var(--space-dropdown-menu-content-distance)] [--wd-motion-scale:var(--dropdown-menu-content-scale)] z-(--dropdown-menu-content-z-index) min-w-(--space-dropdown-menu-content-min-width) overflow-hidden rounded-(--space-dropdown-menu-content-radius) border-(length:--space-dropdown-menu-border-width) border-(--color-dropdown-menu-content-border)",
        "bg-(--color-dropdown-menu-content-background) p-(--space-dropdown-menu-content-padding) text-(--color-dropdown-menu-content-text) shadow-(--shadow-dropdown-menu-content-shadow)",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// Dropdown Menu Item
export const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-dropdown-menu-item-radius) px-(--space-dropdown-menu-item-padding-x) py-(--space-dropdown-menu-item-padding-y) text-(length:--font-size-dropdown-menu-item-font-size) leading-(--line-height-dropdown-menu-item-line-height) outline-hidden transition-colors",
      focusRingInsetClasses,
      "focus:bg-(--color-dropdown-menu-item-background-hover) focus:text-(--color-dropdown-menu-item-text-hover)",
      "data-disabled:pointer-events-none data-disabled:opacity-(--dropdown-menu-item-opacity-disabled)",
      inset && "pl-(--space-dropdown-menu-item-inset)",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// Dropdown Menu Checkbox Item
export const DropdownMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-dropdown-menu-item-radius) py-(--space-dropdown-menu-item-padding-y) pl-(--space-dropdown-menu-item-inset) pr-(--space-dropdown-menu-item-padding-x) text-(length:--font-size-dropdown-menu-item-font-size) leading-(--line-height-dropdown-menu-item-line-height) outline-hidden transition-colors",
      focusRingInsetClasses,
      "focus:bg-(--color-dropdown-menu-item-background-hover) focus:text-(--color-dropdown-menu-item-text-hover)",
      "data-disabled:pointer-events-none data-disabled:opacity-(--dropdown-menu-item-opacity-disabled)",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-(--space-dropdown-menu-item-indicator-left) flex h-(--space-dropdown-menu-item-indicator-size) w-(--space-dropdown-menu-item-indicator-size) items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <svg
          className="h-(--space-dropdown-menu-item-icon-size) w-(--space-dropdown-menu-item-icon-size)"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polyline points="20,6 9,17 4,12" />
        </svg>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName;

// Dropdown Menu Radio Item
export const DropdownMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-dropdown-menu-item-radius) py-(--space-dropdown-menu-item-padding-y) pl-(--space-dropdown-menu-item-inset) pr-(--space-dropdown-menu-item-padding-x) text-(length:--font-size-dropdown-menu-item-font-size) leading-(--line-height-dropdown-menu-item-line-height) outline-hidden transition-colors",
      focusRingInsetClasses,
      "focus:bg-(--color-dropdown-menu-item-background-hover) focus:text-(--color-dropdown-menu-item-text-hover)",
      "data-disabled:pointer-events-none data-disabled:opacity-(--dropdown-menu-item-opacity-disabled)",
      className
    )}
    {...props}
  >
    <span className="absolute left-(--space-dropdown-menu-item-indicator-left) flex h-(--space-dropdown-menu-item-indicator-size) w-(--space-dropdown-menu-item-indicator-size) items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <div className="h-(--space-dropdown-menu-item-radio-indicator-size) w-(--space-dropdown-menu-item-radio-indicator-size) rounded-(--space-dropdown-menu-item-radio-indicator-radius) bg-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// Dropdown Menu Label
export const DropdownMenuLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-(--space-dropdown-menu-item-padding-x) py-(--space-dropdown-menu-item-padding-y) text-(length:--font-size-dropdown-menu-item-font-size) leading-(--line-height-dropdown-menu-item-line-height) font-(--font-weight-dropdown-menu-label-font-weight)",
      inset && "pl-(--space-dropdown-menu-item-inset)",
      className
    )}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// Dropdown Menu Separator
export const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-(--space-dropdown-menu-separator-margin-x) my-(--space-dropdown-menu-separator-margin-y) h-(--space-dropdown-menu-separator-height) bg-(--color-dropdown-menu-separator-background)",
      className
    )}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// Dropdown Menu Sub Trigger
export const DropdownMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-dropdown-menu-item-radius) px-(--space-dropdown-menu-item-padding-x) py-(--space-dropdown-menu-item-padding-y) text-(length:--font-size-dropdown-menu-item-font-size) leading-(--line-height-dropdown-menu-item-line-height) outline-hidden transition-colors",
      focusRingInsetClasses,
      "focus:bg-(--color-dropdown-menu-item-background-hover) focus:text-(--color-dropdown-menu-item-text-hover)",
      "data-[state=open]:bg-(--color-dropdown-menu-item-background-hover)",
      "data-disabled:pointer-events-none data-disabled:opacity-(--dropdown-menu-item-opacity-disabled)",
      inset && "pl-(--space-dropdown-menu-item-inset)",
      className
    )}
    {...props}
  >
    {children}
    <Icon
      icon={ChevronRight}
      className="ml-auto h-(--space-dropdown-menu-item-icon-size) w-(--space-dropdown-menu-item-icon-size)"
    />
  </DropdownMenuPrimitive.SubTrigger>
));
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName;

// Dropdown Menu Sub Content
export const DropdownMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "wd-motion-float [--wd-motion-duration:var(--duration-dropdown-menu-content-duration)] [--wd-motion-easing:var(--dropdown-menu-content-easing)] [--wd-motion-distance:var(--space-dropdown-menu-content-distance)] [--wd-motion-scale:var(--dropdown-menu-content-scale)] z-(--dropdown-menu-content-z-index) min-w-(--space-dropdown-menu-content-min-width) overflow-hidden rounded-(--space-dropdown-menu-content-radius) border-(length:--space-dropdown-menu-border-width) border-(--color-dropdown-menu-content-border)",
      "bg-(--color-dropdown-menu-content-background) p-(--space-dropdown-menu-content-padding) text-(--color-dropdown-menu-content-text) shadow-(--shadow-dropdown-menu-content-shadow)",
      className
    )}
    {...props}
  />
));
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName;

// Dropdown Menu Shortcut
export const DropdownMenuShortcut = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "ml-auto text-(length:--font-size-dropdown-menu-shortcut-font-size) leading-(--line-height-dropdown-menu-shortcut-line-height) tracking-(--space-dropdown-menu-shortcut-letter-spacing) opacity-(--dropdown-menu-shortcut-opacity)",
      className
    )}
    {...props}
  />
));
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
