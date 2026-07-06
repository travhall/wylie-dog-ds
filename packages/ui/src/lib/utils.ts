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
