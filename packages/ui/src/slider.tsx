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
      <SliderPrimitive.Track className="relative w-full grow overflow-hidden h-(--space-slider-track-height) rounded-(--space-slider-track-radius) bg-(--color-slider-track)">
        <SliderPrimitive.Range className="absolute h-full bg-(--color-slider-range)" />
      </SliderPrimitive.Track>
      {values.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block ring-offset-(--color-background) transition-colors h-(--space-slider-thumb-size) w-(--space-slider-thumb-size) rounded-(--space-slider-thumb-radius) border-(length:--space-slider-thumb-border-width) border-(--color-slider-thumb-border) bg-(--color-slider-thumb) focus-visible:outline-none focus-visible:ring-(--space-slider-focus-ring-width) focus-visible:ring-offset-(--space-slider-focus-ring-offset) disabled:pointer-events-none disabled:opacity-(--state-opacity-disabled)"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
