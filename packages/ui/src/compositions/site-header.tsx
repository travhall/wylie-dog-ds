import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Button } from "../button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../navigation-menu";

export const siteHeaderVariants = cva(
  "w-full transition-colors duration-(--duration-200)",
  {
    variants: {
      variant: {
        default:
          "bg-(--color-site-header-background) border-b border-(--color-site-header-border) sticky top-0 z-(--z-index-sticky) backdrop-blur supports-[backdrop-filter]:bg-(--color-site-header-background)/95",
        transparent: "bg-transparent border-b border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const siteHeaderInnerVariants = cva("flex items-center justify-between", {
  variants: {
    size: {
      default: "h-16",
      sm: "h-14",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SiteHeaderProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof siteHeaderVariants>,
    VariantProps<typeof siteHeaderInnerVariants> {
  logo?: React.ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode;
  containerClassName?: string;
  renderNavItem?: (
    item: { label: string; href: string },
    index: number
  ) => React.ReactNode;
}

export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  (
    {
      className,
      variant,
      size,
      logo,
      navigation = [],
      actions,
      containerClassName,
      renderNavItem,
      ...props
    },
    ref
  ) => {
    return (
      <header
        className={cn(siteHeaderVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        <div
          className={cn(
            "container mx-auto px-4 sm:px-6 lg:px-8",
            containerClassName
          )}
        >
          <div className={siteHeaderInnerVariants({ size })}>
            {/* Logo Section */}
            <div className="flex items-center">
              {logo || (
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-(length:--font-size-heading-sm) font-(--font-weight-bold)">
                    Logo
                  </span>
                </a>
              )}
            </div>

            {/* Navigation Section */}
            {navigation.length > 0 && (
              <NavigationMenu
                className="hidden md:flex"
                aria-label="Main navigation"
              >
                <NavigationMenuList>
                  {navigation.map((item, index) =>
                    renderNavItem ? (
                      renderNavItem(item, index)
                    ) : (
                      <NavigationMenuItem key={index}>
                        <NavigationMenuLink
                          href={item.href}
                          className="group inline-flex h-9 w-max items-center justify-center rounded-(--border-radius-md) bg-(--color-site-header-nav-link-background) px-4 py-2 text-(length:--font-size-sm) font-(--font-weight-medium) transition-colors hover:bg-(--color-site-header-nav-link-background-hover) hover:text-(--color-site-header-nav-link-text-hover) focus:bg-(--color-site-header-nav-link-background-highlighted) focus:text-(--color-site-header-nav-link-text-highlighted) focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none disabled:pointer-events-none disabled:text-(--color-site-header-nav-link-text-disabled)"
                        >
                          {item.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Actions Section */}
            <div className="flex items-center space-x-4">
              {actions || (
                <>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                  <Button variant="default" size="sm">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }
);

SiteHeader.displayName = "SiteHeader";
