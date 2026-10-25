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

describe("inferScopes: semantic colours", () => {
  const names = colorNames("semantic");

  it("covers the 41 semantic colour tokens", () => {
    expect(names).toHaveLength(41);
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

describe("inferScopes: component colours", () => {
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
    ["form.label", FOREGROUND],
    ["tabs.link-hover", FOREGROUND],
    ["alert.icon", FOREGROUND],
    ["input.border", STROKE],
    ["checkbox.checked.border", STROKE],
    ["input.border-focus", STROKE],
    ["slider.thumb-border", STROKE],
    ["select.border-color", STROKE],
    ["button.ring", STROKE],
    ["card.header.title.text", FOREGROUND],
  ])("%s", (name, expected) => {
    expect(inferScopes("color", name)).toEqual(expected);
  });

  it.each([
    ["select.trigger-focus"],
    ["checkbox.checked"],
    ["calendar.day-hover"],
    ["button.ring-offset"],
    ["unknown"],
    ["separator.color"],
    ["checkbox.border.color"],
    ["tabs.trigger.indicator.color"],
  ])("keeps ALL_SCOPES for the ambiguous name %s", (name) => {
    expect(inferScopes("color", name)).toEqual(ALL);
  });

  it("gives every component colour token a valid scope set", () => {
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
  it("hides primitive colours from every picker", () => {
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

  it("does not name-match non-colour tokens as colours", () => {
    expect(inferScopes("number", "color.background.default")).toEqual(ALL);
  });

  it("returns a fresh array so callers cannot mutate the shared map", () => {
    const first = inferScopes("fontSize", "a");
    first.push("MUTATED");
    expect(inferScopes("fontSize", "a")).toEqual(["FONT_SIZE"]);
  });
});

describe("inferScopes: non-colour tokens by name", () => {
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
    ["number", "opacity.50", ["OPACITY"]],
    ["number", "opacity.scrim", ["OPACITY"]],
    ["number", "state.opacity.disabled", ["OPACITY"]],
    ["number", "z-index.modal", []],
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

  it("keeps the focus colours scoped to stroke and effect", () => {
    expect(inferScopes("color", "color.focus.ring")).toEqual(FOCUS);
  });

  it("keeps an offset that is not the focus indicator on GAP", () => {
    expect(inferScopes("dimension", "sheet.close-button-offset")).toEqual([
      "GAP",
    ]);
  });
});

// Components colours whose name has no property word. They stay ALL_SCOPES
// until they are renamed (Plan 201); anything else on ALL_SCOPES is a bug.
const AMBIGUOUS_COMPONENT_COLOURS = [
  "card.header.title.color",
  "card.header.description.color",
  "menubar.trigger-open",
  "menubar.separator",
  "menubar.shortcut",
  "navigation.active",
  "navigation.open",
  "command.empty",
  "command.group-heading",
  "command.separator",
  "command.item-selected",
  "command.shortcut",
  "tabs.list.border.color",
  "calendar.nav-hover",
  "calendar.day-hover",
  "calendar.day-selected",
  "accordion.trigger-hover",
  "accordion.trigger-pressed",
  "accordion.trigger-disabled",
  "breadcrumb.current",
  "carousel.nav-hover",
  "contextmenu.item-hover",
  "contextmenu.separator",
  "contextmenu.shortcut",
  "dialog.description",
  "dialog.title",
  "form.description",
  "form.error",
  "pagination.active",
  "resizable.handle",
  "slider.range",
  "table.caption",
  "table.row-hover",
  "table.row-selected",
  "toast.action-hover",
  "toast.close",
  "toast.close-hover",
  "toggle.pressed",
  "card.content.color",
  "checkbox.border.color",
  "separator.color",
  "form.required-color",
  "section-hero.gradient.from",
  "section-hero.gradient.via",
  "section-hero.gradient.to",
  "toggle.pressed-disabled",
  "menubar.trigger-highlighted",
  "menubar.item-highlighted",
  "navigation.highlighted",
];

describe("inferScopes: the real token files", () => {
  const variables = allVariables().map((v) => ({
    ...v,
    scopes: inferScopes(v.type, v.name),
  }));
  const key = (scopes: string[]) => (scopes.length ? scopes.join("+") : "[]");

  it("reads all three collections (276, 978 and 91 variables)", () => {
    const count = (c: string) =>
      variables.filter((v) => v.collection === c).length;
    expect([
      count("primitive"),
      count("components"),
      count("semantic"),
    ]).toEqual([276, 978, 91]);
  });

  it("leaves ALL_SCOPES only on the named ambiguous component colours", () => {
    const unrestricted = variables
      .filter((v) => v.scopes.includes("ALL_SCOPES"))
      .map((v) => `${v.collection}:${v.type}:${v.name}`)
      .sort();
    expect(unrestricted).toEqual(
      AMBIGUOUS_COMPONENT_COLOURS.map((n) => `components:color:${n}`).sort()
    );
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
    expectFamily(/opacity/, ["OPACITY"]);
    expectFamily(/^shadow\.(blur|offset|spread)/, ["EFFECT_FLOAT"]);
    // Hidden: percentages Figma would bind as pixels, and CSS-only values
    expectFamily(/line-height/, []);
    expectFamily(/tracking|letter-spacing/, []);
    expectFamily(/z-index/, []);
    expectFamily(/^focus\./, []);
  });

  it("hides every duration, easing and shadow string and every primitive colour", () => {
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
    // A non-colour variable with a dimension-style fallback (GAP) must be a
    // spacing token; anything else needs an explicit rule.
    const gapFallback = variables
      .filter((v) => v.type === "dimension" && key(v.scopes) === "GAP")
      .map((v) => v.name);
    expect(gapFallback).toEqual(["sheet.close-button-offset"]);
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
      "number OPACITY": 15,
      "number []": 18,
      "dimension EFFECT_FLOAT": 23,
      "dimension []": 6,
      "duration []": 9,
    });
    expect(all.semantic).toMatchObject({
      "number OPACITY": 12,
      "number []": 9,
      "shadow []": 7,
      "duration []": 4,
      "cubicBezier []": 4,
      "dimension []": 3,
    });
    expect(all.components).toMatchObject({
      "number FONT_SIZE": 78,
      "number FONT_WEIGHT": 40,
      "number OPACITY": 17,
      "number []": 35,
      "dimension []": 9,
      "shadow []": 19,
      "duration []": 11,
      "color ALL_SCOPES": 49,
    });
  });
});
