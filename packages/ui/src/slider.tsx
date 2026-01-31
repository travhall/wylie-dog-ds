import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./lib/utils";

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { defaultValue = [0], value } = props;
  const values = value || defaultValue;

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative w-full grow overflow-hidden h-(--spacing-slider-track-height) rounded-(--spacing-slider-track-radius) bg-(--color-slider-track)">
        <SliderPrimitive.Range className="absolute h-full bg-(--color-slider-range)" />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block ring-offset-(--color-background) transition-colors h-(--spacing-slider-thumb-size) w-(--spacing-slider-thumb-size) rounded-(--spacing-slider-thumb-radius) border-(length:--spacing-slider-thumb-border-width) border-(--color-slider-thumb-border) bg-(--color-slider-thumb) focus-visible:outline-none focus-visible:ring-(--spacing-slider-focus-ring-width) focus-visible:ring-offset-(--spacing-slider-focus-ring-offset) disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
