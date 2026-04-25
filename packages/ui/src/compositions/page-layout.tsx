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
        {/* Header */}
        {header && <div className="shrink-0">{header}</div>}

        {/* Main Content Area */}
        <div className="flex-1 flex">
          {/* Left Sidebar */}
          {sidebar && sidebarPosition === "left" && (
            <aside className="hidden lg:block w-64 shrink-0 border-r border-border">
              {sidebar}
            </aside>
          )}

          {/* Main Content */}
          <main className={pageLayoutMainVariants({ variant })}>
            {children}
          </main>

          {/* Right Sidebar */}
          {sidebar && sidebarPosition === "right" && (
            <aside className="hidden lg:block w-64 shrink-0 border-l border-border">
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
