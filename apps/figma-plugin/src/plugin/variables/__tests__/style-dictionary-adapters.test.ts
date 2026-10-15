import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StyleDictionaryFlatAdapter } from "../adapters/style-dictionary-flat";
import { StyleDictionaryNestedAdapter } from "../adapters/style-dictionary-nested";
import { TokenFormatType } from "../format-adapter";

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** An object that throws while it is being read, to reach the catch blocks. */
const explosive = (thrown: unknown) =>
  Object.defineProperty({}, "boom", {
    enumerable: true,
    get() {
      throw thrown;
    },
  });

describe("StyleDictionaryFlatAdapter", () => {
  const adapter = new StyleDictionaryFlatAdapter();

  const flat = {
    "color.brand": { value: "#ff0000", type: "color" },
    "spacing.md": { $value: "{spacing.base}", $type: "dimension" },
    "typography.body": { value: "16px", comment: "Body size" },
  };

  describe("detect", () => {
    it("is confident about dotted keys holding value objects", () => {
      const result = adapter.detect(flat);
      expect(result.format).toBe(TokenFormatType.STYLE_DICTIONARY_FLAT);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("gives a plain object without tokens only the base score", () => {
      expect(adapter.detect({ a: 1, b: "x" }).confidence).toBeCloseTo(0.2);
    });

    it("scores arrays and non-objects as zero", () => {
      expect(adapter.detect([]).confidence).toBe(0);
      expect(adapter.detect(null).confidence).toBe(0);
      expect(adapter.detect("tokens").confidence).toBe(0);
    });

    it("ignores keys whose value is not an object", () => {
      const result = adapter.detect({ "color.a": null, "color.b": 3 });
      expect(result.confidence).toBeCloseTo(0.2 + 0.3 + 0.1);
    });

    it("validates only above the 0.5 threshold", () => {
      expect(adapter.validate(flat)).toBe(true);
      expect(adapter.validate({ a: 1 })).toBe(false);
    });
  });

  describe("structure analysis", () => {
    const structure = (data: unknown) => adapter.detect(data).structure;

    it("counts tokens and references and reports the reference style", () => {
      const result = structure(flat);
      expect(result.tokenCount).toBe(3);
      expect(result.referenceCount).toBe(1);
      expect(result.referenceFormat).toBe("curly-brace");
      expect(result.hasCollections).toBe(false);
      expect(result.namingConvention).toBe("dot-notation");
    });

    it.each([
      ["$type/$value", { a: { $type: "color", $value: "#fff" } }],
      ["type/value", { a: { type: "color", value: "#fff" } }],
      [
        "mixed",
        {
          a: { type: "color", value: "#fff" },
          b: { $type: "color", $value: "#000" },
        },
      ],
      ["other", { a: { value: "#fff" } }],
    ])("detects %s property format", (expected, data) => {
      expect(structure(data).propertyFormat).toBe(expected);
    });

    it.each([
      ["css-var", { a: { value: "var(--x)" } }],
      ["sass", { a: { value: "$brand" } }],
      ["other", { a: { value: "@brand" } }],
      ["none", { a: { value: "plain" } }],
      ["none", { a: "not an object" }],
    ])("detects %s references", (expected, data) => {
      expect(structure(data).referenceFormat).toBe(expected);
    });

    it("counts css variables as references", () => {
      expect(structure({ a: { value: "var(--x)" } }).referenceCount).toBe(1);
    });

    it("handles input that is not an object", () => {
      expect(structure(null)).toMatchObject({
        tokenCount: 0,
        referenceFormat: "none",
      });
      expect(structure([1])).toMatchObject({ tokenCount: 0 });
    });
  });

  describe("normalize", () => {
    it("groups tokens into a collection per first path segment", () => {
      const result = adapter.normalize(flat);
      expect(result.success).toBe(true);
      expect(result.data.map((c) => Object.keys(c)[0])).toEqual([
        "color",
        "spacing",
        "typography",
      ]);
      const color = result.data[0].color;
      expect(color.modes).toEqual([{ modeId: "default", name: "Default" }]);
      expect(color.variables["color.brand"]).toEqual({
        $type: "color",
        $value: "#ff0000",
        $description: undefined,
      });
    });

    it("converts value and type to their $ forms and records it", () => {
      const result = adapter.normalize({
        "color.a": { value: "#fff", type: "color" },
      });
      const descriptions = result.transformations.map((t) => t.description);
      expect(descriptions).toContain('Converted "value" to "$value"');
      expect(descriptions).toContain('Converted "type" to "$type"');
    });

    it("does not log a conversion for tokens already using $ properties", () => {
      const result = adapter.normalize({
        "color.a": { $value: "#ffffff", $type: "color" },
      });
      expect(
        result.transformations.some((t) => t.type === "property-normalization")
      ).toBe(false);
    });

    it("takes the description from $description, description or comment", () => {
      const result = adapter.normalize({
        "a.one": { $value: 1, $description: "first" },
        "a.two": { value: 2, description: "second" },
        "a.three": { value: 3, comment: "third" },
      });
      const vars = result.data[0].a.variables;
      expect(vars["a.one"].$description).toBe("first");
      expect(vars["a.two"].$description).toBe("second");
      expect(vars["a.three"].$description).toBe("third");
    });

    it.each([
      ["#abcdef", "color"],
      ["16px", "dimension"],
      ["1.5rem", "dimension"],
      ["12", "number"],
      ["var(--x)", "reference"],
      ["{a.b}", "reference"],
      ["hello", "string"],
      [7, "number"],
      [true, "boolean"],
      [null, "string"],
    ])("infers the type of %j as %s", (value, expected) => {
      const result = adapter.normalize({ "misc.a": { value } });
      expect(result.data[0].misc.variables["misc.a"].$type).toBe(expected);
      expect(
        result.transformations.some((t) => t.type === "type-inference")
      ).toBe(true);
    });

    it("treats a bare value as the token value", () => {
      const result = adapter.normalize({ "misc.a": "#123456" });
      expect(result.data[0].misc.variables["misc.a"]).toMatchObject({
        $type: "color",
        $value: "#123456",
      });
    });

    it("puts an empty key into a default collection", () => {
      const result = adapter.normalize({ "": { value: 1 } });
      expect(Object.keys(result.data[0])).toEqual(["default"]);
    });

    it("returns nothing for input that is not an object", () => {
      const result = adapter.normalize(null);
      expect(result).toMatchObject({ success: true, data: [] });
    });

    it("reports a failure instead of throwing", () => {
      const result = adapter.normalize(explosive(new Error("boom")));
      expect(result.success).toBe(false);
      expect(result.errors).toEqual(["Normalization failed: boom"]);
      const unknown = adapter.normalize(explosive("not an error"));
      expect(unknown.errors).toEqual(["Normalization failed: Unknown error"]);
    });
  });
});

describe("StyleDictionaryNestedAdapter", () => {
  const adapter = new StyleDictionaryNestedAdapter();

  const nested = {
    color: {
      brand: { primary: { value: "{color.base}", type: "color" } },
      base: { value: "#ff0000" },
    },
    size: { md: { $value: "16px", $description: "Medium" } },
  };

  describe("detect", () => {
    it("is confident about nested categories holding tokens", () => {
      const result = adapter.detect(nested);
      expect(result.format).toBe(TokenFormatType.STYLE_DICTIONARY_NESTED);
      expect(result.confidence).toBe(1);
      expect(adapter.validate(nested)).toBe(true);
    });

    it("scores a plain object without nested tokens at the base level", () => {
      const result = adapter.detect({ a: 1, b: { c: 2 } });
      expect(result.confidence).toBeCloseTo(0.2);
      expect(adapter.validate({ a: 1 })).toBe(false);
    });

    it("ignores arrays inside categories and scores arrays as zero", () => {
      expect(adapter.detect({ a: [{ value: 1 }] }).confidence).toBeCloseTo(0.2);
      expect(adapter.detect([]).confidence).toBe(0);
      expect(adapter.detect(null).confidence).toBe(0);
    });

    it("adds a small bonus for the usual category names", () => {
      const withFont = adapter.detect({ font: { a: { value: 1 } } });
      const without = adapter.detect({ other: { a: { value: 1 } } });
      expect(withFont.confidence).toBeCloseTo(without.confidence + 0.1);
    });
  });

  describe("structure analysis", () => {
    const structure = (data: unknown) => adapter.detect(data).structure;

    it("counts nested tokens and references", () => {
      const result = structure(nested);
      expect(result.tokenCount).toBe(3);
      expect(result.referenceCount).toBe(1);
      expect(result.hasCollections).toBe(true);
      expect(result.referenceFormat).toBe("curly-brace");
      expect(result.propertyFormat).toBe("mixed");
    });

    it.each([
      ["css-var", { a: { b: { value: "var(--x)" } } }],
      ["sass", { a: { b: { value: "$brand" } } }],
      ["other", { a: { b: { value: "@brand" } } }],
      ["none", { a: { b: { value: "plain" } } }],
    ])("detects %s references deep in the tree", (expected, data) => {
      expect(structure(data).referenceFormat).toBe(expected);
    });

    it("counts css variables as references", () => {
      expect(
        structure({ a: { b: { value: "var(--x)" } } }).referenceCount
      ).toBe(1);
    });

    it("handles input that is not an object", () => {
      expect(structure(null)).toMatchObject({
        tokenCount: 0,
        hasCollections: false,
        referenceFormat: "none",
      });
      expect(structure({})).toMatchObject({ hasCollections: false });
    });
  });

  describe("normalize", () => {
    it("flattens the tree and groups tokens into collections by top-level category", () => {
      const result = adapter.normalize(nested);
      expect(result.success).toBe(true);
      expect(result.data.map((c) => Object.keys(c)[0])).toEqual([
        "color",
        "size",
      ]);
      const color = result.data[0].color;
      expect(Object.keys(color.variables)).toEqual([
        "color.brand.primary",
        "color.base",
      ]);
      expect(color.modes).toEqual([{ modeId: "default", name: "Default" }]);
      expect(result.data[1].size.variables["size.md"]).toMatchObject({
        $type: "dimension",
        $value: "16px",
        $description: "Medium",
      });
      expect(result.transformations.map((t) => t.type)).toEqual(
        expect.arrayContaining(["structure", "grouping"])
      );
    });

    it("keeps explicit types and logs the value conversion", () => {
      const result = adapter.normalize({
        color: { a: { value: "{x}", type: "custom" } },
      });
      expect(result.data[0].color.variables["color.a"].$type).toBe("custom");
      expect(
        result.transformations.filter(
          (t) => t.type === "property-normalization"
        )
      ).toHaveLength(1);
    });

    it("notes Style Dictionary attributes and ignores empty ones", () => {
      const withAttrs = adapter.normalize({
        color: { a: { value: "#fff", attributes: { category: "color" } } },
      });
      expect(
        withAttrs.transformations.some((t) => t.type === "attribute-processing")
      ).toBe(true);
      const empty = adapter.normalize({
        color: { a: { value: "#fff", attributes: {} } },
      });
      expect(
        empty.transformations.some((t) => t.type === "attribute-processing")
      ).toBe(false);
    });

    it("writes a description from the path when none is given", () => {
      const result = adapter.normalize({
        color: { a: { value: "#fff", comment: "From the comment" } },
        size: { md: { value: "1px" } },
        lonely: { value: "x" },
      });
      expect(result.data[0].color.variables["color.a"].$description).toBe(
        "From the comment"
      );
      expect(result.data[1].size.variables["size.md"].$description).toBe(
        "size md token from Style Dictionary"
      );
      expect(result.data[2].lonely.variables.lonely.$description).toBe(
        "Style Dictionary token: lonely"
      );
    });

    it("skips values that are not objects while flattening", () => {
      const result = adapter.normalize({
        color: { a: { value: "#fff" }, note: "ignored", nothing: null },
      });
      expect(Object.keys(result.data[0].color.variables)).toEqual(["color.a"]);
    });

    it.each([
      ["color.brand", "#ff0000", "color"],
      ["font.size.md", "16px", "fontSize"],
      ["font.family.sans", "Inter", "fontFamily"],
      ["font.weight.bold", "700", "fontWeight"],
      ["line.height.tight", "1.2", "lineHeight"],
      ["letter.spacing.wide", "0.1em", "letterSpacing"],
      ["layout.spacing.md", "8px", "spacing"],
      ["layout.space.md", "8px", "spacing"],
      ["layout.gap.md", "8px", "spacing"],
      ["box.size.md", "8px", "dimension"],
      ["box.width.md", "8px", "dimension"],
      ["box.height.md", "8px", "dimension"],
      ["shape.radius.md", "4px", "borderRadius"],
      ["shape.border.thin", "1px", "borderRadius"],
      ["effect.shadow.md", "0 1px 2px", "shadow"],
      ["effect.elevation.md", "0 1px 2px", "shadow"],
      ["misc.hex", "#abcdef", "color"],
      ["misc.px", "12px", "dimension"],
      ["misc.percent", "50%", "dimension"],
      ["misc.numeric-string", "1.5", "number"],
      ["misc.number", 3, "number"],
      ["misc.flag", false, "boolean"],
      ["misc.text", "hello", "string"],
    ])("infers the type of %s (%j) as %s", (path, value, expected) => {
      const [category, ...rest] = path.split(".");
      let node: Record<string, unknown> = { value };
      for (const key of rest.reverse()) node = { [key]: node };
      const result = adapter.normalize({ [category]: node });
      const token = result.data[0][category].variables[path];
      expect(token.$type).toBe(expected);
    });

    it("fails with a clear message when there are no tokens", () => {
      const result = adapter.normalize({ a: { b: "not a token" } });
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        "No valid tokens found in nested Structure Dictionary structure",
      ]);
    });

    it("reports a failure instead of throwing", () => {
      const result = adapter.normalize({ color: explosive(new Error("boom")) });
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain("normalization failed: boom");
      const unknown = adapter.normalize({ color: explosive("nope") });
      expect(unknown.errors[0]).toContain("Unknown error");
    });
  });
});
