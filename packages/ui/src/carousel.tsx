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
      <div className="flex -ml-4" {...props} />
    </div>
  )
);
CarouselContent.displayName = "CarouselContent";

interface CarouselItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full pl-4", className)}
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
      "absolute h-8 w-8 rounded-full border border-[var(--color-carousel-nav-border)] bg-[var(--color-carousel-nav-background)] left-4 top-1/2 -translate-y-1/2",
      "hover:bg-[var(--color-carousel-nav-hover)] hover:text-[var(--color-carousel-nav-text-hover)]",
      "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    <ChevronLeftIcon className="h-4 w-4" />
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
        "absolute h-8 w-8 rounded-full border border-[var(--color-carousel-nav-border)] bg-[var(--color-carousel-nav-background)] right-4 top-1/2 -translate-y-1/2",
        "hover:bg-[var(--color-carousel-nav-hover)] hover:text-[var(--color-carousel-nav-text-hover)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)] focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <ChevronRightIcon className="h-4 w-4" />
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
