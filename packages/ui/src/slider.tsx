import React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "./lib/utils";

export interface SliderProps extends React.ComponentPropsWithoutRef<
  typeof SliderPrimitive.Root
> {
  /** Accessible name(s) for the thumb(s). Defaults to "Value" (or "Value N"
   * for multi-thumb range sliders) when not provided. */
  thumbLabels?: string | string[];
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, thumbLabels, ...props }, ref) => {
  const { defaultValue = [0], value } = props;
  const values = value || defaultValue;

  const getThumbLabel = (i: number) => {
    if (Array.isArray(thumbLabels)) return thumbLabels[i] ?? `Value ${i + 1}`;
    if (thumbLabels)
      return values.length > 1 ? `${thumbLabels} ${i + 1}` : thumbLabels;
    return values.length > 1 ? `Value ${i + 1}` : "Value";
  };

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
          aria-label={getThumbLabel(i)}
          className="block ring-offset-(--color-slider-thumb-ring-offset) transition-colors h-(--space-slider-thumb-size) w-(--space-slider-thumb-size) rounded-(--space-slider-thumb-radius) border-(length:--space-slider-thumb-border-width) border-(--color-slider-thumb-border) bg-(--color-slider-thumb) focus-visible:outline-none focus-visible:ring-(length:--space-slider-focus-ring-width) focus-visible:ring-offset-(--space-slider-focus-ring-offset) disabled:pointer-events-none disabled:opacity-(--slider-thumb-disabled-opacity)"
        />
      ))}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
