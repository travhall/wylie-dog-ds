import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyTextStyleDefinitions,
  describeDefinitionResult,
  describePlanWork,
  fontStyleFromWeight,
  parseTextStyleDefinitions,
  planTextStyles,
  planWork,
  planWorkCount,
} from "../text-style-definitions";
import type { TextStyleDefinition } from "../text-style-definitions";
import { TEXT_STYLE_LINK_NAMESPACE } from "../text-style-links";
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
    "typography.font-family.sans": { $type: "fontFamily", $value: "Manrope" },
    "typography.font-size.sm": { $type: "number", $value: 14 },
    "typography.font-weight.medium": { $type: "number", $value: 500 },
    "typography.line-height.none": { $type: "number", $value: 100 },
    "typography.line-height.tight": { $type: "number", $value: 125 },
    "typography.tracking.tight": { $type: "dimension", $value: "-0.025em" },
  },
  {
    "button.font-size.sm": {
      $type: "number",
      $value: "{typography.font-size.sm}",
    },
    "button.font-weight": {
      $type: "number",
      $value: "{typography.font-weight.medium}",
    },
    // two-step alias chain
    "button.line-height": {
      $type: "number",
      $value: "{button.line-height-base}",
    },
    "button.line-height-base": {
      $type: "number",
      $value: "{typography.line-height.tight}",
    },
    "card.title.letter-spacing": {
      $type: "dimension",
      $value: "{typography.tracking.tight}",
    },
    "tooltip.font-size": {
      $type: "number",
      $value: "{typography.font-size.sm}",
    },
  }
);

const BUTTON: TextStyleDefinition = {
  name: "button/sm",
  fontFamily: "typography.font-family.sans",
  fontSize: "button.font-size.sm",
  fontWeight: "button.font-weight",
  lineHeight: "button.line-height",
};
const CARD: TextStyleDefinition = {
  name: "card/title",
  fontFamily: "typography.font-family.sans",
  fontSize: "button.font-size.sm",
  letterSpacing: "card.title.letter-spacing",
};
const TOOLTIP: TextStyleDefinition = {
  name: "tooltip",
  fontFamily: "typography.font-family.sans",
  fontSize: "tooltip.font-size",
};

/** A style Token Bridge created and that already matches BUTTON. */
const managed = (over: Partial<TextStyleInfo> = {}): TextStyleInfo => ({
  id: "S:1",
  name: "button/sm",
  lineHeight: { unit: "PERCENT", value: 125 },
  letterSpacing: { unit: "PERCENT", value: 0 },
  lineHeightToken: "button.line-height",
  managed: true,
  bound: {
    fontFamily: "typography.font-family.sans",
    fontSize: "button.font-size.sm",
    fontWeight: "button.font-weight",
  },
  ...over,
});

describe("parseTextStyleDefinitions", () => {
  it("reads the styles list and drops entries without the required tokens", () => {
    const parsed = parseTextStyleDefinitions({
      description: "x",
      styles: [BUTTON, { name: "bad" }, null, { ...TOOLTIP, fontWeight: "" }],
    });
    expect(parsed?.map((d) => d.name)).toEqual(["button/sm", "tooltip"]);
    expect(parsed?.[1].fontWeight).toBeUndefined();
  });

  it("rejects a file with no styles list", () => {
    expect(parseTextStyleDefinitions({})).toBeNull();
    expect(parseTextStyleDefinitions(null)).toBeNull();
    expect(parseTextStyleDefinitions({ styles: "no" })).toBeNull();
  });
});

describe("fontStyleFromWeight", () => {
  it("maps weights to Manrope style names", () => {
    expect(
      [200, 300, 400, 500, 600, 700, 800, 900].map(fontStyleFromWeight)
    ).toEqual([
      "ExtraLight",
      "Light",
      "Regular",
      "Medium",
      "SemiBold",
      "Bold",
      "ExtraBold",
      "ExtraBold",
    ]);
  });
});

