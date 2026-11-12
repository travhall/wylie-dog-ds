// icon.tsx
import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

// The one place icons get their size and stroke from tokens. The icon itself is any
// component that renders an SVG and takes className (lucide-react, a custom set, your own
// glyph), so adopters keep their icon library and the system keeps control of size and
// stroke weight: `icon.size.*` and `icon.stroke-width` change every icon at once.
//
// The stroke is non-scaling: `icon.stroke-width` is the width drawn on screen at every size, not
// a width in the glyph's 24 unit grid (which would draw 1.33px at 16px). That is what a Figma
// stroke bound to the same variable draws, so one token means one thing in design and code.
// `vector-effect` is not inherited, so it goes on every shape inside the svg.
export const iconVariants = cva(
  "stroke-(length:--space-icon-stroke-width) [&_*]:[vector-effect:non-scaling-stroke]",
  {
    variants: {
      size: {
        xs: "h-(--space-icon-size-xs) w-(--space-icon-size-xs)",
        sm: "h-(--space-icon-size-sm) w-(--space-icon-size-sm)",
        md: "h-(--space-icon-size-md) w-(--space-icon-size-md)",
        lg: "h-(--space-icon-size-lg) w-(--space-icon-size-lg)",
        xl: "h-(--space-icon-size-xl) w-(--space-icon-size-xl)",
      },
    },
  }
);

export interface IconProps
  extends
    Omit<React.SVGProps<SVGSVGElement>, "ref">,
    VariantProps<typeof iconVariants> {
  /** The glyph: a component that renders an SVG, such as a lucide-react icon. */
  icon: React.ElementType;
}

/**
 * Renders a glyph at a token size with the token stroke weight. Without `size` the glyph
 * keeps whatever size the caller gives it through `className`, which is how the system's
 * own components size theirs (each from its own component token).
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ icon: Glyph, size, className, ...props }, ref) => (
    <Glyph
      ref={ref}
      className={cn(iconVariants({ size }), className)}
      {...props}
    />
  )
);
Icon.displayName = "Icon";
