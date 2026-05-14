import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Button, buttonVariants } from "../button";
import { Badge } from "../badge";

export const sectionHeroVariants = cva(
  "relative w-full py-20 md:py-32 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-(--color-background-primary)",
        gradient:
          "bg-gradient-to-br from-(--color-interactive-primary)/10 via-(--color-background-primary) to-(--color-accent-surface)/10",
        centered: "bg-(--color-background-primary) text-center",
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

              {/* Title — id ties this heading to the section landmark via aria-labelledby */}
              <h1
                id={headingId}
                className={cn(
                  "text-(length:--font-size-display-sm) md:text-(length:--font-size-display-md) lg:text-(length:--font-size-display-lg) font-(--font-weight-bold) tracking-(--space-typography-tracking-tight)",
                  isCentered && "text-center"
                )}
              >
                {title}
              </h1>

              {/* Description */}
              {description && (
                <p
                  className={cn(
                    "text-(length:--font-size-lg) md:text-(length:--font-size-xl) text-(--color-text-secondary) max-w-2xl",
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
              <div className="relative w-full max-w-3xl mt-8">{image}</div>
            )}
          </div>
        </div>
      </section>
    );
  }
);

SectionHero.displayName = "SectionHero";