describe("planTextStyles", () => {
  it("plans every definition as a create in a file with no styles", () => {
    const plan = planTextStyles([BUTTON, CARD, TOOLTIP], [], TOKENS);
    expect(plan.status).toBe("found");
    expect(plan.creates.map((c) => c.name)).toEqual([
      "button/sm",
      "card/title",
      "tooltip",
    ]);
    expect(plan.updates).toEqual([]);
    expect(planWorkCount(plan)).toBe(3);
  });

  it("resolves alias chains and keeps percent exact (125 stays 125, -0.025em is -2.5)", () => {
    const plan = planTextStyles([BUTTON, CARD], [], TOKENS);
    const [button, card] = plan.creates;
    expect(button).toMatchObject({
      fontFamily: "Manrope",
      fontSize: 14,
      fontWeight: 500,
      lineHeight: { unit: "PERCENT", value: 125 },
      letterSpacing: 0,
    });
    expect(card.letterSpacing).toBe(-2.5);
    expect(card.lineHeight).toEqual({ unit: "AUTO" });
  });

  it("falls back to Regular, AUTO line height and 0% tracking when a part has none", () => {
    const [tooltip] = planTextStyles([TOOLTIP], [], TOKENS).creates;
    expect(tooltip).toMatchObject({
      fontWeight: 400,
      lineHeight: { unit: "AUTO" },
      letterSpacing: 0,
    });
    expect(tooltip.bindings.fontWeight).toBeUndefined();
  });

  it("binds family, size and weight to their tokens and links the percent tokens", () => {
    const [button] = planTextStyles([BUTTON], [], TOKENS).creates;
    expect(button.bindings).toEqual({
      fontFamily: "typography.font-family.sans",
      fontSize: "button.font-size.sm",
      fontWeight: "button.font-weight",
    });
    expect(button.links).toEqual({
      lineHeightToken: "button.line-height",
      letterSpacingToken: undefined,
    });
  });

  it("reports a definition whose token is missing and creates nothing for it", () => {
    const plan = planTextStyles(
      [{ ...BUTTON, lineHeight: "button.gone" }, TOOLTIP],
      [],
      TOKENS
    );
    expect(plan.problems).toEqual([
      { name: "button/sm", token: "button.gone", reason: "missing" },
    ]);
    expect(plan.creates.map((c) => c.name)).toEqual(["tooltip"]);
  });

  it("reports a token with no usable value as unsupported", () => {
    const plan = planTextStyles(
      [{ ...BUTTON, fontSize: "typography.font-family.sans" }],
      [],
      TOKENS
    );
    expect(plan.problems[0]).toMatchObject({ reason: "unsupported" });
  });

  it("leaves a managed style that matches alone", () => {
    const plan = planTextStyles([BUTTON], [managed()], TOKENS);
    expect(plan.unchanged).toBe(1);
    expect(plan.creates).toEqual([]);
    expect(plan.updates).toEqual([]);
    expect(planWorkCount(plan)).toBe(0);
  });

  it("updates a style when a line-height token changes, naming from and to", () => {
    const plan = planTextStyles(
      [BUTTON],
      [managed({ lineHeight: { unit: "PERCENT", value: 100 } })],
      TOKENS
    );
    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0].changes).toEqual(["line height 100% → 125%"]);
    expect(plan.updates[0].style.id).toBe("S:1");
  });

  it("notes a letter spacing change and an AUTO line height", () => {
    const plan = planTextStyles(
      [CARD],
      [
        managed({
          name: "card/title",
          lineHeight: { unit: "PERCENT", value: 120 },
          lineHeightToken: undefined,
          letterSpacingToken: "card.title.letter-spacing",
          bound: {
            fontFamily: "typography.font-family.sans",
            fontSize: "button.font-size.sm",
          },
        }),
      ],
      TOKENS
    );
    expect(plan.updates[0].changes).toEqual([
      "line height 120% → auto",
      "letter spacing 0% → -2.5%",
    ]);
  });

  it("updates a style whose binding is missing", () => {
    const plan = planTextStyles(
      [BUTTON],
      [managed({ bound: { fontFamily: "typography.font-family.sans" } })],
      TOKENS
    );
    expect(plan.updates[0].changes).toEqual([
      "font size binding",
      "font weight binding",
    ]);
  });

  it("adopts a style the builder linked (plan 205 keys, no marker)", () => {
    const plan = planTextStyles(
      [BUTTON],
      [managed({ managed: undefined, bound: undefined })],
      TOKENS
    );
    expect(plan.updates).toHaveLength(1);
    expect(plan.updates[0].changes).toContain("token links");
    expect(plan.collisions).toEqual([]);
  });

  it("leaves a designer's style with the same name alone and reports it", () => {
    const plan = planTextStyles(
      [BUTTON],
      [
        {
          id: "S:9",
          name: "button/sm",
          lineHeight: { unit: "AUTO" },
          letterSpacing: { unit: "PERCENT", value: 0 },
        },
      ],
      TOKENS
    );
    expect(plan.collisions).toEqual([{ id: "S:9", name: "button/sm" }]);
    expect(plan.creates).toEqual([]);
    expect(plan.updates).toEqual([]);
  });

  it("reports a managed style whose definition was removed and keeps it", () => {
    const plan = planTextStyles(
      [TOOLTIP],
      [managed({ id: "S:2", name: "old/style" })],
      TOKENS
    );
    expect(plan.removed).toEqual([{ id: "S:2", name: "old/style" }]);
    expect(planWork(plan).map((s) => s.name)).toEqual(["tooltip"]);
  });
});

