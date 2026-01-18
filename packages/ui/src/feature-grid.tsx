import React from "react";
import { cn } from "./lib/utils";
import { Badge } from "./badge";

export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeVariant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "destructive"
    | "outline";
}

export interface FeatureGridProps extends React.HTMLAttributes<HTMLDivElement> {
  features?: FeatureItem[];
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: string;
  centered?: boolean;
  variant?: "default" | "compact" | "spacious";
}

export const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  (
    {
      features = [],
      columns = { sm: 1, md: 2, lg: 3, xl: 4 },
      gap = "gap-(--spacing-feature-grid-container-gap)",
      centered = false,
      variant = "default",
      className,
      ...props
    },
    ref
  ) => {
    // Simple gap class logic to avoid TypeScript issues
    const gapClass =
      variant === "compact"
        ? "gap-(--spacing-feature-grid-item-gap)"
        : variant === "spacious"
          ? "gap-(--spacing-feature-grid-container-gap)"
          : gap || "gap-(--spacing-feature-grid-container-gap)";

    const gridClasses = cn(
      // Base grid
      "grid",
      gapClass,
      // Responsive columns
      columns.sm ? `sm:grid-cols-${columns.sm}` : false,
      columns.md ? `md:grid-cols-${columns.md}` : false,
      columns.lg ? `lg:grid-cols-${columns.lg}` : false,
      columns.xl ? `xl:grid-cols-${columns.xl}` : false,
      // Centering
      centered && "justify-items-center",
      className
    );

    return (
      <div className={gridClasses} ref={ref} role="region" {...props}>
        {features.map((feature, index) => (
          <div key={index} className="group relative">
            <div className="glass border border-(--color-border-primary)/10 rounded-(--spacing-feature-grid-item-radius) p-(--spacing-feature-grid-item-padding) transition-all duration-500 hover:border-(--color-interactive-primary)/20 hover:scale-105">
              {/* Icon */}
              <div className="mb-(--spacing-feature-grid-item-gap) flex items-center justify-center w-12 h-12 rounded-(--spacing-feature-grid-icon-radius) glass border-(--color-border-primary)/5 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="space-y-(--spacing-feature-grid-item-gap)">
                {/* Badge */}
                {feature.badge && (
                  <Badge variant={feature.badgeVariant || "default"}>
                    {feature.badge}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="text-(length:--font-size-feature-grid-title-font-size) font-bold text-(--color-text-primary) leading-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-(--color-text-secondary) leading-relaxed text-(length:--font-size-feature-grid-description-font-size)">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

FeatureGrid.displayName = "FeatureGrid";
