// Reference Format Normalization - Converts different reference formats to standard {token.name}
import type { ReferenceTransformation } from "./format-adapter";

export class ReferenceNormalizer {
  static readonly REFERENCE_PATTERNS = [
    // Current format: {token.name} - keep as-is
    { pattern: /\{([^}]+)\}/, format: "curly-brace" },

    // CSS variables: var(--token-name)
    { pattern: /var\(--([^)]+)\)/, format: "css-var" },

    // Sass variables: $token-name
    { pattern: /\$([a-zA-Z][a-zA-Z0-9_-]*)/, format: "sass" },

    // Other common patterns
    { pattern: /@([a-zA-Z][a-zA-Z0-9._-]*)/, format: "at-reference" },
    { pattern: /\[([^\]]+)\]/, format: "bracket-reference" },
  ];

  static normalizeReferences(value: any): {
    value: any;
    transformations: ReferenceTransformation[];
  } {
    if (typeof value !== "string") return { value, transformations: [] };

    const transformations: ReferenceTransformation[] = [];
    let normalizedValue = value;

    for (const { pattern, format } of this.REFERENCE_PATTERNS) {
      // Skip if already in curly-brace format
      if (format === "curly-brace") continue;

      const matches = normalizedValue.match(pattern);
      if (matches) {
        const originalRef = matches[0];
        const tokenName = matches[1];

        // Convert to standard format
        const normalizedRef = `{${this.normalizeTokenName(tokenName)}}`;
        normalizedValue = normalizedValue.replace(originalRef, normalizedRef);

        transformations.push({
          type: "reference-format",
          original: originalRef,
          normalized: normalizedRef,
          format,
        });
      }
    }

    return { value: normalizedValue, transformations };
  }

  static normalizeTokenName(tokenName: string): string {
    // Convert different naming conventions to dot notation
    return tokenName
      .replace(/--/g, ".") // CSS variable dashes: --color-primary → color.primary
      .replace(/_/g, ".") // Snake case: color_primary → color.primary
      .replace(/([a-z])([A-Z])/g, "$1.$2") // CamelCase: colorPrimary → color.Primary
      .toLowerCase();
  }

  static detectReferenceFormat(value: string): string {
    for (const { pattern, format } of this.REFERENCE_PATTERNS) {
      if (pattern.test(value)) {
        return format;
      }
    }
    return "none";
  }
}
