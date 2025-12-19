import React from "react";
import { cn } from "../lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../card";
import { Badge } from "../badge";

export interface Feature {
  icon?: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}

export interface SectionFeaturesProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "cards" | "grid";
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
    {
      className,
      variant = "default",
      title,
      description,
      features,
      columns = 3,
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-background",
      cards: "bg-muted/50",
      grid: "bg-background",
    };

    const gridCols = {
      2: "md:grid-cols-2",
      3: "md:grid-cols-2 lg:grid-cols-3",
      4: "md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <section
        className={cn(
          "relative w-full py-20 md:py-32",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          {(title || description) && (
            <div className="text-center max-w-3xl mx-auto mb-16">
              {title && (
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-lg text-muted-foreground">{description}</p>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div className={cn("grid gap-8", gridCols[columns])}>
            {features.map((feature, index) => {
              if (variant === "cards") {
                return (
                  <Card key={index} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        {feature.icon && (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                            {feature.icon}
                          </div>
                        )}
                        {feature.badge && (
                          <Badge variant="secondary">{feature.badge}</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <div key={index} className="relative">
                  <div className="flex flex-col gap-4">
                    {/* Icon and Badge Row */}
                    <div className="flex items-start justify-between">
                      {feature.icon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {feature.icon}
                        </div>
                      )}
                      {feature.badge && (
                        <Badge variant="secondary">{feature.badge}</Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold">{feature.title}</h3>

                    {/* Description */}
                    <p className="text-muted-foreground">
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
