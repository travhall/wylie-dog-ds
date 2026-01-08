/**
 * Test Fixtures - Sample Token Data
 *
 * Provides sample token data in various formats for testing.
 * Includes edge cases, large datasets, and common patterns.
 */

/**
 * W3C DTCG Format Tokens
 */
export const w3cDtcgTokens = {
  color: {
    primary: {
      $type: "color",
      $value: "#3b82f6",
      $description: "Primary brand color",
    },
    secondary: {
      $type: "color",
      $value: "#8b5cf6",
    },
    gray: {
      50: { $type: "color", $value: "#f9fafb" },
      100: { $type: "color", $value: "#f3f4f6" },
      500: { $type: "color", $value: "#6b7280" },
      900: { $type: "color", $value: "#111827" },
    },
  },
  spacing: {
    xs: { $type: "dimension", $value: "4px" },
    sm: { $type: "dimension", $value: "8px" },
    md: { $type: "dimension", $value: "16px" },
    lg: { $type: "dimension", $value: "24px" },
    xl: { $type: "dimension", $value: "32px" },
  },
  fontSize: {
    sm: { $type: "dimension", $value: "12px" },
    base: { $type: "dimension", $value: "16px" },
    lg: { $type: "dimension", $value: "20px" },
    xl: { $type: "dimension", $value: "24px" },
  },
};

/**
 * Tokens Studio Format
 */
export const tokensStudioTokens = {
  Core: {
    "color.primary.500": {
      value: "#3b82f6",
      type: "color",
      description: "Primary brand color",
    },
    "color.secondary.500": {
      value: "#8b5cf6",
      type: "color",
    },
    "spacing.base": {
      value: "16px",
      type: "spacing",
    },
  },
  Semantic: {
    "color.accent": {
      value: "{Core.color.primary.500}",
      type: "color",
      description: "Accent color references primary",
    },
    "color.background": {
      value: "#ffffff",
      type: "color",
    },
  },
};

/**
 * Style Dictionary Nested Format
 */
export const styleDictionaryNestedTokens = {
  color: {
    primary: {
      value: "#3b82f6",
      comment: "Primary brand color",
    },
    secondary: {
      value: "#8b5cf6",
    },
    gray: {
      50: { value: "#f9fafb" },
      100: { value: "#f3f4f6" },
      500: { value: "#6b7280" },
      900: { value: "#111827" },
    },
  },
  spacing: {
    xs: { value: "4px" },
    sm: { value: "8px" },
    md: { value: "16px" },
    lg: { value: "24px" },
  },
};

/**
 * Style Dictionary Flat Format
 */
export const styleDictionaryFlatTokens = {
  "color-primary": {
    value: "#3b82f6",
    comment: "Primary brand color",
  },
  "color-secondary": {
    value: "#8b5cf6",
  },
  "color-gray-50": { value: "#f9fafb" },
  "color-gray-100": { value: "#f3f4f6" },
  "color-gray-500": { value: "#6b7280" },
  "spacing-xs": { value: "4px" },
  "spacing-sm": { value: "8px" },
  "spacing-md": { value: "16px" },
};

/**
 * Material Design Tokens
 */
export const materialDesignTokens = {
  sys: {
    color: {
      primary: "#3b82f6",
      secondary: "#8b5cf6",
      surface: "#ffffff",
      background: "#fafafa",
      error: "#ef4444",
    },
    elevation: {
      level0: "0px",
      level1: "1px",
      level2: "3px",
      level3: "6px",
    },
  },
  ref: {
    palette: {
      primary: {
        0: "#000000",
        10: "#001f3d",
        50: "#3b82f6",
        100: "#dbeafe",
      },
    },
  },
};

/**
 * Tokens with circular references (edge case)
 */
export const tokensWithCircularReferences = {
  color: {
    a: {
      $type: "color",
      $value: "{color.b}",
    },
    b: {
      $type: "color",
      $value: "{color.c}",
    },
    c: {
      $type: "color",
      $value: "{color.a}", // Circular!
    },
  },
};

/**
 * Tokens with invalid types (edge case)
 */
export const tokensWithInvalidTypes = {
  color: {
    primary: {
      $type: "color",
      $value: "not-a-color", // Invalid color value
    },
  },
  spacing: {
    md: {
      $type: "dimension",
      $value: "invalid-dimension", // Invalid dimension
    },
  },
};

/**
 * Generate large token dataset for performance testing
 */
export function generateLargeTokenDataset(count: number = 1000) {
  const tokens: any = {
    color: {},
    spacing: {},
    fontSize: {},
  };

  // Generate color tokens
  for (let i = 0; i < count / 3; i++) {
    tokens.color[`color-${i}`] = {
      $type: "color",
      $value: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,
      $description: `Generated color ${i}`,
    };
  }

  // Generate spacing tokens
  for (let i = 0; i < count / 3; i++) {
    tokens.spacing[`spacing-${i}`] = {
      $type: "dimension",
      $value: `${(i + 1) * 4}px`,
    };
  }

  // Generate fontSize tokens
  for (let i = 0; i < count / 3; i++) {
    tokens.fontSize[`fontSize-${i}`] = {
      $type: "dimension",
      $value: `${12 + i}px`,
    };
  }

  return tokens;
}

/**
 * Normalized token format (internal representation)
 */
export interface NormalizedToken {
  name: string;
  type: "color" | "dimension" | "string" | "number" | "boolean";
  value: any;
  description?: string;
  collection?: string;
  path: string[];
}

/**
 * Sample normalized tokens
 */
export const normalizedTokens: NormalizedToken[] = [
  {
    name: "color.primary",
    type: "color",
    value: "#3b82f6",
    description: "Primary brand color",
    path: ["color", "primary"],
  },
  {
    name: "color.secondary",
    type: "color",
    value: "#8b5cf6",
    path: ["color", "secondary"],
  },
  {
    name: "spacing.md",
    type: "dimension",
    value: "16px",
    path: ["spacing", "md"],
  },
  {
    name: "fontSize.base",
    type: "dimension",
    value: "16px",
    path: ["fontSize", "base"],
  },
];

/**
 * Conflict scenarios for testing
 */
export const conflictScenarios = {
  // Local and remote have different values
  valueConflict: {
    local: {
      name: "color.primary",
      type: "color" as const,
      value: "#3b82f6",
      path: ["color", "primary"],
    },
    remote: {
      name: "color.primary",
      type: "color" as const,
      value: "#2563eb",
      path: ["color", "primary"],
    },
  },

  // Local has token, remote deleted it
  deletedRemote: {
    local: {
      name: "color.accent",
      type: "color" as const,
      value: "#8b5cf6",
      path: ["color", "accent"],
    },
    remote: null,
  },

  // Remote has token, local deleted it
  deletedLocal: {
    local: null,
    remote: {
      name: "color.accent",
      type: "color" as const,
      value: "#8b5cf6",
      path: ["color", "accent"],
    },
  },

  // Type changed
  typeConflict: {
    local: {
      name: "spacing.md",
      type: "dimension" as const,
      value: "16px",
      path: ["spacing", "md"],
    },
    remote: {
      name: "spacing.md",
      type: "number" as const,
      value: 16,
      path: ["spacing", "md"],
    },
  },
};
