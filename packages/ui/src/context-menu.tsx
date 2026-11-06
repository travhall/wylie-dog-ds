import React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { Icon } from "./icon";
import { cn, focusRingInsetClasses } from "./lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;
const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
const ContextMenuGroup = ContextMenuPrimitive.Group;
const ContextMenuPortal = ContextMenuPrimitive.Portal;
const ContextMenuSub = ContextMenuPrimitive.Sub;
const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <ContextMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-(--space-context-menu-item-radius) px-(--space-context-menu-item-padding-x) py-(--space-context-menu-item-padding-y) text-(length:--font-size-context-menu-item-font-size) leading-(--line-height-context-menu-item-line-height) outline-hidden focus:bg-(--color-contextmenu-item-hover) data-[state=open]:bg-(--color-contextmenu-item-hover)",
      focusRingInsetClasses,
      inset && "pl-(--space-context-menu-item-inset)",
      className
    )}
    {...props}
  >
    {children}
    <Icon
      icon={ChevronRightIcon}
      className="ml-auto h-(--space-context-menu-item-sub-trigger-icon-size) w-(--space-context-menu-item-sub-trigger-icon-size)"
    />
  </ContextMenuPrimitive.SubTrigger>
));
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "wd-motion-float [--wd-motion-duration:var(--duration-context-menu-content-duration)] [--wd-motion-easing:var(--context-menu-content-easing)] [--wd-motion-distance:var(--space-context-menu-content-distance)] [--wd-motion-scale:var(--context-menu-content-scale)] z-(--context-menu-sub-content-z-index) min-w-(--space-context-menu-sub-content-min-width) overflow-hidden rounded-(--space-context-menu-content-radius) border-(length:--space-contextmenu-border-width) border-(--color-contextmenu-border) bg-(--color-contextmenu-background) p-(--space-context-menu-checkbox-padding) text-(--color-contextmenu-text) shadow-(--shadow-context-menu-sub-content-shadow)",
      className
    )}
    {...props}
  />
));
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref={ref}
      className={cn(
        "wd-motion-float [--wd-motion-duration:var(--duration-context-menu-content-duration)] [--wd-motion-easing:var(--context-menu-content-easing)] [--wd-motion-distance:var(--space-context-menu-content-distance)] [--wd-motion-scale:var(--context-menu-content-scale)] z-(--context-menu-content-z-index) min-w-(--space-context-menu-content-min-width) overflow-hidden rounded-(--space-context-menu-content-radius) border-(length:--space-contextmenu-border-width) border-(--color-contextmenu-border) bg-(--color-contextmenu-background) p-(--space-context-menu-content-padding) text-(--color-contextmenu-text) shadow-(--shadow-context-menu-content-shadow)",
        className
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
));
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-context-menu-item-radius) px-(--space-context-menu-item-padding-x) py-(--space-context-menu-item-padding-y) text-(length:--font-size-context-menu-item-font-size) leading-(--line-height-context-menu-item-line-height) outline-hidden focus:bg-(--color-contextmenu-item-hover) focus:text-(--color-contextmenu-item-text-hover) data-disabled:pointer-events-none data-disabled:text-(--color-contextmenu-item-text-disabled)",
      focusRingInsetClasses,
      inset && "pl-(--space-context-menu-item-inset)",
      className
    )}
    {...props}
  />
));
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <ContextMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-context-menu-item-radius) py-(--space-context-menu-item-padding-y) pl-(--space-context-menu-item-inset) pr-(--space-context-menu-item-padding-x) text-(length:--font-size-context-menu-item-font-size) leading-(--line-height-context-menu-item-line-height) outline-hidden focus:bg-(--color-contextmenu-item-hover) focus:text-(--color-contextmenu-item-text-hover) data-disabled:pointer-events-none data-disabled:text-(--color-contextmenu-item-text-disabled)",
      focusRingInsetClasses,
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-(--space-context-menu-item-indicator-left) flex h-(--space-context-menu-item-indicator-size) w-(--space-context-menu-item-indicator-size) items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Icon
          icon={CheckIcon}
          className="h-(--space-context-menu-item-icon-size) w-(--space-context-menu-item-icon-size)"
        />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.CheckboxItem>
));
ContextMenuCheckboxItem.displayName =
  ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <ContextMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-(--space-context-menu-item-radius) py-(--space-context-menu-item-padding-y) pl-(--space-context-menu-item-inset) pr-(--space-context-menu-item-padding-x) text-(length:--font-size-context-menu-item-font-size) leading-(--line-height-context-menu-item-line-height) outline-hidden focus:bg-(--color-contextmenu-item-hover) focus:text-(--color-contextmenu-item-text-hover) data-disabled:pointer-events-none data-disabled:text-(--color-contextmenu-item-text-disabled)",
      focusRingInsetClasses,
      className
    )}
    {...props}
  >
    <span className="absolute left-(--space-context-menu-item-indicator-left) flex h-(--space-context-menu-item-indicator-size) w-(--space-context-menu-item-indicator-size) items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Icon
          icon={CircleIcon}
          className="h-(--space-context-menu-item-icon-size) w-(--space-context-menu-item-icon-size) fill-current"
        />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </ContextMenuPrimitive.RadioItem>
));
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <ContextMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-(--space-context-menu-item-padding-x) py-(--space-context-menu-item-padding-y) text-(length:--font-size-context-menu-item-font-size) leading-(--line-height-context-menu-item-line-height) font-(--font-weight-context-menu-label-font-weight) text-(--color-contextmenu-label)",
      inset && "pl-(--space-context-menu-item-inset)",
      className
    )}
    {...props}
  />
));
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof ContextMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-(--space-context-menu-separator-margin-x) my-(--space-context-menu-separator-margin-y) h-(--space-contextmenu-separator-height) bg-(--color-contextmenu-separator)",
      className
    )}
    {...props}
  />
));
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-(length:--font-size-context-menu-shortcut-font-size) leading-(--line-height-context-menu-shortcut-line-height) tracking-(--space-context-menu-shortcut-letter-spacing) text-(--color-contextmenu-shortcut)",
        className
      )}
      {...props}
    />
  );
};
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
