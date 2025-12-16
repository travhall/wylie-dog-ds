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
 * Create a variant handler for consistent component API
 */
export function createVariants<T extends Record<string, string>>(variants: T) {
  return variants;
}

/**
 * Merge component props with defaults
 */
export function mergeProps<T extends Record<string, any>>(
  defaultProps: Partial<T>,
  props: T
): T {
  return { ...defaultProps, ...props };
}
