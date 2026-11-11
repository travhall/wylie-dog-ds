// Native motion variables (Plan 137).
//
// A `duration` token is a string in the repo ("150ms") and a TIMING variable in Figma,
// a number of SECONDS (0.15). A `cubicBezier` token is "cubic-bezier(0, 0, 0.2, 1)" in
// the repo and an EASING variable in Figma, an object with the four control points.
// Both were verified against a live Figma file on 2026-11-05 (Plan 137). Figma stores
// numbers as float32, so 0.15 reads back as 0.15000000596 and is rounded on the way out.

export interface FigmaEasing {
  type: string;
  easingFunctionCubicBezier?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  easingFunctionSpring?: unknown;
}

/** "150ms", "0.15s", 150 (ms) or { value } to seconds. Null when it is not a time. */
export function durationToSeconds(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value / 1000 : null;
  }
  if (typeof value !== "string") return null;
  const match = /^\s*(-?\d*\.?\d+)\s*(ms|s)?\s*$/.exec(value);
  if (!match) return null;
  const amount = parseFloat(match[1]);
  return match[2] === "s" ? amount : amount / 1000;
}

/** Seconds as the repo writes a duration: whole milliseconds, "150ms". */
export function secondsToDuration(seconds: number): string {
  // Float32 noise (150.00000596) goes away at three decimals of a millisecond
  const ms = Number((seconds * 1000).toFixed(3));
  return `${ms}ms`;
}

/** "cubic-bezier(0.4, 0, 0.2, 1)" to a Figma custom cubic bezier. Null when malformed. */
export function parseCubicBezier(value: unknown): FigmaEasing | null {
  if (typeof value !== "string") return null;
  const match =
    /^\s*cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)\s*$/.exec(
      value
    );
  if (!match) return null;
  const [x1, y1, x2, y2] = match.slice(1).map(parseFloat);
  if ([x1, y1, x2, y2].some((n) => !Number.isFinite(n))) return null;
  return {
    type: "CUSTOM_CUBIC_BEZIER",
    easingFunctionCubicBezier: { x1, y1, x2, y2 },
  };
}

/** A spring is a physical simulation, not a curve, so it has no cubic-bezier string. */
export function isSpringEasing(value: FigmaEasing | undefined): boolean {
  if (!value) return false;
  return (
    ["GENTLE", "QUICK", "BOUNCY", "SLOW", "CUSTOM_SPRING"].includes(
      value.type
    ) || value.easingFunctionSpring !== undefined
  );
}

/** A Figma easing as the repo writes it. Null for a spring or an easing with no curve. */
export function formatCubicBezier(
  value: FigmaEasing | undefined
): string | null {
  if (!value || isSpringEasing(value)) return null;
  const curve = value.easingFunctionCubicBezier;
  if (!curve) return null;
  // float32 again: 0.2 reads back as 0.20000000298
  const n = (v: number) => Number(v.toFixed(5));
  return `cubic-bezier(${n(curve.x1)}, ${n(curve.y1)}, ${n(curve.x2)}, ${n(curve.y2)})`;
}
