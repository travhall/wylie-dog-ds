import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyTextStyleChanges,
  computeTextStyleChanges,
  describeApplyResult,
  describeTextStyleChange,
  formatSpacing,
  readLocalTextStyles,
  resolveTokenNumber,
  TEXT_STYLE_LINK_NAMESPACE,
} from "../text-style-links";
import type { TextStyleInfo } from "../text-style-links";
import type { ExportData } from "../processor";

const tokens = (
  primitive: Record<string, { $type: string; $value: unknown }>,
  components: Record<string, { $type: string; $value: unknown }> = {}
): ExportData[] =>
  [
    { primitive: { modes: [], variables: primitive } },
    { components: { modes: [], variables: components } },
  ] as unknown as ExportData[];

const TOKENS = tokens(
  {
    "typography.line-height.none": { $type: "number", $value: 100 },
    "typography.line-height.tight": { $type: "number", $value: 125 },
    "typography.line-height.snug": { $type: "number", $value: 137.5 },
    "typography.tracking.tight": { $type: "dimension", $value: "-0.025em" },
    "typography.tracking.normal": { $type: "dimension", $value: "0em" },
  },
  {
    "button.line-height": {
      $type: "number",
      $value: "{typography.line-height.none}",
    },
    "card.title.letter-spacing": {
      $type: "dimension",
      $value: "{typography.tracking.tight}",
    },
    // two-step alias chain
    "card.title.line-height": {
      $type: "number",
      $value: "{card.title.line-height-base}",
    },
    "card.title.line-height-base": {
      $type: "number",
      $value: "{typography.line-height.tight}",
    },
  }
);

const style = (over: Partial<TextStyleInfo> = {}): TextStyleInfo => ({
  id: "S:1",
  name: "button/label/sm",
  lineHeight: { unit: "PERCENT", value: 100 },
  letterSpacing: { unit: "PERCENT", value: 0 },
  ...over,
});

describe("TEXT_STYLE_LINK_NAMESPACE", () => {
  it("is a namespace Figma accepts for shared plugin data", () => {
    // Figma rejects anything but letters, digits, underscore and dot
    // ("The namespace can only consist of alphanumeric characters, _ or .");
    // a hyphenated name made every getSharedPluginData call throw.
    expect(TEXT_STYLE_LINK_NAMESPACE).toMatch(/^[A-Za-z0-9_.]{3,}$/);
  });
});

describe("resolveTokenNumber", () => {
  it("reads numbers, follows alias chains and parses em", () => {
    expect(resolveTokenNumber("typography.line-height.tight", TOKENS)).toEqual({
      ok: true,
      value: 125,
      unit: "none",
    });
    expect(resolveTokenNumber("card.title.line-height", TOKENS)).toMatchObject({
      ok: true,
      value: 125,
    });
    expect(resolveTokenNumber("card.title.letter-spacing", TOKENS)).toEqual({
      ok: true,
      value: -0.025,
      unit: "em",
    });
  });

  it("reports missing tokens, cycles and unusable units", () => {
    expect(resolveTokenNumber("nope", TOKENS)).toEqual({
      ok: false,
      reason: "missing",
    });
    const cyclic = tokens({
      "a.b": { $type: "number", $value: "{a.c}" },
      "a.c": { $type: "number", $value: "{a.b}" },
    });
    expect(resolveTokenNumber("a.b", cyclic)).toEqual({
      ok: false,
      reason: "missing",
    });
    const px = tokens({ "a.px": { $type: "dimension", $value: "2px" } });
    expect(resolveTokenNumber("a.px", px)).toEqual({
      ok: false,
      reason: "unsupported",
    });
  });
});

