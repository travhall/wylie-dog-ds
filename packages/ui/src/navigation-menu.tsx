import React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { createPortal } from "react-dom";
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
      "relative z-(--navigation-menu-z-index) flex max-w-max flex-1 items-center justify-center data-[orientation=vertical]:items-start data-[orientation=vertical]:justify-start",
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
      // vertical: the items stack, spaced by the same gap
      "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:justify-start data-[orientation=vertical]:space-x-0 data-[orientation=vertical]:space-y-(--space-navigation-menu-list-gap)",
      className
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cn(
  "group inline-flex h-(--space-navigation-menu-trigger-height) w-max items-center justify-center rounded-(--space-navigation-menu-trigger-radius) bg-(--color-navigation-background) px-(--space-navigation-menu-trigger-padding-x) py-(--space-navigation-menu-trigger-padding-y) text-(length:--font-size-navigation-menu-trigger-font-size) leading-(--line-height-navigation-menu-trigger-line-height) font-(--font-weight-navigation-menu-trigger-font-weight) transition-colors",
  "not-disabled:hover:bg-(--color-navigation-background-hover) not-disabled:hover:text-(--color-navigation-text-hover)",
  "focus:bg-(--color-navigation-highlighted) focus:text-(--color-navigation-text-highlighted)",
  focusRingClasses,
  "disabled:cursor-not-allowed disabled:opacity-(--navigation-opacity-disabled)",
  "data-[active]:bg-(--color-navigation-active) data-[state=open]:bg-(--color-navigation-open)",
  // in a vertical list each item fills the row, its label first and its chevron last
  "group-data-[orientation=vertical]:w-full group-data-[orientation=vertical]:justify-between"
);

// A link inside an open menu: a padded row with the trigger's hover, highlight and
// active fills. Opt in by class, like navigationMenuTriggerStyle for top-level links.
const navigationMenuLinkStyle = cn(
  "block select-none rounded-(--space-navigation-menu-link-radius) px-(--space-navigation-menu-link-padding-x) py-(--space-navigation-menu-link-padding-y) text-(length:--font-size-navigation-menu-trigger-font-size) leading-(--line-height-navigation-menu-trigger-line-height) text-(--color-navigation-content-text) no-underline transition-colors",
  "not-disabled:hover:bg-(--color-navigation-background-hover) not-disabled:hover:text-(--color-navigation-text-hover)",
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
      size="sm"
      className="relative top-(--space-navigation-menu-trigger-icon-offset-top) ml-(--space-navigation-menu-indicator-margin-left) h-(--space-navigation-menu-trigger-icon-size) w-(--space-navigation-menu-trigger-icon-size) transition duration-(--duration-navigation-menu-indicator-duration) group-data-[state=open]:rotate-180 group-data-[orientation=vertical]:-rotate-90 group-data-[orientation=vertical]:group-data-[state=open]:-rotate-90"
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
      "left-0 top-0 w-full data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out md:absolute md:w-auto",
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
>(({ className, ...props }, ref) => {
  const anchorRef = React.useRef<HTMLSpanElement>(null);
  const [box, setBox] = React.useState<{ top: number; left: number } | null>(
    null
  );

  // Like the popover, dropdown menu and hover card, the panel is portalled to the body, so an
  // ancestor with overflow, a transform or its own stacking context (a docs canvas, a header)
  // cannot clip it or put it under something else. It is placed from the menu's own box: below
  // it, or beside it when the menu is vertical. The anchor span marks where the menu is.
  React.useLayoutEffect(() => {
    const root = anchorRef.current?.parentElement;
    if (!root) return;
    const measure = () => {
      const rect = root.getBoundingClientRect();
      const next =
        root.getAttribute("data-orientation") === "vertical"
          ? { top: rect.top, left: rect.right }
          : { top: rect.bottom, left: rect.left };
      setBox((prev) =>
        prev && prev.top === next.top && prev.left === next.left ? prev : next
      );
    };
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(root);
    observer?.observe(document.body);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      observer?.disconnect();
    };
  }, []);

  return (
    <>
      <span ref={anchorRef} hidden />
      {box &&
        createPortal(
          <div
            className="fixed z-(--navigation-menu-z-index) flex justify-center"
            style={{ top: box.top, left: box.left }}
          >
            <NavigationMenuPrimitive.Viewport
              className={cn(
                "wd-motion-pop [--wd-motion-duration:var(--duration-navigation-menu-viewport-duration)] [--wd-motion-easing:var(--navigation-menu-viewport-easing)] [--wd-motion-scale:var(--navigation-menu-viewport-scale)]",
                "data-[orientation=vertical]:mt-0 data-[orientation=vertical]:ml-(--space-navigation-menu-indicator-margin-top)",
                "origin-top-center relative mt-(--space-navigation-menu-indicator-margin-top) h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-(--space-navigation-menu-trigger-radius) border-(length:--space-navigation-menu-border-width) border-(--color-navigation-content-border) bg-(--color-navigation-content-background) text-(--color-navigation-content-text) shadow-(--shadow-navigation-menu-viewport-shadow) md:w-(--radix-navigation-menu-viewport-width)",
                className
              )}
              ref={ref}
              {...props}
            />
          </div>,
          document.body
        )}
    </>
  );
});
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
