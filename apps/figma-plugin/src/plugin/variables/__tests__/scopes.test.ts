import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { inferScopes } from "../scopes";

// vitest runs from the package root (apps/figma-plugin)
const SYNC_DIR = resolve(process.cwd(), "../../packages/tokens/io/sync");

type SyncToken = { $type: string };

function colorNames(collection: string): string[] {
  const data = JSON.parse(
    readFileSync(resolve(SYNC_DIR, `${collection}.json`), "utf8")
  ) as Array<Record<string, { variables: Record<string, SyncToken> }>>;
  return Object.entries(data[0][collection].variables)
    .filter(([, token]) => token.$type === "color")
    .map(([name]) => name);
}

const COLLECTIONS = ["primitive", "semantic", "components"] as const;

function allVariables(): Array<{
  collection: string;
  name: string;
  type: string;
}> {
  return COLLECTIONS.flatMap((collection) => {
    const data = JSON.parse(
      readFileSync(resolve(SYNC_DIR, `${collection}.json`), "utf8")
    ) as Array<Record<string, { variables: Record<string, SyncToken> }>>;
    return Object.entries(data[0][collection].variables).map(
      ([name, token]) => ({ collection, name, type: token.$type })
    );
  });
}

const FILL = ["FRAME_FILL", "SHAPE_FILL"];
const FOREGROUND = ["TEXT_FILL", "SHAPE_FILL"];
const STROKE = ["STROKE_COLOR"];
const FOCUS = ["STROKE_COLOR", "EFFECT_COLOR"];
const ALL = ["ALL_SCOPES"];

describe("inferScopes: semantic colors", () => {
  const names = colorNames("semantic");

  it("covers the 58 semantic color tokens", () => {
    expect(names).toHaveLength(58);
  });

  // The grammar is color.<background|foreground|border|focus>.<token>. A new group
  // or a renamed one fails here instead of silently keeping ALL_SCOPES.
  it.each(names)("%s follows the grammar and is restricted", (name) => {
    expect(name).toMatch(
      /^color\.(background|foreground|border|focus)\.[a-z-]+$/
    );
    expect(inferScopes("color", name)).not.toEqual(ALL);
  });

  it.each(names.filter((n) => n.startsWith("color.background.")))(
    "%s is a fill",
    (name) => {
      expect(inferScopes("color", name)).toEqual(FILL);
    }
  );

  it.each(names.filter((n) => n.startsWith("color.foreground.")))(
    "%s is a text and shape fill",
    (name) => {
      expect(inferScopes("color", name)).toEqual(FOREGROUND);
    }
  );

  it.each(names.filter((n) => n.startsWith("color.border.")))(
    "%s is a stroke",
    (name) => {
      expect(inferScopes("color", name)).toEqual(STROKE);
    }
  );

  it("lets the focus ring and halo be a stroke or an effect", () => {
    expect(inferScopes("color", "color.focus.ring")).toEqual(FOCUS);
    expect(inferScopes("color", "color.focus.halo")).toEqual(FOCUS);
  });

  it("treats the Figma slash form like the dotted form", () => {
    expect(inferScopes("color", "color/background/primary-muted")).toEqual(
      FILL
    );
    expect(inferScopes("color", "color/focus/ring")).toEqual(FOCUS);
  });
});

