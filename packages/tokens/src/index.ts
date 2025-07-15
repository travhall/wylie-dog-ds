// Enhanced token exports with proper TypeScript support
export interface DesignToken {
  value: string | number | string[];
  type?: string;
  comment?: string;
}

export interface TokenCollection {
  [key: string]: DesignToken | TokenCollection;
}

// Token type constants
export const tokenTypes = {
  color: 'color',
  spacing: 'spacing',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  fontFamily: 'fontFamily',
  lineHeight: 'lineHeight',
  borderRadius: 'borderRadius',
  boxShadow: 'boxShadow',
  duration: 'duration',
  cubicBezier: 'cubicBezier'
} as const;

// Export flattened tokens for easy consumption
export interface FlatTokens {
  [key: string]: string | number;
}

// Color structure for stories and components
export interface ColorScale {
  [shade: string]: string;
}

export interface ColorSystem {
  [colorName: string]: ColorScale;
}

// Re-export generated tokens
export * from './tokens.generated';

// Utility functions for token consumption
export function getColorValue(colorPath: string): string {
  // This will be populated by the build process
  return `var(--color-${colorPath.replace(/\./g, '-')})`;
}

export function getTokenValue(tokenPath: string): string {
  return `var(--${tokenPath.replace(/\./g, '-')})`;
}