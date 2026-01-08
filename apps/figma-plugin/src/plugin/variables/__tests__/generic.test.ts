import { describe, it, expect, beforeEach } from "vitest";
import { GenericAdapter } from "../adapters/generic";
import { TokenFormatType } from "../format-adapter";

describe("GenericAdapter", () => {
  let adapter: GenericAdapter;

  beforeEach(() => {
    adapter = new GenericAdapter();
  });

  describe("detect", () => {
    it("should return low confidence for array data", () => {
      const result = adapter.detect([]);
      expect(result.confidence).toBe(0);
    });

    it("should return low confidence for empty object", () => {
      const result = adapter.detect({});
      expect(result.confidence).toBe(0);
      expect(result.format).toBe(TokenFormatType.CUSTOM_FLAT);
    });

    it("should detect flat token structure with simple values", () => {
      const data = {
        primary: "#123456",
        secondary: "#654321",
        fontSize: "16px",
      };
      const result = adapter.detect(data);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.structure.tokenCount).toBe(3);
    });

    it("should boost confidence for @ references", () => {
      const data = {
        primary: "#000",
        alias: "@primary",
      };
      const result = adapter.detect(data);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.warnings.some((w) => w.includes("@ reference"))).toBe(true);
    });

    it("should detect token-like objects", () => {
      const data = {
        color: { value: "#123" },
        size: { $value: "10px" },
      };
      const result = adapter.detect(data);
      expect(result.confidence).toBeGreaterThan(0.5);
    });
  });

  describe("normalize", () => {
    it("should return empty collection if no tokens found", () => {
      const result = adapter.normalize({ $meta: "data" });
      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "No recognizable tokens found in flat structure"
      );
    });

    it("should normalize simple key-value pairs to localized tokens", () => {
      const data = {
        brand: "#ff0000",
        spacing: "8px",
      };
      const result = adapter.normalize(data);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      const variables = result.data[0].Tokens.variables;
      expect(variables.brand.$type).toBe("color");
      expect(variables.brand.$value).toBe("#ff0000");
      expect(variables.spacing.$type).toBe("dimension");
      expect(variables.spacing.$value).toBe("8px");
    });

    it("should normalize objects with value property", () => {
      const data = {
        myColor: { value: "#00ff00", description: "Green" },
      };
      const result = adapter.normalize(data);
      expect(result.success).toBe(true);
      const token = result.data[0].Tokens.variables.myColor;
      expect(token.$value).toBe("#00ff00");
      expect(token.$description).toBe("Green");
      expect(token.$type).toBe("color");
    });

    it("should normalize objects with $value property", () => {
      const data = {
        myColor: { $value: "#0000ff", $type: "color" },
      };
      const result = adapter.normalize(data);
      expect(result.success).toBe(true);
      const token = result.data[0].Tokens.variables.myColor;
      expect(token.$value).toBe("#0000ff");
      expect(token.$type).toBe("color");
    });

    it("should normalize @ references", () => {
      const data = {
        ref: "@other",
      };
      const result = adapter.normalize(data);
      const token = result.data[0].Tokens.variables.ref;
      expect(token.$value).toBe("{other}");
    });

    it("should infer types types correctly", () => {
      const data = {
        c1: "#fff",
        c2: "rgb(0,0,0)",
        d1: "10px",
        n1: 123,
        b1: true,
        f1: "Arial, sans-serif",
      };
      const result = adapter.normalize(data);
      const vars = result.data[0].Tokens.variables;

      expect(vars.c1.$type).toBe("color");
      expect(vars.c2.$type).toBe("color");
      expect(vars.d1.$type).toBe("dimension");
      expect(vars.n1.$type).toBe("number");
      expect(vars.b1.$type).toBe("boolean");
      expect(vars.f1.$type).toBe("fontFamily");
    });
  });

  describe("validate", () => {
    it("should return true for flat objects", () => {
      expect(adapter.validate({ foo: "bar" })).toBe(true);
    });
    it("should return false for arrays", () => {
      expect(adapter.validate([])).toBe(false);
    });
    it("should return false for null", () => {
      expect(adapter.validate(null)).toBe(false);
    });
  });
});
