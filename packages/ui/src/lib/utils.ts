/**
 * Utility functions for the Wylie Dog Design System
 */

/**
 * Combine class names, filtering out falsy values
 * This is our version of clsx/cn utility
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Shared focus-ring classes for interactive elements. Two variants exist
 * because form controls (input/select/textarea) use a distinct border-focus
 * color token from every other interactive component.
 */
export const focusRingClasses =
  "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-border-focus) focus:ring-offset-(--space-focus-ring-offset)";

export const focusRingInputClasses =
  "focus:outline-none focus:ring-(length:--space-focus-ring-width) focus:ring-(--color-input-border-focus) focus:ring-offset-(--space-focus-ring-offset)";
