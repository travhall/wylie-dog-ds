import { describe, it, expect, beforeEach } from "vitest";
import { WylieDogNativeAdapter } from "../adapters/wylie-dog-native";
import { TokenFormatType } from "../format-adapter";

describe("WylieDogNativeAdapter", () => {
  let adapter: WylieDogNativeAdapter;

  beforeEach(() => {
    adapter = new WylieDogNativeAdapter();
  });

  describe("detect", () => {
    it("should return low confidence for non-array data", () => {
      const result = adapter.detect({ foo: "bar" });
      expect(result.confidence).toBe(0);
    });

    it("should return low confidence for empty array", () => {
      const result = adapter.detect([]);
      expect(result.confidence).toBeGreaterThanOrEqual(0.3); // Has array wrapper
      expect(result.format).toBe(TokenFormatType.WYLIE_DOG);
    });

    it("should detect collection structure", () => {
      const data = [
        {
          "My Collection": {
            modes: [],
            variables: {},
          },
        },
      ];
      const result = adapter.detect(data);
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it("should detect full Wylie Dog structure with high confidence", () => {
      const data = [
        {
          Collection1: {
            modes: [{ modeId: "1", name: "Default" }],
            variables: {
              "color.primary": {
                $type: "color",
                $value: "#dadada",
              },
            },
          },
        },
      ];
      const result = adapter.detect(data);
      expect(result.confidence).toBeGreaterThanOrEqual(0.9);
      expect(result.structure.hasCollections).toBe(true);
      expect(result.structure.tokenCount).toBe(1);
    });
  });

  describe("normalize", () => {
    it("should fail if data is not an array", () => {
      const result = adapter.normalize({});
      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "Native format expects array of collection objects"
      );
    });

    it("should fail if validation finds invalid objects", () => {
      const result = adapter.normalize([null]);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain("Collection at index 0");
    });

    it("should valid collections missing variables", () => {
      const result = adapter.normalize([{ BadColl: {} }]);
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain("missing variables object");
    });

    it("should pass through valid data as-is", () => {
      const validData = [
        {
          Collection1: {
            modes: [],
            variables: {
              token1: { $type: "color", $value: "#fff" },
            },
          },
        },
      ];
      const result = adapter.normalize(validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("validate", () => {
    it("should return true for high confidence data", () => {
      const data = [
        {
          Collection1: {
            modes: [{ modeId: "1", name: "Default" }],
            variables: {
              "color.primary": {
                $type: "color",
                $value: "#dadada",
              },
            },
          },
        },
      ];
      expect(adapter.validate(data)).toBe(true);
    });

    it("should return false for low confidence data", () => {
      expect(adapter.validate({})).toBe(false);
    });
  });
});
