import React from "react";
import { cn } from "./lib/utils";

export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  centered?: boolean;
  variant?: "default" | "compact" | "spacious" | "masonry" | "elevated";
  interactive?: boolean;
}

export const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  (
    {
      children,
      columns = { sm: 1, md: 2, lg: 3, xl: 4 },
      gap = "gap-6",
      centered = false,
      variant = "default",
      interactive = false,
      className,
      ...props
    },
    ref
  ) => {
    // Enhanced gap class logic with more variants
    const gapClass =
      variant === "compact"
        ? "gap-3"
        : variant === "spacious"
          ? "gap-8"
          : variant === "masonry"
            ? "gap-4"
            : variant === "elevated"
              ? "gap-6"
              : gap || "gap-6";

    // Build responsive column classes
    const columnClasses =
      variant !== "masonry"
        ? [
            columns.sm ? `sm:grid-cols-${columns.sm}` : false,
            columns.md ? `md:grid-cols-${columns.md}` : false,
            columns.lg ? `lg:grid-cols-${columns.lg}` : false,
            columns.xl ? `xl:grid-cols-${columns.xl}` : false,
          ].filter(Boolean)
        : [];

    const gridClasses = cn(
      // Base grid styles
      variant === "masonry"
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        : "grid",
      gapClass,

      // Responsive columns (skip for masonry)
      ...(columnClasses.filter(Boolean) as string[]),

      // Centering
      centered && "justify-items-center",

      // Variant-specific styles
      variant === "elevated" && "p-4",
      variant === "masonry" && "auto-rows-auto",

      // Interactive styles
      interactive &&
        "[&>*]:transition-all [&>*]:duration-300 [&>*]:hover:scale-105 [&>*]:hover:-translate-y-1",

      className
    );

    return (
      <div className={gridClasses} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

CardGrid.displayName = "CardGrid";
