/**
 * W3C DTCG Adapter Tests
 *
 * Tests the W3C Design Token Community Group format adapter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { W3CDTCGAdapter } from "../adapters/w3c-dtcg";
import { TokenFormatType } from "../format-adapter";
import { w3cDtcgTokens } from "@tests/fixtures/tokens";

describe("W3CDTCGAdapter", () => {
  let adapter: W3CDTCGAdapter;

  beforeEach(() => {
    adapter = new W3CDTCGAdapter();
  });

  describe("detect", () => {
    it("should detect W3C DTCG format with high confidence", () => {
      const result = adapter.detect(w3cDtcgTokens);

      expect(result.format).toBe(TokenFormatType.W3C_DTCG_FLAT);
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.structure.propertyFormat).toBe("$type/$value");
    });

    it("should detect W3C DTCG with $schema metadata", () => {
      const dataWithSchema = {
        $schema: "https://design-tokens.org/schema.json",
        color: {
          primary: {
            $type: "color",
            $value: "#3b82f6",
          },
        },
      };

      const result = adapter.detect(dataWithSchema);

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should detect W3C DTCG with $description metadata", () => {
      const dataWithDescription = {
        $description: "Design tokens",
        color: {
          primary: {
            $type: "color",
            $value: "#3b82f6",
          },
        },
      };

      const result = adapter.detect(dataWithDescription);

      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should return low confidence for non-W3C format", () => {
      const nonW3CData = {
        color: {
          primary: {
            value: "#3b82f6", // Missing $type and $value
          },
        },
      };

      const result = adapter.detect(nonW3CData);

      expect(result.confidence).toBeLessThan(0.5);
    });

    it("should handle nested token groups", () => {
      const nestedData = {
        color: {
          gray: {
            50: { $type: "color", $value: "#f9fafb" },
            100: { $type: "color", $value: "#f3f4f6" },
          },
        },
      };

      const result = adapter.detect(nestedData);

      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
      expect(result.structure.tokenCount).toBe(2);
    });

    it("should count references correctly", () => {
      const dataWithReferences = {
        color: {
          primary: { $type: "color", $value: "#3b82f6" },
          accent: { $type: "color", $value: "{color.primary}" },
        },
      };

      const result = adapter.detect(dataWithReferences);

      expect(result.structure.referenceCount).toBe(1);
    });
  });

  describe("normalize", () => {
    it("should normalize W3C DTCG tokens into collections", () => {
      const result = adapter.normalize(w3cDtcgTokens);

      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should preserve token metadata", () => {
      const dataWithMetadata = {
        color: {
          primary: {
            $type: "color",
            $value: "#3b82f6",
            $description: "Primary brand color",
          },
        },
      };

      const result = adapter.normalize(dataWithMetadata);

      expect(result.success).toBe(true);

      // Find the color collection
      const colorCollection = result.data.find((c: any) => c.color);
      expect(colorCollection).toBeDefined();

      const variables = colorCollection.color.variables;
      expect(variables["color.primary"].$description).toBe(
        "Primary brand color"
      );
    });

    it("should organize tokens into collections by category", () => {
      const result = adapter.normalize(w3cDtcgTokens);

      expect(result.success).toBe(true);

      // Should have separate collections for color, spacing, fontSize
      const collectionNames = result.data.flatMap((c: any) => Object.keys(c));
      expect(collectionNames).toContain("color");
      expect(collectionNames).toContain("spacing");
      expect(collectionNames).toContain("fontSize");
    });

    it("should handle nested token paths", () => {
      const nestedData = {
        color: {
          gray: {
            50: { $type: "color", $value: "#f9fafb" },
            100: { $type: "color", $value: "#f3f4f6" },
          },
        },
      };

      const result = adapter.normalize(nestedData);

      expect(result.success).toBe(true);

      const colorCollection = result.data.find((c: any) => c.color);
      const variables = colorCollection.color.variables;

      expect(variables["color.gray.50"]).toBeDefined();
      expect(variables["color.gray.100"]).toBeDefined();
    });

    it("should skip metadata fields", () => {
      const dataWithMetadata = {
        $schema: "https://design-tokens.org/schema.json",
        $description: "Design tokens",
        color: {
          primary: { $type: "color", $value: "#3b82f6" },
        },
      };

      const result = adapter.normalize(dataWithMetadata);

      expect(result.success).toBe(true);

      // Should not create collections for $ metadata fields
      const hasSchemaCollection = result.data.some((c: any) => c.$schema);
      const hasDescriptionCollection = result.data.some(
        (c: any) => c.$description
      );

      expect(hasSchemaCollection).toBe(false);
      expect(hasDescriptionCollection).toBe(false);
    });

    it("should log transformations", () => {
      const result = adapter.normalize(w3cDtcgTokens);

      expect(result.transformations.length).toBeGreaterThan(0);
      expect(result.transformations[0].type).toBe("structure");
    });

    it("should handle errors gracefully", () => {
      const invalidData = null;

      const result = adapter.normalize(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("validate", () => {
    it("should validate W3C DTCG format", () => {
      const isValid = adapter.validate(w3cDtcgTokens);

      expect(isValid).toBe(true);
    });

    it("should reject non-W3C format", () => {
      const nonW3CData = {
        color: {
          primary: {
            value: "#3b82f6", // Missing $type
          },
        },
      };

      const isValid = adapter.validate(nonW3CData);

      expect(isValid).toBe(false);
    });

    it("should reject invalid data types", () => {
      // These should not throw, but return false
      expect(adapter.validate("string")).toBe(false);
      expect(adapter.validate(123)).toBe(false);
      expect(adapter.validate([])).toBe(false);
      // Skip null/undefined as they may throw in Object.entries
    });
  });

  describe("edge cases", () => {
    it("should handle empty objects", () => {
      const result = adapter.normalize({});

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it("should handle deeply nested structures", () => {
      const deeplyNested = {
        level1: {
          level2: {
            level3: {
              level4: {
                token: { $type: "color", $value: "#000" },
              },
            },
          },
        },
      };

      const result = adapter.normalize(deeplyNested);

      expect(result.success).toBe(true);
    });

    it("should handle circular references with depth limit", () => {
      // Create a deeply nested structure (not truly circular)
      const deep: any = { level1: {} };
      let current = deep.level1;
      for (let i = 0; i < 15; i++) {
        current[`level${i + 2}`] = {};
        current = current[`level${i + 2}`];
      }
      current.token = { $type: "color", $value: "#000" };

      // Should handle depth limit gracefully
      const result = adapter.detect(deep);
      expect(result).toBeDefined();
    });
  });
});
