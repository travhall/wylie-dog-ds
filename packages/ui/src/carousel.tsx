import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, focusRingClasses } from "./lib/utils";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  )
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
      <div className="flex gap-(--space-carousel-gap) -ml-(--space-carousel-item-spacing)">
        {children}
      </div>
    </div>
  )
);
CarouselContent.displayName = "CarouselContent";

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full pl-(--space-carousel-item-spacing)",
        className
      )}
      {...props}
    />
  )
);
CarouselItem.displayName = "CarouselItem";

interface CarouselPreviousProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute h-(--space-carousel-button-size) w-(--space-carousel-button-size) rounded-(--space-carousel-button-rounded-full) border border-(--color-carousel-nav-border) bg-(--color-carousel-nav-background) -left-(--space-carousel-button-offset) top-1/2 -translate-y-1/2",
      "hover:bg-(--color-carousel-nav-hover) hover:text-(--color-carousel-nav-text-hover)",
      focusRingClasses,
      "disabled:pointer-events-none disabled:opacity-(--carousel-nav-button-disabled-opacity)",
      className
    )}
    {...props}
  >
    <ChevronLeftIcon className="h-(--space-carousel-button-icon-size) w-(--space-carousel-button-icon-size)" />
    <span className="sr-only">Previous slide</span>
  </button>
));
CarouselPrevious.displayName = "CarouselPrevious";

interface CarouselNextProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute h-(--space-carousel-button-size) w-(--space-carousel-button-size) rounded-(--space-carousel-button-rounded-full) border border-(--color-carousel-nav-border) bg-(--color-carousel-nav-background) -right-(--space-carousel-button-offset) top-1/2 -translate-y-1/2",
        "hover:bg-(--color-carousel-nav-hover) hover:text-(--color-carousel-nav-text-hover)",
        focusRingClasses,
        "disabled:pointer-events-none disabled:opacity-(--carousel-nav-button-disabled-opacity)",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="h-(--space-carousel-button-icon-size) w-(--space-carousel-button-icon-size)" />
      <span className="sr-only">Next slide</span>
    </button>
  )
);
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
