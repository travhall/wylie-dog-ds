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
      gap = "gap-(--space-feature-grid-container-gap)",
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
        ? "gap-(--space-feature-grid-item-gap)"
        : variant === "spacious"
          ? "gap-(--space-feature-grid-container-gap)"
          : gap || "gap-(--space-feature-grid-container-gap)";

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
            <div className="glass border border-(--color-feature-grid-item-border-color)/10 rounded-(--space-feature-grid-item-radius) p-(--space-feature-grid-item-padding) transition-all duration-(--duration-500) hover:border-(--color-feature-grid-item-border-color-hover)/20 hover:scale-105">
              {/* Icon */}
              <div className="mb-(--space-feature-grid-item-gap) flex items-center justify-center w-(--space-feature-grid-icon-container-size) h-(--space-feature-grid-icon-container-size) rounded-(--space-feature-grid-icon-radius) glass border-(--color-feature-grid-item-border-color)/5 shadow-(--shadow-sm) group-hover:scale-110 group-hover:rotate-3 transition-transform duration-(--duration-500)">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="space-y-(--space-feature-grid-item-gap)">
                {/* Badge */}
                {feature.badge && (
                  <Badge variant={feature.badgeVariant || "default"}>
                    {feature.badge}
                  </Badge>
                )}

                {/* Title */}
                <h3 className="text-(length:--font-size-feature-grid-title-font-size) font-(--font-weight-feature-grid-title-font-weight) text-(--color-feature-grid-title-text) leading-(--line-height-tight)">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-(--color-feature-grid-description-text) leading-(--line-height-relaxed) text-(length:--font-size-feature-grid-description-font-size)">
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
