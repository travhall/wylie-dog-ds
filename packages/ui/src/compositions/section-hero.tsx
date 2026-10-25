import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Button, buttonVariants } from "../button";
import { Badge } from "../badge";

export const sectionHeroVariants = cva(
  "relative w-full py-(--space-section-hero-padding-y-sm) md:py-(--space-section-hero-padding-y-md) overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-(--color-section-hero-background)",
        gradient:
          "bg-gradient-to-br from-(--color-section-hero-gradient-from)/10 via-(--color-section-hero-gradient-via) to-(--color-section-hero-gradient-to)/10",
        centered: "bg-(--color-section-hero-background) text-center",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SectionHeroProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionHeroVariants> {
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
      variant,
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
    const headingId = React.useId();
    const isCentered = variant === "centered";
    const hasImage = !!image;

    return (
      <section
        className={cn(sectionHeroVariants({ variant }), className)}
        ref={ref}
        aria-labelledby={headingId}
        {...props}
      >
        <div className="container mx-auto px-(--space-section-hero-container-padding-x-sm) sm:px-(--space-section-hero-container-padding-x-md) lg:px-(--space-section-hero-container-padding-x-lg)">
          <div
            className={cn(
              "flex flex-col gap-(--space-section-hero-layout-gap-sm)",
              hasImage &&
                !isCentered &&
                "md:grid md:grid-cols-2 md:gap-(--space-section-hero-layout-gap-md)",
              hasImage && !isCentered && "items-center",
              isCentered &&
                "items-center max-w-(--space-section-hero-layout-max-width-centered) mx-auto"
            )}
          >
            {/* Content Column */}
            <div
              className={cn(
                "flex flex-col gap-(--space-section-hero-content-gap)",
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

              {/* Title — id ties this heading to the section landmark via aria-labelledby */}
              <h1
                id={headingId}
                className={cn(
                  "text-(length:--font-size-section-hero-title-font-size-sm) md:text-(length:--font-size-section-hero-title-font-size-md) lg:text-(length:--font-size-section-hero-title-font-size-lg) font-(--font-weight-section-hero-title-font-weight) tracking-(--space-section-hero-title-tracking)",
                  isCentered && "text-center"
                )}
              >
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p
                  className={cn(
                    "text-(length:--font-size-section-hero-description-font-size-sm) md:text-(length:--font-size-section-hero-description-font-size-md) text-(--color-section-hero-description-text) max-w-(--space-section-hero-description-max-width)",
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
                    "flex flex-col sm:flex-row gap-(--space-section-hero-actions-gap)",
                    isCentered && "justify-center"
                  )}
                >
                  {primaryAction &&
                    (primaryAction.href ? (
                      // Use buttonVariants on <a> directly — Button always renders <button>,
                      // so wrapping it in <a> would create invalid nested interactive elements
                      <a
                        href={primaryAction.href}
                        className={cn(
                          buttonVariants({ size: "lg", variant: "default" })
                        )}
                      >
                        {primaryAction.label}
                      </a>
                    ) : (
                      <Button
                        size="lg"
                        variant="default"
                        onClick={primaryAction.onClick}
                      >
                        {primaryAction.label}
                      </Button>
                    ))}
                  {secondaryAction &&
                    (secondaryAction.href ? (
                      <a
                        href={secondaryAction.href}
                        className={cn(
                          buttonVariants({ size: "lg", variant: "outline" })
                        )}
                      >
                        {secondaryAction.label}
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
              <div className="relative w-full max-w-(--space-section-hero-image-max-width) mt-(--space-section-hero-image-margin-top)">
                {image}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

SectionHero.displayName = "SectionHero";
