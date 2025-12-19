import React from "react";
import { cn } from "../lib/utils";
import { Button } from "../button";
import { Badge } from "../badge";

export interface SectionHeroProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "gradient" | "centered";
  badge?: string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  image?: React.ReactNode;
  imagePosition?: "left" | "right";
}

export const SectionHero = React.forwardRef<HTMLElement, SectionHeroProps>(
  (
    {
      className,
      variant = "default",
      badge,
      title,
      description,
      primaryAction,
      secondaryAction,
      image,
      imagePosition = "right",
      ...props
    },
    ref
  ) => {
    const variants = {
      default: "bg-background",
      gradient:
        "bg-gradient-to-br from-primary/10 via-background to-secondary/10",
      centered: "bg-background text-center",
    };

    const isCentered = variant === "centered";
    const hasImage = !!image;

    return (
      <section
        className={cn(
          "relative w-full py-20 md:py-32 overflow-hidden",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex flex-col gap-8",
              hasImage && !isCentered && "md:grid md:grid-cols-2 md:gap-12",
              hasImage && !isCentered && "items-center",
              isCentered && "items-center max-w-4xl mx-auto"
            )}
          >
            {/* Content Column */}
            <div
              className={cn(
                "flex flex-col gap-6",
                imagePosition === "right" && "md:order-1",
                imagePosition === "left" && "md:order-2",
                isCentered && "items-center"
              )}
            >
              {/* Badge */}
              {badge && (
                <div>
                  <Badge variant="outline">{badge}</Badge>
                </div>
              )}

              {/* Title */}
              <h1
                className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight",
                  isCentered && "text-center"
                )}
              >
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p
                  className={cn(
                    "text-lg md:text-xl text-muted-foreground max-w-2xl",
                    isCentered && "text-center"
                  )}
                >
                  {description}
                </p>
              )}

              {/* Actions */}
              {(primaryAction || secondaryAction) && (
                <div
                  className={cn(
                    "flex flex-col sm:flex-row gap-4",
                    isCentered && "justify-center"
                  )}
                >
                  {primaryAction &&
                    (primaryAction.href ? (
                      <a href={primaryAction.href}>
                        <Button size="lg" variant="primary">
                          {primaryAction.label}
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="lg"
                        variant="primary"
                        onClick={primaryAction.onClick}
                      >
                        {primaryAction.label}
                      </Button>
                    ))}
                  {secondaryAction &&
                    (secondaryAction.href ? (
                      <a href={secondaryAction.href}>
                        <Button size="lg" variant="outline">
                          {secondaryAction.label}
                        </Button>
                      </a>
                    ) : (
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={secondaryAction.onClick}
                      >
                        {secondaryAction.label}
                      </Button>
                    ))}
                </div>
              )}
            </div>

            {/* Image Column */}
            {hasImage && !isCentered && (
              <div
                className={cn(
                  "relative",
                  imagePosition === "right" && "md:order-2",
                  imagePosition === "left" && "md:order-1"
                )}
              >
                {image}
              </div>
            )}

            {/* Centered Image Below Content */}
            {hasImage && isCentered && (
              <div className="relative w-full max-w-3xl mt-8">{image}</div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

SectionHero.displayName = "SectionHero";
