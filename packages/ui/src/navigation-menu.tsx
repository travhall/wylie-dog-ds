import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDownIcon } from "lucide-react";
import { Icon } from "./icon";
import { cn, focusRingClasses } from "./lib/utils";

const NavigationMenu = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-(--navigation-menu-z-index) flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center space-x-(--space-navigation-menu-list-gap)",
      className
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cn(
  "group inline-flex h-(--space-navigation-menu-trigger-height) w-max items-center justify-center rounded-(--space-navigation-menu-trigger-radius) bg-(--color-navigation-background) px-(--space-navigation-menu-trigger-padding-x) py-(--space-navigation-menu-trigger-padding-y) text-(length:--font-size-navigation-menu-trigger-font-size) leading-(--line-height-navigation-menu-trigger-line-height) font-(--font-weight-navigation-menu-trigger-font-weight) transition-colors",
  "hover:bg-(--color-navigation-background-hover) hover:text-(--color-navigation-text-hover)",
  "focus:bg-(--color-navigation-highlighted) focus:text-(--color-navigation-text-highlighted)",
  focusRingClasses,
  "disabled:pointer-events-none disabled:text-(--color-navigation-text-disabled)",
  "data-[active]:bg-(--color-navigation-active) data-[state=open]:bg-(--color-navigation-open)"
);

// A link inside an open menu: a padded row with the trigger's hover, highlight and
// active fills. Opt in by class, like navigationMenuTriggerStyle for top-level links.
const navigationMenuLinkStyle = cn(
  "block select-none rounded-(--space-navigation-menu-link-radius) px-(--space-navigation-menu-link-padding-x) py-(--space-navigation-menu-link-padding-y) text-(length:--font-size-navigation-menu-trigger-font-size) leading-(--line-height-navigation-menu-trigger-line-height) text-(--color-navigation-content-text) no-underline transition-colors",
  "hover:bg-(--color-navigation-background-hover) hover:text-(--color-navigation-text-hover)",
  "focus:bg-(--color-navigation-highlighted) focus:text-(--color-navigation-text-highlighted)",
  focusRingClasses,
  "data-[active]:bg-(--color-navigation-active)"
);

const NavigationMenuTrigger = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle, "group", className)}
    {...props}
  >
    {children}{" "}
    <Icon
      icon={ChevronDownIcon}
      className="relative top-(--space-navigation-menu-trigger-icon-offset-top) ml-(--space-navigation-menu-indicator-margin-left) h-(--space-navigation-menu-trigger-icon-size) w-(--space-navigation-menu-trigger-icon-size) transition duration-(--duration-navigation-menu-indicator-duration) group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "left-0 top-0 w-full data-[motion^ data-[motion^ data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out md:absolute md:w-auto",
      className
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div className={cn("absolute left-0 top-full flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "wd-motion-pop [--wd-motion-duration:var(--duration-navigation-menu-viewport-duration)] [--wd-motion-easing:var(--navigation-menu-viewport-easing)] [--wd-motion-scale:var(--navigation-menu-viewport-scale)]",
        "origin-top-center relative mt-(--space-navigation-menu-indicator-margin-top) h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-(--space-navigation-menu-trigger-radius) border-(length:--space-navigation-menu-border-width) border-(--color-navigation-content-border) bg-(--color-navigation-content-background) text-(--color-navigation-content-text) shadow-(--shadow-navigation-menu-viewport-shadow) md:w-(--radix-navigation-menu-viewport-width)",
        className
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ComponentRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "top-full z-(--navigation-menu-indicator-z-index) flex h-(--space-navigation-menu-indicator-height) items-end justify-center overflow-hidden data-[state=hidden]:fade-out data-[state=visible]:fade-in",
      className
    )}
    {...props}
  >
    <div className="relative top-[60%] h-(--space-navigation-menu-arrow-size) w-(--space-navigation-menu-arrow-size) rotate-45 rounded-tl-(--space-navigation-menu-arrow-radius) bg-(--color-navigation-indicator) shadow-(--shadow-navigation-menu-arrow-shadow)" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  navigationMenuLinkStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
