import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import { Badge } from "../badge";

export const sectionFeaturesVariants = cva(
  "relative w-full py-(--space-section-features-padding-y-sm) md:py-(--space-section-features-padding-y-md)",
  {
    variants: {
      variant: {
        default: "bg-(--color-section-features-background)",
        cards: "bg-(--color-section-features-background-muted)",
        grid: "bg-(--color-section-features-background)",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface Feature {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

export interface SectionFeaturesProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionFeaturesVariants> {
  title?: string;
  description?: string;
  features: Feature[];
  columns?: 2 | 3 | 4;
}

export const SectionFeatures = React.forwardRef<
  HTMLElement,
  SectionFeaturesProps
>(
  (
    { className, variant, title, description, features, columns = 3, ...props },
    ref
  ) => {
    const headingId = React.useId();
    const gridCols = {
      2: "md:grid-cols-2",
      3: "md:grid-cols-2 lg:grid-cols-3",
      4: "md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <section
        className={cn(sectionFeaturesVariants({ variant }), className)}
        ref={ref}
        // aria-labelledby ties the section to its heading, making it a proper ARIA landmark
        aria-labelledby={title ? headingId : undefined}
        {...props}
      >
        <div className="container mx-auto px-(--space-section-features-container-padding-x-sm) sm:px-(--space-section-features-container-padding-x-md) lg:px-(--space-section-features-container-padding-x-lg)">
          {/* Section Header */}
          {(title || description) && (
            <div className="text-center max-w-(--space-section-features-header-max-width) mx-auto mb-(--space-section-features-header-margin-bottom)">
              {title && (
                <h2
                  id={headingId}
                  className="text-(length:--font-size-section-features-title-font-size-sm) md:text-(length:--font-size-section-features-title-font-size-md) lg:text-(length:--font-size-section-features-title-font-size-lg) font-(--font-weight-section-features-title-font-weight) tracking-(--space-section-features-title-tracking) mb-(--space-section-features-title-margin-bottom)"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-(length:--font-size-section-features-description-font-size) text-(--color-section-features-description-text)">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div
            className={cn(
              "grid gap-(--space-section-features-grid-gap)",
              gridCols[columns]
            )}
          >
            {features.map((feature, index) => {
              if (variant === "cards") {
                return (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-(--space-section-features-card-row-margin-bottom)">
                        {feature.icon && (
                          <div
                            aria-hidden="true"
                            className="flex h-(--space-section-features-icon-size) w-(--space-section-features-icon-size) items-center justify-center rounded-(--space-section-features-icon-radius) bg-(--color-section-features-icon-background)/10 text-(--color-section-features-icon-text) mb-(--space-section-features-card-icon-margin-bottom)"
                          >
                            {feature.icon}
                          </div>
                        )}
                        {feature.badge && (
                          <Badge variant="secondary">{feature.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-(length:--font-size-section-features-item-title-font-size)">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-(--color-section-features-item-text)">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div key={index} className="relative">
                  <div className="flex flex-col gap-(--space-section-features-item-gap)">
                    {/* Icon and Badge Row */}
                    <div className="flex items-start justify-between">
                      {feature.icon && (
                        <div
                          aria-hidden="true"
                          className="flex h-(--space-section-features-icon-size) w-(--space-section-features-icon-size) items-center justify-center rounded-(--space-section-features-icon-radius) bg-(--color-section-features-icon-background)/10 text-(--color-section-features-icon-text)"
                        >
                          {feature.icon}
                        </div>
                      )}
                      {feature.badge && (
                        <Badge variant="secondary">{feature.badge}</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-(length:--font-size-section-features-item-title-font-size) font-(--font-weight-section-features-item-title-font-weight)">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-(--color-section-features-item-text)">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);

SectionFeatures.displayName = "SectionFeatures";