describe("inferScopes: component colors", () => {
  it.each([
    ["button.primary.background", FILL],
    ["card.background-hover", FILL],
    ["switch.track", FILL],
    ["switch.thumb", FILL],
    ["progress.indicator", FILL],
    ["dialog.overlay", FILL],
    ["badge.success-fill", FILL],
    ["button.primary.text", FOREGROUND],
    ["dropdown-menu.item.text-hover", FOREGROUND],
    ["input.placeholder", FOREGROUND],
    ["tabs.link-hover", FOREGROUND],
    ["alert.icon", FOREGROUND],
    ["input.border", STROKE],
    ["checkbox.checked.border", STROKE],
    ["input.border-focus", STROKE],
    ["slider.thumb-border", STROKE],
    ["select.border-color", STROKE],
    ["button.ring", STROKE],
    ["card.header.title.text", FOREGROUND],
    // No property word: the part or state word decides (Plan 217)
    ["card.header.title.color", FOREGROUND],
    ["card.content.color", FOREGROUND],
    ["dialog.title", FOREGROUND],
    ["command.shortcut", FOREGROUND],
    ["toast.close-hover", FOREGROUND],
    ["calendar.day-hover", FILL],
    ["menubar.trigger-open", FILL],
    ["toggle.pressed-disabled", FILL],
    ["slider.range", FILL],
    ["separator.color", FILL],
    ["resizable.handle", FILL],
    ["section-hero.gradient.from", FILL],
    ["checkbox.border.color", STROKE],
    ["tabs.list.border.color", STROKE],
    // A property word beats a state word, wherever it sits
    ["label.disabled-color", FOREGROUND],
    ["dropdown-menu.item.text-hover", FOREGROUND],
    ["input.border-disabled", STROKE],
  ])("%s", (name, expected) => {
    expect(inferScopes("color", name)).toEqual(expected);
  });

  it.each([
    ["select.trigger-focus"],
    ["checkbox.checked"],
    ["button.ring-offset"],
    ["unknown"],
    ["tabs.trigger.indicator.color"],
  ])("keeps ALL_SCOPES for the ambiguous name %s", (name) => {
    expect(inferScopes("color", name)).toEqual(ALL);
  });

  it("gives every component color token a valid scope set", () => {
    const valid = new Set([
      ...FILL,
      ...FOREGROUND,
      ...STROKE,
      ...FOCUS,
      ...ALL,
    ]);
    for (const name of colorNames("components")) {
      const scopes = inferScopes("color", name);
      expect(scopes.length).toBeGreaterThan(0);
      scopes.forEach((scope) => expect(valid.has(scope)).toBe(true));
    }
  });
});

describe("inferScopes: primitives and other types", () => {
  it("hides primitive colors from every picker", () => {
    const names = colorNames("primitive");
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(inferScopes("color", name)).toEqual([]);
    }
  });

  it.each([
    ["fontSize", "font.size.base", ["FONT_SIZE"]],
    ["fontWeight", "font.weight.bold", ["FONT_WEIGHT"]],
    ["fontFamily", "font.family.sans", ["FONT_FAMILY"]],
    ["lineHeight", "line.height.tight", []],
    ["letterSpacing", "letter.spacing.wide", []],
    ["spacing", "spacing.4", ["GAP", "WIDTH_HEIGHT"]],
    ["sizing", "sizing.4", ["WIDTH_HEIGHT"]],
    ["borderRadius", "radius.md", ["CORNER_RADIUS"]],
    ["borderWidth", "border.width.1", ["STROKE_FLOAT"]],
    ["dimension", "radius.md", ["CORNER_RADIUS"]],
    ["dimension", "border-width.1", ["STROKE_FLOAT"]],
    ["dimension", "button.height", ["WIDTH_HEIGHT"]],
    ["dimension", "spacing.4", ["GAP"]],
    ["dimension", "anything", ["GAP"]],
    ["shadow", "shadow.md", []],
    ["duration", "duration.150", []],
    ["cubicBezier", "transition.easing.default", []],
    ["boolean", "flag", ALL],
    ["number", "n", ALL],
    ["string", "s", ALL],
    ["font", "f", ["FONT_FAMILY"]],
    ["size", "z", ["FONT_SIZE"]],
    ["somethingNew", "x", ALL],
  ])("%s %s", (type, name, expected) => {
    expect(inferScopes(type, name)).toEqual(expected);
  });

  it("does not name-match non-color tokens as colors", () => {
    expect(inferScopes("number", "color.background.default")).toEqual(ALL);
  });

  it("returns a fresh array so callers cannot mutate the shared map", () => {
    const first = inferScopes("fontSize", "a");
    first.push("MUTATED");
    expect(inferScopes("fontSize", "a")).toEqual(["FONT_SIZE"]);
  });
});