describe("computeTextStyleChanges", () => {
  it("makes no change when the style already matches", () => {
    const diff = computeTextStyleChanges(
      [style({ lineHeightToken: "button.line-height" })],
      TOKENS
    );
    expect(diff.changes).toEqual([]);
    expect(diff.problems).toEqual([]);
  });

  it("tolerates float noise in Figma's stored percent", () => {
    const diff = computeTextStyleChanges(
      [
        style({
          lineHeight: { unit: "PERCENT", value: 100.0000001 },
          lineHeightToken: "button.line-height",
        }),
      ],
      TOKENS
    );
    expect(diff.changes).toEqual([]);
  });

  it("changes line height 100 to 125", () => {
    const changed = tokens(
      { "typography.line-height.none": { $type: "number", $value: 125 } },
      {
        "button.line-height": {
          $type: "number",
          $value: "{typography.line-height.none}",
        },
      }
    );
    const diff = computeTextStyleChanges(
      [style({ lineHeightToken: "button.line-height" })],
      changed
    );
    expect(diff.changes).toHaveLength(1);
    expect(diff.changes[0].lineHeight).toEqual({
      from: { unit: "PERCENT", value: 100 },
      to: 125,
    });
    expect(diff.changes[0].letterSpacing).toBeUndefined();
    expect(describeTextStyleChange(diff.changes[0])).toBe(
      "line height 100% → 125%"
    );
  });

  it("turns -0.025em into -2.5 percent and AUTO line height into percent", () => {
    const diff = computeTextStyleChanges(
      [
        style({
          name: "card/title",
          lineHeight: { unit: "AUTO" },
          lineHeightToken: "card.title.line-height",
          letterSpacingToken: "card.title.letter-spacing",
        }),
      ],
      TOKENS
    );
    expect(diff.changes[0].lineHeight).toEqual({
      from: { unit: "AUTO" },
      to: 125,
    });
    expect(diff.changes[0].letterSpacing?.to).toBe(-2.5);
    expect(describeTextStyleChange(diff.changes[0])).toBe(
      "line height auto → 125%, letter spacing 0% → -2.5%"
    );
  });

  it("treats a pixel line height as different from the same percent number", () => {
    const diff = computeTextStyleChanges(
      [
        style({
          lineHeight: { unit: "PIXELS", value: 100 },
          lineHeightToken: "button.line-height",
        }),
      ],
      TOKENS
    );
    expect(diff.changes).toHaveLength(1);
  });

  it("reports a style whose token no longer exists, without changing it", () => {
    const diff = computeTextStyleChanges(
      [style({ lineHeightToken: "gone.line-height" })],
      TOKENS
    );
    expect(diff.changes).toEqual([]);
    expect(diff.problems).toEqual([
      {
        id: "S:1",
        name: "button/label/sm",
        token: "gone.line-height",
        reason: "missing",
      },
    ]);
  });

  it("lists styles without links as unlinked and never changes them", () => {
    const diff = computeTextStyleChanges(
      [
        style({
          id: "S:9",
          name: "designer/hero",
          lineHeight: { unit: "AUTO" },
        }),
      ],
      TOKENS
    );
    expect(diff.unlinked).toEqual([{ id: "S:9", name: "designer/hero" }]);
    expect(diff.changes).toEqual([]);
    expect(diff.problems).toEqual([]);
  });

  it("still changes the resolvable property when the other token is missing", () => {
    const diff = computeTextStyleChanges(
      [
        style({
          lineHeight: { unit: "AUTO" },
          lineHeightToken: "button.line-height",
          letterSpacingToken: "gone.letter-spacing",
        }),
      ],
      TOKENS
    );
    expect(diff.changes[0].lineHeight?.to).toBe(100);
    expect(diff.problems).toHaveLength(1);
  });
});

describe("formatSpacing", () => {
  it("formats each unit", () => {
    expect(formatSpacing({ unit: "AUTO" })).toBe("auto");
    expect(formatSpacing({ unit: "PERCENT", value: 137.5 })).toBe("137.5%");
    expect(formatSpacing({ unit: "PIXELS", value: 20 })).toBe("20px");
  });
});

