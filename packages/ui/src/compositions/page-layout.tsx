import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

export const pageLayoutMainVariants = cva(
  "flex-1 py-(--space-page-layout-main-padding-y)",
  {
    variants: {
      variant: {
        default:
          "container mx-auto px-(--space-page-layout-main-padding-x-sm) sm:px-(--space-page-layout-main-padding-x-md) lg:px-(--space-page-layout-main-padding-x-lg)",
        "full-width": "w-full",
        centered:
          "container mx-auto px-(--space-page-layout-main-padding-x-sm) sm:px-(--space-page-layout-main-padding-x-md) lg:px-(--space-page-layout-main-padding-x-lg) max-w-(--space-page-layout-main-max-width-centered)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

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
          className="sr-only focus:not-sr-only focus:absolute focus:top-(--space-page-layout-skip-link-offset) focus:left-(--space-page-layout-skip-link-offset) focus:z-(--page-layout-skip-link-z-index) focus:rounded-(--space-page-layout-skip-link-radius) focus:bg-(--color-page-layout-skip-link-background) focus:px-(--space-page-layout-skip-link-padding-x) focus:py-(--space-page-layout-skip-link-padding-y) focus:text-(--color-page-layout-skip-link-text) focus:outline-solid focus:outline-(length:--space-focus-width) focus:outline-(color:--color-focus-ring) focus:outline-offset-(length:--space-focus-offset) focus:shadow-[0_0_0_calc(var(--space-focus-offset)+var(--space-focus-width)+var(--space-focus-halo-width))_var(--color-focus-halo)] focus:transition-none"
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
              className="hidden lg:block w-(--space-page-layout-sidebar-width) shrink-0 border-r border-(--color-page-layout-sidebar-border)"
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
              className="hidden lg:block w-(--space-page-layout-sidebar-width) shrink-0 border-l border-(--color-page-layout-sidebar-border)"
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