describe("inferScopes: non-color tokens by name", () => {
  it.each([
    ["icon.stroke-width.sm", ["STROKE_FLOAT"]],
    ["icon.stroke-width.md", ["STROKE_FLOAT"]],
    ["icon.stroke-width.lg", ["STROKE_FLOAT"]],
    ["checkbox.icon-stroke-width.sm", ["STROKE_FLOAT"]],
    ["checkbox.icon-stroke-width.md", ["STROKE_FLOAT"]],
    ["checkbox.icon-stroke-width.lg", ["STROKE_FLOAT"]],
    ["card.border-width", ["STROKE_FLOAT"]],
    ["resizable.handle-hit-size", ["WIDTH_HEIGHT"]],
  ])("%s", (name, expected) => {
    expect(inferScopes("dimension", name)).toEqual(expected);
  });

  // Font size, weight, line height, opacity and z-index are typed "number" on
  // purpose, so the name decides.
  it.each([
    ["number", "typography.font-size.base", ["FONT_SIZE"]],
    ["number", "button.font-size", ["FONT_SIZE"]],
    ["number", "typography.font-weight.bold", ["FONT_WEIGHT"]],
    ["number", "dialog.title-font-weight", ["FONT_WEIGHT"]],
    ["number", "typography.line-height.tight", []],
    ["number", "dialog.title-line-height", []],
    ["lineHeight", "typography.line-height.tight", []],
    ["dimension", "typography.tracking.wide", []],
    ["dimension", "dialog.title-letter-spacing", []],
    // hidden: a bound opacity is read as a percent, 0.5 would draw at 0.5%
    ["number", "opacity.50", []],
    ["number", "opacity.90", []],
    ["number", "dialog.overlay-opacity", []],
    ["number", "layer.modal", []],
    ["number", "layer.modal-backdrop", []],
    ["number", "z-index.50", []],
    ["dimension", "focus.width", []],
    ["dimension", "focus.offset", []],
    ["dimension", "focus.halo-width", []],
    ["dimension", "shadow.blur.md", ["EFFECT_FLOAT"]],
    ["dimension", "shadow.offset.y.md", ["EFFECT_FLOAT"]],
    ["dimension", "shadow.spread.lg", ["EFFECT_FLOAT"]],
    ["shadow", "shadow.md", []],
    ["duration", "transition.duration.fast", []],
    ["cubicBezier", "transition.easing.default", []],
    ["number", "button.border-width", ["STROKE_FLOAT"]],
  ])("%s %s", (type, name, expected) => {
    expect(inferScopes(type, name)).toEqual(expected);
  });

  it("keeps the focus colors scoped to stroke and effect", () => {
    expect(inferScopes("color", "color.focus.ring")).toEqual(FOCUS);
  });

  it("keeps an offset that is not the focus indicator on GAP", () => {
    expect(inferScopes("dimension", "sheet.close-button-offset")).toEqual([
      "GAP",
    ]);
  });
});

