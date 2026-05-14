import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const pageLayoutMainVariants = cva("flex-1 py-8", {
  variants: {
    variant: {
      default: "container mx-auto px-4 sm:px-6 lg:px-8",
      "full-width": "w-full",
      centered: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface PageLayoutProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof pageLayoutMainVariants> {
  children?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarPosition?: "left" | "right";
}

export const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      className,
      variant,
      header,
      footer,
      sidebar,
      sidebarPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn("min-h-screen flex flex-col", className)}
        ref={ref}
        {...props}
      >
        {/* Skip navigation — lets keyboard users jump past repeated header content (WCAG 2.4.1) */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-(--border-radius-md) focus:bg-(--color-background-primary) focus:px-4 focus:py-2 focus:text-(--color-text-primary) focus:ring-2 focus:ring-(--color-border-focus)"
        >
          Skip to main content
        </a>

        {/* Header */}
        {header && <div className="shrink-0">{header}</div>}

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Sidebar */}
          {sidebar && sidebarPosition === "left" && (
            <aside
              aria-label="Sidebar"
              className="hidden lg:block w-64 shrink-0 border-r border-(--color-border-primary)"
            >
              {sidebar}
            </aside>
          )}

          {/* Main Content */}
          <main
            id="main-content"
            className={pageLayoutMainVariants({ variant })}
          >
            {children}
          </main>

          {/* Right Sidebar */}
          {sidebar && sidebarPosition === "right" && (
            <aside
              aria-label="Sidebar"
              className="hidden lg:block w-64 shrink-0 border-l border-(--color-border-primary)"
            >
              {sidebar}
            </aside>
          )}
        </div>

        {/* Footer */}
        {footer && <div className="shrink-0">{footer}</div>}
      </div>
    );
  }
);

PageLayout.displayName = "PageLayout";
