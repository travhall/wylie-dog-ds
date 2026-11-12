import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Icon } from "./icon";
import { cn, focusRingClasses, focusRingInsetClasses } from "./lib/utils";

// A scroll-snap carousel. The slides sit in a horizontally scrolling track that snaps to each
// slide, so swiping, the arrow keys and the previous and next buttons all move by one slide, and no
// carousel library is needed. The buttons are disabled at either end.

type ScrollState = { prev: boolean; next: boolean };

type CarouselContextValue = {
  /** Null until the scroll area has been measured; the buttons stay enabled until then. */
  scrollState: ScrollState | null;
  setViewport: (element: HTMLDivElement | null) => void;
  update: () => void;
  scrollByPage: (direction: 1 | -1) => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

type CarouselProps = React.HTMLAttributes<HTMLDivElement>;

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, ...props }, ref) => {
    const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
    const [scrollState, setScrollState] = React.useState<ScrollState | null>(
      null
    );

    const update = React.useCallback(() => {
      if (!viewport) return;
      const max = viewport.scrollWidth - viewport.clientWidth;
      const next = {
        prev: viewport.scrollLeft > 1,
        next: viewport.scrollLeft < max - 1,
      };
      setScrollState((current) =>
        current && current.prev === next.prev && current.next === next.next
          ? current
          : next
      );
    }, [viewport]);

    React.useEffect(() => {
      if (!viewport) return;
      update();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(update);
      observer.observe(viewport);
      return () => observer.disconnect();
    }, [viewport, update]);

    const scrollByPage = React.useCallback(
      (direction: 1 | -1) => {
        if (!viewport) return;
        const slide = viewport.querySelector<HTMLElement>(
          "[data-carousel-item]"
        );
        const distance = slide?.offsetWidth || viewport.clientWidth;
        // scrollBy is missing in jsdom; every browser has it
        viewport.scrollBy?.({ left: direction * distance });
      },
      [viewport]
    );

    const value = React.useMemo(
      () => ({ scrollState, setViewport, update, scrollByPage }),
      [scrollState, update, scrollByPage]
    );

    return (
      <CarouselContext.Provider value={value}>
        <div
          ref={ref}
          role="group"
          aria-roledescription="carousel"
          className={cn("relative", className)}
          {...props}
        />
      </CarouselContext.Provider>
    );
  }
);
Carousel.displayName = "Carousel";

type CarouselContentProps = React.HTMLAttributes<HTMLDivElement>;

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, children, onScroll, onKeyDown, ...props }, ref) => {
    const context = React.useContext(CarouselContext);
    const setViewport = context?.setViewport;

    const setRefs = React.useCallback(
      (element: HTMLDivElement | null) => {
        setViewport?.(element);
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      },
      [ref, setViewport]
    );

    return (
      <div
        ref={setRefs}
        tabIndex={0}
        className={cn(
          "overflow-x-auto snap-x snap-mandatory scroll-smooth motion-reduce:scroll-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          focusRingInsetClasses,
          className
        )}
        onScroll={(event) => {
          onScroll?.(event);
          context?.update();
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || event.target !== event.currentTarget)
            return;
          if (event.key === "ArrowRight") {
            event.preventDefault();
            context?.scrollByPage(1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            context?.scrollByPage(-1);
          }
        }}
        {...props}
      >
        <div className="flex -ml-(--space-carousel-item-spacing)">
          {children}
        </div>
      </div>
    );
  }
);
CarouselContent.displayName = "CarouselContent";

type CarouselItemProps = React.HTMLAttributes<HTMLDivElement>;

const CarouselItem = React.forwardRef<HTMLDivElement, CarouselItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      data-carousel-item=""
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full snap-start -scroll-ml-(--space-carousel-item-spacing) pl-(--space-carousel-item-spacing)",
        className
      )}
      {...props}
    />
  )
);
CarouselItem.displayName = "CarouselItem";

const navButtonClasses =
  "absolute inline-flex items-center justify-center h-(--space-carousel-button-size) w-(--space-carousel-button-size) rounded-(--space-carousel-button-rounded-full) border-(length:--space-carousel-border-width) border-(--color-carousel-nav-border) bg-(--color-carousel-nav-background) top-1/2 -translate-y-1/2 not-disabled:hover:bg-(--color-carousel-nav-hover) text-(--color-carousel-nav-text) not-disabled:hover:text-(--color-carousel-nav-text-hover) disabled:cursor-not-allowed disabled:opacity-(--carousel-nav-opacity-disabled)";

type CarouselPreviousProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  CarouselPreviousProps
>(({ className, disabled, onClick, ...props }, ref) => {
  const context = React.useContext(CarouselContext);
  const atStart = context?.scrollState ? !context.scrollState.prev : false;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled ?? atStart}
      className={cn(
        navButtonClasses,
        "-left-(--space-carousel-button-offset)",
        focusRingClasses,
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context?.scrollByPage(-1);
      }}
      {...props}
    >
      <Icon
        icon={ChevronLeftIcon}
        size="sm"
        className="h-(--space-carousel-button-icon-size) w-(--space-carousel-button-icon-size)"
      />
      <span className="sr-only">Previous slide</span>
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

type CarouselNextProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CarouselNext = React.forwardRef<HTMLButtonElement, CarouselNextProps>(
  ({ className, disabled, onClick, ...props }, ref) => {
    const context = React.useContext(CarouselContext);
    const atEnd = context?.scrollState ? !context.scrollState.next : false;
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled ?? atEnd}
        className={cn(
          navButtonClasses,
          "-right-(--space-carousel-button-offset)",
          focusRingClasses,
          className
        )}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) context?.scrollByPage(1);
        }}
        {...props}
      >
        <Icon
          icon={ChevronRightIcon}
          size="sm"
          className="h-(--space-carousel-button-icon-size) w-(--space-carousel-button-icon-size)"
        />
        <span className="sr-only">Next slide</span>
      </button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
