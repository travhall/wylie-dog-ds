import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Button } from "../button";

export const siteHeaderVariants = cva("w-full transition-colors duration-200", {
  variants: {
    variant: {
      default:
        "bg-(--color-background-primary) border-b border-(--color-border-primary) sticky top-0 z-(--z-index-sticky) backdrop-blur supports-[backdrop-filter]:bg-(--color-background-primary)/95",
      transparent: "bg-transparent border-b border-transparent",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../navigation-menu";

export interface SiteHeaderProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof siteHeaderVariants> {
  logo?: React.ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode;
}

export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  ({ className, variant, logo, navigation = [], actions, ...props }, ref) => {
    return (
      <header
        className={cn(siteHeaderVariants({ variant }), className)}
        ref={ref}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              {logo || (
                <a href="/" className="flex items-center space-x-2">
                  <span className="text-xl font-bold">Logo</span>
                </a>
              )}
            </div>

            {/* Navigation Section */}
            {navigation.length > 0 && (
              <NavigationMenu className="hidden md:flex">
                <NavigationMenuList>
                  {navigation.map((item, index) => (
                    <NavigationMenuItem key={index}>
                      <NavigationMenuLink
                        href={item.href}
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-(--color-background-primary) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--color-interactive-secondary) hover:text-(--color-text-primary) focus:bg-(--color-interactive-secondary) focus:text-(--color-text-primary) focus:outline-none disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)"
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
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
