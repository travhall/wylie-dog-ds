import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "./lib/utils";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props} />
  )
);
Carousel.displayName = "Carousel";

interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
      <div
        className="flex gap-(--spacing-carousel-gap) -ml-(--spacing-carousel-item-spacing)"
        {...props}
      />
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
        "min-w-0 shrink-0 grow-0 basis-full pl-(--spacing-carousel-item-spacing)",
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
      "absolute h-(--spacing-carousel-button-size) w-(--spacing-carousel-button-size) rounded-(--spacing-carousel-button-rounded-full) border border-(--color-carousel-nav-border) bg-(--color-carousel-nav-background) -left-(--spacing-carousel-button-offset) top-1/2 -translate-y-1/2",
      "hover:bg-(--color-carousel-nav-hover) hover:text-(--color-carousel-nav-text-hover)",
      "focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    <ChevronLeftIcon className="h-(--spacing-carousel-button-icon-size) w-(--spacing-carousel-button-icon-size)" />
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
        "absolute h-(--spacing-carousel-button-size) w-(--spacing-carousel-button-size) rounded-(--spacing-carousel-button-rounded-full) border border-(--color-carousel-nav-border) bg-(--color-carousel-nav-background) -right-(--spacing-carousel-button-offset) top-1/2 -translate-y-1/2",
        "hover:bg-(--color-carousel-nav-hover) hover:text-(--color-carousel-nav-text-hover)",
        "focus:outline-none focus:ring-2 focus:ring-(--color-border-focus) focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="h-(--spacing-carousel-button-icon-size) w-(--spacing-carousel-button-icon-size)" />
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
