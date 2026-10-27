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
  "w-full transition-colors duration-(--duration-site-header-transition-duration)",
  {
    variants: {
      variant: {
        default:
          "bg-(--color-site-header-background) border-b border-(--color-site-header-border) sticky top-0 z-(--site-header-z-index) backdrop-blur supports-[backdrop-filter]:bg-(--color-site-header-background)/95",
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
      default: "h-(--space-site-header-height)",
      sm: "h-(--space-site-header-height-sm)",
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
  /**
   * Custom renderer for a navigation link. Return only the link: SiteHeader
   * wraps the result in a `NavigationMenuItem` (the list item), so the
   * navigation list stays valid. Do not return a `NavigationMenuItem`.
   */
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
            "container mx-auto px-(--space-site-header-container-padding-x-sm) sm:px-(--space-site-header-container-padding-x-md) lg:px-(--space-site-header-container-padding-x-lg)",
            containerClassName
          )}
        >
          <div className={siteHeaderInnerVariants({ size })}>
            {/* Logo Section */}
            <div className="flex items-center">
              {logo || (
                <a
                  href="/"
                  className="flex items-center space-x-(--space-site-header-logo-gap)"
                >
                  <span className="text-(length:--font-size-site-header-logo-font-size) font-(--font-weight-site-header-logo-font-weight)">
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
                  {navigation.map((item, index) => (
                    <NavigationMenuItem key={index}>
                      {renderNavItem ? (
                        renderNavItem(item, index)
                      ) : (
                        <NavigationMenuLink
                          href={item.href}
                          className="group inline-flex h-(--space-site-header-nav-link-height) w-max items-center justify-center rounded-(--space-site-header-nav-link-radius) bg-(--color-site-header-nav-link-background) px-(--space-site-header-nav-link-padding-x) py-(--space-site-header-nav-link-padding-y) text-(length:--font-size-site-header-nav-link-font-size) font-(--font-weight-site-header-nav-link-font-weight) transition-colors hover:bg-(--color-site-header-nav-link-background-hover) hover:text-(--color-site-header-nav-link-text-hover) focus:bg-(--color-site-header-nav-link-background-highlighted) focus:text-(--color-site-header-nav-link-text-highlighted) focus-visible:outline-solid focus-visible:outline-(length:--space-focus-width) focus-visible:outline-(color:--color-focus-ring) focus-visible:outline-offset-(length:--space-focus-offset) focus-visible:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus-visible:transition-none disabled:pointer-events-none disabled:text-(--color-site-header-nav-link-text-disabled)"
                        >
                          {item.label}
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {/* Actions Section */}
            <div className="flex items-center space-x-(--space-site-header-actions-gap)">
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
