import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TokensStudioAdapter } from "../adapters/tokens-studio";
import { TokenFormatType } from "../format-adapter";

const adapter = new TokensStudioAdapter();

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const explosive = (thrown: unknown) =>
  Object.defineProperty({}, "boom", {
    enumerable: true,
    get() {
      throw thrown;
    },
  });

describe("detect", () => {
  it("reports the Tokens Studio format", () => {
    expect(adapter.detect({}).format).toBe(TokenFormatType.TOKENS_STUDIO_FLAT);
  });

  it("scores non-objects and arrays as zero", () => {
    expect(adapter.detect(null).confidence).toBe(0);
    expect(adapter.detect([]).confidence).toBe(0);
    expect(adapter.detect("tokens").confidence).toBe(0);
  });

  it("gives a plain object only the base score", () => {
    expect(adapter.detect({ a: 1 }).confidence).toBeCloseTo(0.2);
  });

  it.each(["$themes", "$metadata"])(
    "adds a large bonus for %s metadata",
    (key) => {
      const result = adapter.detect({ [key]: [] });
      expect(result.confidence).toBeCloseTo(0.6);
      expect(adapter.validate({ [key]: [] })).toBe(true);
    }
  );

  it("recognises token sets and skips $-prefixed keys and non-objects", () => {
    const withSet = adapter.detect({ core: { a: { value: "1" } } });
    expect(withSet.confidence).toBeGreaterThanOrEqual(0.5);
    const withoutSet = adapter.detect({
      $meta: { a: { value: "1" } },
      empty: null,
      text: "x",
      loose: { a: "not a token", b: null },
    });
    expect(withoutSet.confidence).toBeCloseTo(0.2);
  });

  it("adds a little for typical Tokens Studio token patterns", () => {
    const plain = adapter.detect({ core: { a: { value: "1" } } });
    const patterned = adapter.detect({
      core: { a: { value: "{b}", rawValue: "{b}", type: "color" } },
    });
    expect(patterned.confidence).toBeGreaterThan(plain.confidence);
  });

  it("samples at most five tokens across the sets", () => {
    const set = (prefix: string) =>
      Object.fromEntries(
        [1, 2, 3, 4].map((n) => [`${prefix}${n}`, { value: "{x}" }])
      );
    const result = adapter.detect({ one: set("a"), two: set("b") });
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it("validates only above 0.4", () => {
    expect(adapter.validate({ a: 1 })).toBe(false);
  });

  it("summarises the structure", () => {
    const { structure } = adapter.detect({
      $themes: [],
      core: {
        a: { value: "{b}" },
        b: { $value: "#fff" },
        c: "bare",
        d: null,
      },
      note: "ignored",
    });
    expect(structure).toMatchObject({
      hasCollections: true,
      tokenCount: 4,
      referenceCount: 1,
      referenceFormat: "curly-brace",
    });
    expect(adapter.detect(null).structure).toMatchObject({
      hasCollections: false,
      tokenCount: 0,
    });
    expect(adapter.detect({ $only: {} }).structure.hasCollections).toBe(false);
  });
});

describe("normalize: structure", () => {
  it("fails when there are no token sets", () => {
    for (const data of [
      {},
      null,
      { $themes: [] },
      { text: "x" },
      { s: { a: 1 } },
    ]) {
      const result = adapter.normalize(data);
      expect(result.success).toBe(false);
      expect(result.errors).toEqual([
        "No valid token sets found in Tokens Studio data",
      ]);
    }
  });

  it("skips metadata and sets that hold no tokens, and keeps the rest", () => {
    const result = adapter.normalize({
      $themes: [],
      empty: { note: "nothing" },
      core: { a: { value: "#fff", type: "color" } },
    });
    expect(result.success).toBe(true);
    expect(result.data.map((c) => Object.keys(c)[0])).toEqual(["core"]);
    expect(result.data[0].core.modes).toEqual([
      { modeId: "default", name: "Default" },
    ]);
  });

  it("reports a failure instead of throwing", () => {
    const result = adapter.normalize(explosive(new Error("boom")));
    expect(result.success).toBe(false);
    expect(result.errors).toEqual(["Tokens Studio normalization failed: boom"]);
    expect(adapter.normalize(explosive("nope")).errors[0]).toContain(
      "Unknown error"
    );
  });
});

describe("normalize: values", () => {
  const tokenOf = (token: unknown, name = "a") => {
    const result = adapter.normalize({ core: { [name]: token } });
    return result.data[0].core.variables[name];
  };

  it("reads the value from $value, value or rawValue, or uses a bare value", () => {
    expect(tokenOf({ $value: "1", type: "number" }).$value).toBe("1");
    expect(tokenOf({ value: "2", type: "number" }).$value).toBe("2");
    // A set is only recognised when some token has value or $value, so a
    // rawValue-only token has to sit next to one.
    const withSibling = adapter.normalize({
      core: { sibling: { value: "0" }, a: { rawValue: "3", type: "number" } },
    });
    expect(withSibling.data[0].core.variables.a.$value).toBe("3");
    expect(tokenOf({ value: "4" }, "bare").$value).toBe("4");
  });

  it("takes the description from $description, description or comment", () => {
    expect(tokenOf({ value: "1", $description: "a" }).$description).toBe("a");
    expect(tokenOf({ value: "1", description: "b" }).$description).toBe("b");
    expect(tokenOf({ value: "1", comment: "c" }).$description).toBe("c");
  });

  it("keeps an explicit type and records the property conversion", () => {
    const result = adapter.normalize({
      core: { a: { value: "1", type: "custom" } },
    });
    expect(result.data[0].core.variables.a.$type).toBe("custom");
    expect(
      result.transformations.some((t) => t.type === "type-inference")
    ).toBe(false);
    expect(
      result.transformations.some((t) => t.type === "property-normalization")
    ).toBe(true);
  });

  it("does not log a conversion for tokens that already use $value", () => {
    const result = adapter.normalize({
      core: { a: { $value: "1", $type: "x" } },
    });
    expect(
      result.transformations.some((t) => t.type === "property-normalization")
    ).toBe(false);
  });

  describe("rawValue", () => {
    it("keeps a raw reference instead of the resolved value", () => {
      const result = adapter.normalize({
        core: {
          base: { value: "#fff", type: "color" },
          alias: { value: "#fff", rawValue: "{base}", type: "color" },
        },
      });
      expect(result.data[0].core.variables.alias.$value).toBe("{core.base}");
      expect(
        result.transformations.some((t) => t.type === "value-resolution")
      ).toBe(true);
    });

    it("uses the resolved value when the raw value is not a reference", () => {
      expect(
        tokenOf({ value: "#fff", rawValue: "white", type: "color" }).$value
      ).toBe("#fff");
      expect(tokenOf({ value: 8, rawValue: 8, type: "number" }).$value).toBe(8);
    });
  });

  describe("cross-collection references", () => {
    const resolve = (sets: Record<string, Record<string, unknown>>) => {
      const result = adapter.normalize(sets);
      return Object.fromEntries(
        result.data.flatMap((c) => {
          const [setName, set] = Object.entries(c)[0];
          return Object.entries(set.variables).map(([k, v]) => [
            `${setName}.${k}`,
            v.$value,
          ]);
        })
      );
    };

    it("prefixes a reference with the set that defines it", () => {
      const out = resolve({
        Primitives: { "color.blue": { value: "#00f", type: "color" } },
        Semantic: {
          "color.accent": { value: "{color.blue}", type: "color" },
        },
      });
      expect(out["Semantic.color.accent"]).toBe("{Primitives.color.blue}");
    });

    it("resolves partial paths, such as the last segments", () => {
      const out = resolve({
        Primitives: { "color.blue.500": { value: "#00f", type: "color" } },
        Semantic: { accent: { value: "{blue.500}", type: "color" } },
      });
      expect(out["Semantic.accent"]).toBe("{Primitives.color.blue.500}");
    });

    it("falls back to searching for a key that ends with the reference", () => {
      const out = resolve({
        Primitives: { colorbrand: { value: "#00f", type: "color" } },
        Semantic: { accent: { value: "{brand}", type: "color" } },
      });
      expect(out["Semantic.accent"]).toBe("{Primitives.colorbrand}");
    });

    it("leaves a reference it cannot place", () => {
      const out = resolve({
        Primitives: { a: { value: "1", type: "number" } },
        Semantic: { b: { value: "{missing.thing}", type: "string" } },
      });
      expect(out["Semantic.b"]).toBe("{missing.thing}");
    });

    it("resolves several references in one value", () => {
      const out = resolve({
        Primitives: {
          "space.sm": { value: "4px", type: "dimension" },
          "space.lg": { value: "16px", type: "dimension" },
        },
        Semantic: {
          pad: { value: "{space.sm} {space.lg}", type: "string" },
        },
      });
      expect(out["Semantic.pad"]).toBe(
        "{Primitives.space.sm} {Primitives.space.lg}"
      );
    });

    it("does not touch values without references", () => {
      const out = resolve({
        Core: { a: { value: "plain", type: "string" } },
      });
      expect(out["Core.a"]).toBe("plain");
    });
  });

  describe("type inference", () => {
    it.each([
      ["#fff", "color"],
      ["#ffffff", "color"],
      ["rgb(0, 0, 0)", "color"],
      ["hsl(0, 0%, 0%)", "color"],
      ["16px", "dimension"],
      ["1.5rem", "dimension"],
      ["50%", "dimension"],
      ["12", "number"],
      ["{color.x}", "color"],
      ["{background.x}", "color"],
      ["{space.x}", "dimension"],
      ["{size.x}", "dimension"],
      ["{other.x}", "string"],
      [7, "number"],
      [false, "boolean"],
      ["hello", "string"],
    ])("infers %j as %s", (value, expected) => {
      const result = adapter.normalize({ core: { a: { value } } });
      expect(result.data[0].core.variables.a.$type).toBe(expected);
    });
  });
});