// Every component color that had no property word before Plan 217, with the
// scopes it now gets (owner decision D1: none stays on ALL_SCOPES). Text is
// the part that carries the color, a fill covers states, separators and
// gradient stops, a border is a stroke.
const FORMER_AMBIGUOUS_COMPONENT_COLORS: Record<string, string[]> = {
  "card.header.title.color": FOREGROUND,
  "card.header.description.color": FOREGROUND,
  "card.content.color": FOREGROUND,
  "menubar.shortcut": FOREGROUND,
  "command.empty": FOREGROUND,
  "command.group-heading": FOREGROUND,
  "command.shortcut": FOREGROUND,
  "breadcrumb.current": FOREGROUND,
  "contextmenu.shortcut": FOREGROUND,
  "dialog.description": FOREGROUND,
  "dialog.title": FOREGROUND,
  "form.description": FOREGROUND,
  "form.error": FOREGROUND,
  "table.caption": FOREGROUND,
  "toast.close": FOREGROUND,
  "toast.close-hover": FOREGROUND,
  "menubar.trigger-open": FILL,
  "menubar.trigger-highlighted": FILL,
  "menubar.item-highlighted": FILL,
  "navigation.active": FILL,
  "navigation.open": FILL,
  "navigation.highlighted": FILL,
  "command.item-selected": FILL,
  "calendar.nav-hover": FILL,
  "calendar.day-hover": FILL,
  "calendar.day-selected": FILL,
  "accordion.trigger-hover": FILL,
  "accordion.trigger-pressed": FILL,
  "carousel.nav-hover": FILL,
  "contextmenu.item-hover": FILL,
  "pagination.active": FILL,
  "slider.range": FILL,
  "table.row-hover": FILL,
  "table.row-selected": FILL,
  "toast.action-hover": FILL,
  "toggle.pressed": FILL,
  "menubar.separator": FILL,
  "command.separator": FILL,
  "contextmenu.separator": FILL,
  "separator.color": FILL,
  "resizable.handle": FILL,
  "section-hero.gradient.from": FILL,
  "section-hero.gradient.via": FILL,
  "section-hero.gradient.to": FILL,
  "tabs.list.border.color": STROKE,
  "checkbox.border.color": STROKE,
};

