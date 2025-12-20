import React from "react";
import { cn } from "../lib/utils";

export interface PageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "full-width" | "centered";
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarPosition?: "left" | "right";
}

export const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      className,
      variant = "default",
      header,
      footer,
      sidebar,
      sidebarPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "container mx-auto px-4 sm:px-6 lg:px-8",
      "full-width": "w-full",
      centered: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl",
    };

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
          <main className={cn("flex-1 py-8", variants[variant])}>
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