describe("figma text styles", () => {
  const styles: Record<string, Record<string, unknown>> = {};
  const loadFontAsync = vi.fn();

  beforeEach(() => {
    for (const key of Object.keys(styles)) delete styles[key];
    loadFontAsync.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal("figma", {
      getLocalTextStylesAsync: async () => Object.values(styles),
      getStyleByIdAsync: async (id: string) => styles[id] ?? null,
      loadFontAsync,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const addStyle = (id: string, shared: Record<string, string> = {}) => {
    styles[id] = {
      id,
      name: `style-${id}`,
      type: "TEXT",
      fontName: { family: "Manrope", style: "Medium" },
      lineHeight: { unit: "AUTO" },
      letterSpacing: { unit: "PERCENT", value: 0 },
      getSharedPluginData: (ns: string, key: string) =>
        ns === "wylie_dog" ? (shared[key] ?? "") : "",
    };
    return styles[id];
  };

  it("reads links from the wylie_dog namespace and leaves unlinked styles bare", async () => {
    addStyle("S:1", {
      lineHeightToken: "button.line-height",
      letterSpacingToken: "card.title.letter-spacing",
    });
    addStyle("S:2");
    const read = await readLocalTextStyles();
    expect(read[0]).toMatchObject({
      id: "S:1",
      lineHeight: { unit: "AUTO" },
      letterSpacing: { unit: "PERCENT", value: 0 },
      lineHeightToken: "button.line-height",
      letterSpacingToken: "card.title.letter-spacing",
    });
    expect(read[1].lineHeightToken).toBeUndefined();
    expect(read[1].letterSpacingToken).toBeUndefined();
  });

  it("loads the font, then sets percent line height and letter spacing", async () => {
    const s = addStyle("S:1");
    const result = await applyTextStyleChanges([
      {
        id: "S:1",
        name: "style-S:1",
        lineHeight: { from: { unit: "AUTO" }, to: 125 },
        letterSpacing: { from: { unit: "PERCENT", value: 0 }, to: -2.5 },
      },
    ]);
    expect(loadFontAsync).toHaveBeenCalledWith({
      family: "Manrope",
      style: "Medium",
    });
    expect(s.lineHeight).toEqual({ unit: "PERCENT", value: 125 });
    expect(s.letterSpacing).toEqual({ unit: "PERCENT", value: -2.5 });
    expect(result).toEqual({ applied: 1, skipped: [] });
  });

  it("only touches the properties that changed", async () => {
    const s = addStyle("S:1");
    await applyTextStyleChanges([
      {
        id: "S:1",
        name: "style-S:1",
        lineHeight: { from: { unit: "AUTO" }, to: 125 },
      },
    ]);
    expect(s.letterSpacing).toEqual({ unit: "PERCENT", value: 0 });
  });

  it("skips and reports a style whose font cannot be loaded, and still applies the rest", async () => {
    const bad = addStyle("S:1");
    const good = addStyle("S:2");
    loadFontAsync.mockRejectedValueOnce(new Error("font missing"));
    const result = await applyTextStyleChanges([
      {
        id: "S:1",
        name: "style-S:1",
        lineHeight: { from: { unit: "AUTO" }, to: 125 },
      },
      {
        id: "S:2",
        name: "style-S:2",
        lineHeight: { from: { unit: "AUTO" }, to: 125 },
      },
    ]);
    expect(bad.lineHeight).toEqual({ unit: "AUTO" });
    expect(good.lineHeight).toEqual({ unit: "PERCENT", value: 125 });
    expect(result.applied).toBe(1);
    expect(result.skipped).toEqual([
      { name: "style-S:1", reason: "font", detail: "Manrope Medium" },
    ]);
    expect(describeApplyResult(result)).toBe(
      "Updated 1 text style, skipped 1: style-S:1 (font Manrope Medium unavailable)"
    );
  });

  it("reports a style that no longer exists", async () => {
    const result = await applyTextStyleChanges([
      {
        id: "S:404",
        name: "gone",
        lineHeight: { from: { unit: "AUTO" }, to: 125 },
      },
    ]);
    expect(result.skipped).toEqual([{ name: "gone", reason: "missing-style" }]);
  });
});