describe("inferScopes: the real token files", () => {
  const variables = allVariables().map((v) => ({
    ...v,
    scopes: inferScopes(v.type, v.name),
  }));
  const key = (scopes: string[]) => (scopes.length ? scopes.join("+") : "[]");

  it("reads all three collections (286, 1123 and 102 variables)", () => {
    const count = (c: string) =>
      variables.filter((v) => v.collection === c).length;
    expect([
      count("primitive"),
      count("components"),
      count("semantic"),
    ]).toEqual([286, 1123, 102]);
  });

  it("leaves no variable on ALL_SCOPES", () => {
    const unrestricted = variables
      .filter((v) => v.scopes.includes("ALL_SCOPES"))
      .map((v) => `${v.collection}:${v.type}:${v.name}`);
    expect(unrestricted).toEqual([]);
  });

  it("gives every color token a scope", () => {
    const colors = variables.filter((v) => v.type === "color");
    expect(colors.length).toBeGreaterThan(0);
    for (const v of colors) {
      if (v.collection === "primitive") continue;
      expect(v.scopes.length, `${v.collection}:${v.name}`).toBeGreaterThan(0);
      expect(v.scopes, `${v.collection}:${v.name}`).not.toContain("ALL_SCOPES");
    }
  });

  it("scopes the 46 former ALL_SCOPES component colors by what they paint", () => {
    expect(Object.keys(FORMER_AMBIGUOUS_COMPONENT_COLORS)).toHaveLength(46);
    const components = new Map(
      variables
        .filter((v) => v.collection === "components")
        .map((v) => [v.name, v.scopes])
    );
    for (const [name, expected] of Object.entries(
      FORMER_AMBIGUOUS_COMPONENT_COLORS
    )) {
      expect(components.get(name), name).toEqual(expected);
    }
  });

  it("never combines ALL_SCOPES with another scope", () => {
    for (const v of variables) {
      if (v.scopes.includes("ALL_SCOPES")) expect(v.scopes).toEqual(ALL);
    }
  });

  it("scopes every property family to its own picker", () => {
    const expectFamily = (word: RegExp, expected: string[]) => {
      const matches = variables.filter((v) => word.test(v.name));
      expect(matches.length, String(word)).toBeGreaterThan(0);
      for (const v of matches) {
        expect(v.scopes, `${v.collection}:${v.name}`).toEqual(expected);
      }
    };
    expectFamily(/font-size/, ["FONT_SIZE"]);
    expectFamily(/font-weight/, ["FONT_WEIGHT"]);

    expectFamily(/^shadow\.(blur|offset|spread)/, ["EFFECT_FLOAT"]);
    // Hidden: percentages Figma would bind as pixels, and CSS-only values
    expectFamily(/line-height/, []);
    expectFamily(/tracking|letter-spacing/, []);
    expectFamily(/z-index/, []);
    expectFamily(/^layer\./, []);
    expectFamily(/opacity/, []);
    expectFamily(/^focus\./, []);
  });

  it("hides every duration, easing and shadow string and every primitive color", () => {
    const hiddenTypes = new Set(["duration", "cubicBezier", "shadow"]);
    const hidden = variables.filter(
      (v) =>
        hiddenTypes.has(v.type) ||
        (v.collection === "primitive" && v.type === "color")
    );
    expect(hidden.length).toBeGreaterThan(0);
    for (const v of hidden) expect(v.scopes, v.name).toEqual([]);
  });

  it("never scopes a number to a picker its value cannot feed", () => {
    // Percent line heights and em tracking would bind as pixels
    for (const scope of ["LINE_HEIGHT", "LETTER_SPACING"]) {
      expect(
        variables.some((v) => v.scopes.includes(scope)),
        scope
      ).toBe(false);
    }
    // Tracking and shadow values must not appear in gap or padding pickers
    const gap = variables.filter((v) => v.scopes.includes("GAP"));
    for (const v of gap) {
      expect(v.name).not.toMatch(/tracking|letter-spacing|shadow\./);
    }
  });

  it("fails on a token family no rule matches", () => {
    // A non-color variable with a dimension-style fallback (GAP) must be a
    // spacing token; anything else needs an explicit rule.
    const gapFallback = variables
      .filter((v) => v.type === "dimension" && key(v.scopes) === "GAP")
      .map((v) => v.name);
    expect([...gapFallback].sort()).toEqual([
      "alert.icon-gap",
      "badge.icon-gap",
      "button.icon-gap",
      "button.link-underline-offset",
      "card-grid.item-hover-lift",
      "dropdown-menu.side-offset",
      "hover-card.side-offset",
      "menubar.content-align-offset",
      "menubar.content-side-offset",
      "navigation-menu.trigger.icon-offset-top",
      "popover.side-offset",
      "select.content.side-offset",
      "sheet.close-button-offset",
      "tabs.trigger.overlap",
      "toggle.icon-gap",
      "tooltip.side-offset",
    ]);
  });

  it("matches the per-collection tally", () => {
    const tally = (collection: string) => {
      const counts: Record<string, number> = {};
      for (const v of variables.filter((x) => x.collection === collection)) {
        const k = `${v.type} ${key(v.scopes)}`;
        counts[k] = (counts[k] ?? 0) + 1;
      }
      return counts;
    };
    // Printed so a failure (or -t run) shows the full table
    const all = Object.fromEntries(COLLECTIONS.map((c) => [c, tally(c)]));
    console.info(JSON.stringify(all, null, 2));
    expect(all.primitive).toMatchObject({
      "color []": 143,
      "number FONT_SIZE": 10,
      "number FONT_WEIGHT": 8,
      "number []": 36,
      "dimension EFFECT_FLOAT": 23,
      "dimension []": 6,
      "duration []": 12,
      "cubicBezier []": 4,
    });
    expect(all.semantic).toMatchObject({
      "number []": 13,
      "shadow []": 7,
      "duration []": 6,
      "cubicBezier []": 5,
      "dimension []": 4,
    });
    expect(all.components["color ALL_SCOPES"]).toBeUndefined();
    expect(all.components).toMatchObject({
      "number FONT_SIZE": 83,
      "number FONT_WEIGHT": 39,
      "fontFamily FONT_FAMILY": 1,
      "number []": 134,
      "dimension []": 16,
      "shadow []": 19,
      "duration []": 25,
      "cubicBezier []": 17,
    });
  });
});