describe("describePlanWork", () => {
  it("words creates and updates", () => {
    const plan = planTextStyles(
      [BUTTON, TOOLTIP],
      [managed({ lineHeight: { unit: "PERCENT", value: 100 } })],
      TOKENS
    );
    expect(describePlanWork(plan)).toBe(
      "1 text style will be created and 1 updated"
    );
    expect(describePlanWork(planTextStyles([TOOLTIP], [], TOKENS))).toBe(
      "1 text style will be created"
    );
  });
});

describe("applyTextStyleDefinitions", () => {
  interface Fake {
    id: string;
    name: string;
    type: "TEXT";
    fontName: { family: string; style: string };
    fontSize: number;
    lineHeight: unknown;
    letterSpacing: unknown;
    setBoundVariable: ReturnType<typeof vi.fn>;
    setSharedPluginData: ReturnType<typeof vi.fn>;
    shared: Record<string, string>;
  }
  const created: Fake[] = [];
  const existing: Record<string, Fake> = {};
  const loadFontAsync = vi.fn();

  const fake = (id: string): Fake => {
    const shared: Record<string, string> = {};
    return {
      id,
      name: "",
      type: "TEXT",
      fontName: { family: "Manrope", style: "Medium" },
      fontSize: 12,
      lineHeight: { unit: "AUTO" },
      letterSpacing: { unit: "PERCENT", value: 0 },
      setBoundVariable: vi.fn(),
      setSharedPluginData: vi.fn((ns: string, key: string, value: string) => {
        if (ns === "wylie_dog") shared[key] = value;
      }),
      shared,
    };
  };

  beforeEach(() => {
    created.length = 0;
    for (const key of Object.keys(existing)) delete existing[key];
    loadFontAsync.mockReset().mockResolvedValue(undefined);
    vi.stubGlobal("figma", {
      createTextStyle: () => {
        const style = fake(`S:new${created.length}`);
        created.push(style);
        return style;
      },
      getStyleByIdAsync: async (id: string) => existing[id] ?? null,
      loadFontAsync,
      variables: {
        getLocalVariablesAsync: async () => [
          { id: "V:1", name: "typography/font-family/sans" },
          { id: "V:2", name: "button/font-size/sm" },
          { id: "V:3", name: "button/font-weight" },
          { id: "V:4", name: "button/line-height" },
          { id: "V:5", name: "tooltip/font-size" },
        ],
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const work = (defs: TextStyleDefinition[], local: TextStyleInfo[] = []) =>
    planWork(planTextStyles(defs, local, TOKENS));

  it("uses the shared plugin data namespace Figma accepts", () => {
    expect(TEXT_STYLE_LINK_NAMESPACE).toMatch(/^[A-Za-z0-9_.]{3,}$/);
  });

  it("creates a style in an empty file: font, size, percent values, links", async () => {
    const result = await applyTextStyleDefinitions(work([BUTTON]));
    expect(result).toEqual({ created: 1, updated: 0, skipped: [] });
    const [s] = created;
    expect(loadFontAsync).toHaveBeenCalledWith({
      family: "Manrope",
      style: "Medium",
    });
    expect(s.name).toBe("button/sm");
    expect(s.fontName).toEqual({ family: "Manrope", style: "Medium" });
    expect(s.fontSize).toBe(14);
    expect(s.lineHeight).toEqual({ unit: "PERCENT", value: 125 });
    expect(s.letterSpacing).toEqual({ unit: "PERCENT", value: 0 });
    expect(s.shared).toEqual({
      lineHeightToken: "button.line-height",
      letterSpacingToken: "",
      definition: "text-styles",
    });
  });

  it("binds only family, size and weight, never line height or letter spacing", async () => {
    await applyTextStyleDefinitions(work([BUTTON, CARD]));
    const fields = created.flatMap((s) =>
      s.setBoundVariable.mock.calls.map((c: unknown[]) => c[0])
    );
    expect(new Set(fields)).toEqual(
      new Set(["fontFamily", "fontSize", "fontWeight"])
    );
    expect(created[0].setBoundVariable).toHaveBeenCalledWith(
      "fontSize",
      expect.objectContaining({ id: "V:2" })
    );
  });

  it("writes percent letter spacing for an em tracking token", async () => {
    await applyTextStyleDefinitions(work([CARD]));
    expect(created[0].letterSpacing).toEqual({ unit: "PERCENT", value: -2.5 });
    expect(created[0].lineHeight).toEqual({ unit: "AUTO" });
  });

  it("skips and reports a style whose font is unavailable, and still creates the rest", async () => {
    loadFontAsync.mockRejectedValueOnce(new Error("no font"));
    const result = await applyTextStyleDefinitions(work([BUTTON, TOOLTIP]));
    expect(result.created).toBe(1);
    expect(result.skipped).toEqual([
      { name: "button/sm", reason: "font", detail: "Manrope Medium" },
    ]);
    expect(created).toHaveLength(1);
    expect(created[0].name).toBe("tooltip");
  });

  it("updates only the percent values, bindings and links of an existing style", async () => {
    const style = fake("S:1");
    style.name = "button/sm";
    style.fontSize = 14;
    style.lineHeight = { unit: "PERCENT", value: 100 };
    existing["S:1"] = style;
    const result = await applyTextStyleDefinitions(
      work([BUTTON], [managed({ lineHeight: { unit: "PERCENT", value: 100 } })])
    );
    expect(result).toEqual({ created: 0, updated: 1, skipped: [] });
    expect(created).toHaveLength(0);
    expect(style.lineHeight).toEqual({ unit: "PERCENT", value: 125 });
    expect(style.fontSize).toBe(14);
    expect(style.name).toBe("button/sm");
  });

  it("reports a style that vanished before the update", async () => {
    const result = await applyTextStyleDefinitions(
      work([BUTTON], [managed({ lineHeight: { unit: "PERCENT", value: 100 } })])
    );
    expect(result.skipped).toEqual([
      { name: "button/sm", reason: "missing-style" },
    ]);
  });

  it("reports a variable that is not in the file but still creates the style", async () => {
    vi.stubGlobal("figma", {
      ...(globalThis as unknown as { figma: object }).figma,
      variables: {
        getLocalVariablesAsync: async () => [
          { id: "V:1", name: "typography/font-family/sans" },
        ],
      },
    });
    const result = await applyTextStyleDefinitions(work([TOOLTIP]));
    expect(result.created).toBe(1);
    expect(result.skipped).toEqual([
      {
        name: "tooltip",
        reason: "error",
        detail: "variable for tooltip.font-size not found",
      },
    ]);
  });

  it("does nothing for no work", async () => {
    expect(await applyTextStyleDefinitions([])).toEqual({
      created: 0,
      updated: 0,
      skipped: [],
    });
  });
});

describe("describeDefinitionResult", () => {
  it("words created, updated and skipped styles", () => {
    expect(
      describeDefinitionResult({
        created: 2,
        updated: 1,
        skipped: [{ name: "a", reason: "font", detail: "Manrope Bold" }],
      })
    ).toBe(
      "Created 2 text styles, updated 1 text style, skipped 1: a (font Manrope Bold unavailable)"
    );
    expect(
      describeDefinitionResult({ created: 0, updated: 0, skipped: [] })
    ).toBe("No text styles written");
  });
});
