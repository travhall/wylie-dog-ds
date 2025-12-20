import React from "react";
import { cn } from "../lib/utils";
import { Button } from "../button";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../navigation-menu";

export interface SiteHeaderProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "transparent";
  logo?: React.ReactNode;
  navigation?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode;
}

export const SiteHeader = React.forwardRef<HTMLElement, SiteHeaderProps>(
  (
    {
      className,
      variant = "default",
      logo,
      navigation = [],
      actions,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-(--color-background-primary) border-b border-(--color-border-primary) sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-(--color-background-primary)/95",
      transparent: "bg-transparent border-b border-transparent",
    };

    return (
      <header
        className={cn(
          "w-full transition-colors duration-200",
          variants[variant],
          className
        )}
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
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-(--color-background-primary) px-4 py-2 text-sm font-medium transition-colors hover:bg-(--color-interactive-secondary) hover:text-(--color-text-primary) focus:bg-(--color-interactive-secondary) focus:text-(--color-text-primary) focus:outline-none disabled:pointer-events-none disabled:opacity-50"
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
