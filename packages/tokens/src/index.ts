// Type definitions
export interface DesignToken {
  value: string | number | string[];
  type?: string;
  comment?: string;
}

export interface TokenCollection {
  [key: string]: DesignToken | TokenCollection;
}

// Export types for better TypeScript experience
export const tokenTypes = {
  color: 'color',
  spacing: 'spacing',
  fontSize: 'fontSize',
  fontWeight: 'fontWeight',
  fontFamily: 'fontFamily',
  lineHeight: 'lineHeight',
  borderRadius: 'borderRadius'
} as const;

// Re-export will be available after build
export * from './tokens.generated';