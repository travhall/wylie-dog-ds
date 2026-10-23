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

const FILL = ["FRAME_FILL", "SHAPE_FILL"];
const FOREGROUND = ["TEXT_FILL", "SHAPE_FILL"];
const STROKE = ["STROKE_COLOR"];
const FOCUS = ["STROKE_COLOR", "EFFECT_COLOR"];
const ALL = ["ALL_SCOPES"];

describe("inferScopes: semantic colours", () => {
  const names = colorNames("semantic");

  it("covers the 40 semantic colour tokens", () => {
    expect(names).toHaveLength(40);
  });

  // The grammar is color.<background|foreground|border>.<token>. A new group
  // or a renamed one fails here instead of silently keeping ALL_SCOPES.
  it.each(names)("%s follows the grammar and is restricted", (name) => {
    expect(name).toMatch(/^color\.(background|foreground|border)\.[a-z-]+$/);
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

  it.each(
    names.filter(
      (n) => n.startsWith("color.border.") && n !== "color.border.focus"
    )
  )("%s is a stroke", (name) => {
    expect(inferScopes("color", name)).toEqual(STROKE);
  });

  it("lets the focus border be a stroke or an effect", () => {
    expect(inferScopes("color", "color.border.focus")).toEqual(FOCUS);
  });

  it("treats the Figma slash form like the dotted form", () => {
    expect(inferScopes("color", "color/background/primary-muted")).toEqual(
      FILL
    );
    expect(inferScopes("color", "color/border/focus")).toEqual(FOCUS);
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
  it("leaves primitive colours on ALL_SCOPES", () => {
    const names = colorNames("primitive");
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(inferScopes("color", name)).toEqual(ALL);
    }
  });

  it.each([
    ["fontSize", "font.size.base", ["FONT_SIZE"]],
    ["fontWeight", "font.weight.bold", ["FONT_WEIGHT"]],
    ["fontFamily", "font.family.sans", ["FONT_FAMILY"]],
    ["lineHeight", "line.height.tight", ["LINE_HEIGHT"]],
    ["letterSpacing", "letter.spacing.wide", ["LETTER_SPACING"]],
    ["spacing", "spacing.4", ["GAP", "WIDTH_HEIGHT"]],
    ["sizing", "sizing.4", ["WIDTH_HEIGHT"]],
    ["borderRadius", "radius.md", ["CORNER_RADIUS"]],
    ["borderWidth", "border.width.1", ["STROKE_FLOAT"]],
    ["dimension", "radius.md", ["CORNER_RADIUS"]],
    ["dimension", "border-width.1", ["STROKE_FLOAT"]],
    ["dimension", "button.height", ["WIDTH_HEIGHT"]],
    ["dimension", "spacing.4", ["GAP"]],
    ["dimension", "anything", ["GAP"]],
    ["shadow", "shadow.md", ALL],
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
