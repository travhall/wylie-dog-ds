/**
 * Text styles created and kept by Token Bridge from a definitions file
 * (plan 206).
 *
 * Plan 205 only updates styles that already carry token links, and only the
 * one-time component builder made styles. Token Bridge is the product, so it
 * creates the styles itself: the repo holds `text-styles.json` (generated from
 * the component tokens, see scripts/text-styles.mjs), Pull reads it, resolves
 * each definition's tokens from the tokens being pulled, and creates or updates
 * one Figma text style per definition. Nothing depends on the builder or on
 * what the Figma file already contains.
 *
 * Owner decisions (2026-10-25, plan 206):
 *  1. Granularity: one style per definition, generated per component part.
 *     The Sync tab only chooses the kind (Text styles), never the granularity.
 *  2. The file is `<tokenPath>/../styles/text-styles.json` on the branch being
 *     pulled (for `packages/tokens/io/sync`, `packages/tokens/io/styles/`). It is
 *     outside the sync folder, so Push never writes it and the baseline hashes
 *     never see it.
 *  3. "Text styles" is a Pull-only checkbox in a Styles section on the Sync
 *     tab. With no definitions file on the branch Pull still works and the
 *     review says so; nothing fails.
 *  4. A style with a definition's name but no token link and no marker is a
 *     designer's own: it is skipped and reported, never modified. A style the
 *     builder linked (plan 205 keys) is Token Bridge's already and is adopted.
 *  5. A managed style whose definition was removed is reported and kept.
 *
 * What a style gets: font family, font size and font weight are BOUND to the
 * Figma variables (they follow the variables, so only the binding is checked
 * and written); line height and letter spacing are PERCENT values written from
 * the tokens, because variables cannot carry a percent (plan 204). No variable
 * is ever bound to line height or letter spacing. A part with no weight token
 * gets Regular, with no line height AUTO, with no tracking 0%.
 *
 * Links: shared plugin data, namespace `wylie_dog` (letters, digits, underscore
 * and dot only; a hyphen throws), keys `lineHeightToken`, `letterSpacingToken`
 * (plan 205) and `definition` (the marker).
 *
 * The planning is pure (no `figma`); only `applyTextStyleDefinitions` touches
 * the file.
 */
import type { ExportData } from "./processor";
import { createTokenName } from "./processor";
import {
  DEFINITION_LINK_KEY,
  DEFINITION_LINK_VALUE,
  LETTER_SPACING_LINK_KEY,
  LINE_HEIGHT_LINK_KEY,
  TEXT_STYLE_LINK_NAMESPACE,
  findToken,
  formatSpacing,
  letterSpacingPercent,
  lineHeightPercent,
  resolveTokenNumber,
  sameSpacing,
} from "./text-style-links";
import type {
  SpacingValue,
  TextStyleInfo,
  TextStyleSkip,
} from "./text-style-links";

/** One entry of text-styles.json: token paths, never values. */
export interface TextStyleDefinition {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

const stringOrUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value : undefined;

/** The definitions in a parsed file, or null when the file is not one. */
export function parseTextStyleDefinitions(
  raw: unknown
): TextStyleDefinition[] | null {
  const styles = (raw as { styles?: unknown } | null)?.styles;
  if (!Array.isArray(styles)) return null;
  const result: TextStyleDefinition[] = [];
  for (const entry of styles) {
    const item = (entry ?? {}) as Record<string, unknown>;
    const name = stringOrUndefined(item.name);
    const fontFamily = stringOrUndefined(item.fontFamily);
    const fontSize = stringOrUndefined(item.fontSize);
    if (!name || !fontFamily || !fontSize) continue;
    result.push({
      name,
      fontFamily,
      fontSize,
      fontWeight: stringOrUndefined(item.fontWeight),
      lineHeight: stringOrUndefined(item.lineHeight),
      letterSpacing: stringOrUndefined(item.letterSpacing),
    });
  }
  return result;
}

/** A definition resolved against the incoming tokens: what Figma gets. */
export interface ResolvedTextStyle {
  /** Set for an update (the local style's id); absent for a create. */
  id?: string;
  name: string;
  fontFamily: string;
  fontWeight: number;
  fontSize: number;
  /** AUTO, or PERCENT: the token's percent (125 gives 125%). */
  lineHeight: SpacingValue;
  /** Percent: em times 100 (-0.025em gives -2.5). */
  letterSpacing: number;
  /** Token paths whose variables the family, size and weight bind to. */
  bindings: { fontFamily: string; fontSize: string; fontWeight?: string };
  /** Token paths recorded as links, read back by the plan 205 flow. */
  links: { lineHeightToken?: string; letterSpacingToken?: string };
}

export interface TextStyleUpdate {
  style: ResolvedTextStyle;
  /** Human notes: "line height 100% → 125%", "font size binding". */
  changes: string[];
}

export interface DefinitionProblem {
  name: string;
  token: string;
  reason: "missing" | "unsupported";
}

export interface TextStylePlan {
  /**
   * `off`: the option is not ticked. `absent`: ticked, but the branch has no
   * definitions file. `found`: the plan below is real.
   */
  status: "off" | "absent" | "found";
  creates: ResolvedTextStyle[];
  updates: TextStyleUpdate[];
  /** Definitions whose style already matches. */
  unchanged: number;
  /** Same name as a designer's own style (no link, no marker): left alone. */
  collisions: Array<{ id: string; name: string }>;
  /** Definitions skipped because a token they name is missing or unusable. */
  problems: DefinitionProblem[];
  /** Managed styles whose definition is gone: reported, kept. */
  removed: Array<{ id: string; name: string }>;
}

export const EMPTY_TEXT_STYLE_PLAN: TextStylePlan = {
  status: "off",
  creates: [],
  updates: [],
  unchanged: 0,
  collisions: [],
  problems: [],
  removed: [],
};

/** Figma font style names for a numeric weight (Manrope's naming). */
export function fontStyleFromWeight(weight: number): string {
  if (weight >= 800) return "ExtraBold";
  if (weight >= 700) return "Bold";
  if (weight >= 600) return "SemiBold";
  if (weight >= 500) return "Medium";
  if (weight >= 400) return "Regular";
  if (weight >= 300) return "Light";
  return "ExtraLight";
}

const MAX_ALIAS_DEPTH = 10;

/** A token's string after following aliases, or undefined when broken. */
function resolveTokenString(
  path: string,
  tokens: ExportData[],
  depth = 0
): string | undefined {
  if (depth > MAX_ALIAS_DEPTH) return undefined;
  const raw: unknown = findToken(path, tokens)?.$value;
  if (typeof raw !== "string") return undefined;
  const alias = /^\{([^{}]+)\}$/.exec(raw.trim());
  if (alias) return resolveTokenString(alias[1], tokens, depth + 1);
  // "Manrope, sans-serif" or '"Manrope"': the first family, unquoted.
  const first = raw
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
  return first || undefined;
}

const noteSpacing = (label: string, from: SpacingValue, to: string) =>
  `${label} ${formatSpacing(from)} → ${to}`;

/** Resolve one definition; a problem names the first token that fails. */
function resolveDefinition(
  def: TextStyleDefinition,
  tokens: ExportData[]
): ResolvedTextStyle | DefinitionProblem {
  const problem = (token: string, missing: boolean): DefinitionProblem => ({
    name: def.name,
    token,
    reason: missing ? "missing" : "unsupported",
  });

  const family = resolveTokenString(def.fontFamily, tokens);
  if (!family)
    return problem(def.fontFamily, !findToken(def.fontFamily, tokens));

  const size = resolveTokenNumber(def.fontSize, tokens);
  if (!size.ok) return problem(def.fontSize, size.reason === "missing");

  let weight = 400;
  if (def.fontWeight) {
    const resolved = resolveTokenNumber(def.fontWeight, tokens);
    if (!resolved.ok) {
      return problem(def.fontWeight, resolved.reason === "missing");
    }
    weight = resolved.value;
  }

  let lineHeight: SpacingValue = { unit: "AUTO" };
  if (def.lineHeight) {
    const resolved = resolveTokenNumber(def.lineHeight, tokens);
    const percent = lineHeightPercent(resolved);
    if (percent === null) {
      return problem(
        def.lineHeight,
        !resolved.ok && resolved.reason === "missing"
      );
    }
    lineHeight = { unit: "PERCENT", value: percent };
  }

  let letterSpacing = 0;
  if (def.letterSpacing) {
    const resolved = resolveTokenNumber(def.letterSpacing, tokens);
    const percent = letterSpacingPercent(resolved);
    if (percent === null) {
      return problem(
        def.letterSpacing,
        !resolved.ok && resolved.reason === "missing"
      );
    }
    letterSpacing = percent;
  }

  return {
    name: def.name,
    fontFamily: family,
    fontWeight: weight,
    fontSize: size.value,
    lineHeight,
    letterSpacing,
    bindings: {
      fontFamily: def.fontFamily,
      fontSize: def.fontSize,
      fontWeight: def.fontWeight,
    },
    links: {
      lineHeightToken: def.lineHeight,
      letterSpacingToken: def.letterSpacing,
    },
  };
}

/** What differs between a managed style and its resolved definition. */
function differences(local: TextStyleInfo, want: ResolvedTextStyle): string[] {
  const notes: string[] = [];

  const wantsAuto = want.lineHeight.unit === "AUTO";
  const lineHeightOk = wantsAuto
    ? local.lineHeight.unit === "AUTO"
    : sameSpacing(local.lineHeight, want.lineHeight.value ?? 0);
  if (!lineHeightOk) {
    notes.push(
      noteSpacing(
        "line height",
        local.lineHeight,
        wantsAuto ? "auto" : `${want.lineHeight.value}%`
      )
    );
  }
  if (!sameSpacing(local.letterSpacing, want.letterSpacing)) {
    notes.push(
      noteSpacing(
        "letter spacing",
        local.letterSpacing,
        `${want.letterSpacing}%`
      )
    );
  }

  const bound = local.bound ?? {};
  if (bound.fontFamily !== want.bindings.fontFamily) {
    notes.push("font family binding");
  }
  if (bound.fontSize !== want.bindings.fontSize)
    notes.push("font size binding");
  if (
    want.bindings.fontWeight &&
    bound.fontWeight !== want.bindings.fontWeight
  ) {
    notes.push("font weight binding");
  }

  if (
    local.lineHeightToken !== want.links.lineHeightToken ||
    local.letterSpacingToken !== want.links.letterSpacingToken ||
    !local.managed
  ) {
    notes.push("token links");
  }
  return notes;
}

/**
 * What a Pull would create and update from the definitions. Pure. A style is
 * Token Bridge's when it has the marker or a plan 205 link; a style with
 * neither that shares a definition's name is a collision and is left alone.
 */
export function planTextStyles(
  definitions: TextStyleDefinition[],
  localStyles: TextStyleInfo[],
  tokens: ExportData[]
): TextStylePlan {
  const plan: TextStylePlan = {
    status: "found",
    creates: [],
    updates: [],
    unchanged: 0,
    collisions: [],
    problems: [],
    removed: [],
  };
  const byName = new Map<string, TextStyleInfo>();
  for (const style of localStyles) {
    if (!byName.has(style.name)) byName.set(style.name, style);
  }
  const defined = new Set(definitions.map((d) => d.name));

  for (const def of definitions) {
    const resolved = resolveDefinition(def, tokens);
    if ("token" in resolved) {
      plan.problems.push(resolved);
      continue;
    }
    const local = byName.get(def.name);
    if (!local) {
      plan.creates.push(resolved);
      continue;
    }
    const ours =
      local.managed || !!local.lineHeightToken || !!local.letterSpacingToken;
    if (!ours) {
      plan.collisions.push({ id: local.id, name: local.name });
      continue;
    }
    const changes = differences(local, resolved);
    if (changes.length === 0) {
      plan.unchanged++;
    } else {
      plan.updates.push({ style: { ...resolved, id: local.id }, changes });
    }
  }

  for (const local of localStyles) {
    if (local.managed && !defined.has(local.name)) {
      plan.removed.push({ id: local.id, name: local.name });
    }
  }

  const byNameOrder = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name);
  plan.creates.sort(byNameOrder);
  plan.updates.sort((a, b) => byNameOrder(a.style, b.style));
  plan.problems.sort(byNameOrder);
  plan.collisions.sort(byNameOrder);
  plan.removed.sort(byNameOrder);
  return plan;
}

/** Styles in a plan that a Pull would write. */
export const planWorkCount = (plan: TextStylePlan | undefined) =>
  plan ? plan.creates.length + plan.updates.length : 0;

/** The styles a Pull writes, in the order they are applied. */
export const planWork = (
  plan: TextStylePlan | undefined
): ResolvedTextStyle[] =>
  plan ? [...plan.creates, ...plan.updates.map((u) => u.style)] : [];

/** Where the definitions live, as shown to people (relative to the repo's token folder). */
export const TEXT_STYLE_DEFINITIONS_HINT = "styles/text-styles.json";

/** "78 text styles will be created", "3 text styles will be created and 2 updated". */
export function describePlanWork(plan: TextStylePlan | undefined): string {
  const created = plan?.creates.length ?? 0;
  const updated = plan?.updates.length ?? 0;
  const styles = (n: number) => `${n} text style${n === 1 ? "" : "s"}`;
  if (created > 0 && updated > 0) {
    return `${styles(created)} will be created and ${updated} updated`;
  }
  if (created > 0) return `${styles(created)} will be created`;
  return `${styles(updated)} will be updated`;
}

export interface TextStyleDefinitionResult {
  created: number;
  updated: number;
  skipped: TextStyleSkip[];
}

/**
 * Create and update the styles (plugin thread, after the variable import, so
 * the variables the styles bind to exist). A create loads its font before
 * touching the style, and is skipped when the font is unavailable. An update
 * only writes what the plan can change: percent properties, bindings, links.
 * Size, family and weight follow their bound variables.
 */
export async function applyTextStyleDefinitions(
  work: ResolvedTextStyle[]
): Promise<TextStyleDefinitionResult> {
  const result: TextStyleDefinitionResult = {
    created: 0,
    updated: 0,
    skipped: [],
  };
  if (work.length === 0) return result;

  const variables = await figma.variables.getLocalVariablesAsync();
  const variableOf = new Map<string, Variable>();
  for (const variable of variables) {
    const token = createTokenName(variable.name);
    if (!variableOf.has(token)) variableOf.set(token, variable);
  }

  for (const spec of work) {
    try {
      let style: TextStyle | null = null;
      if (spec.id) {
        const found = await figma.getStyleByIdAsync(spec.id);
        if (!found || found.type !== "TEXT") {
          result.skipped.push({ name: spec.name, reason: "missing-style" });
          continue;
        }
        style = found;
      }

      const fontName: FontName = style
        ? style.fontName
        : {
            family: spec.fontFamily,
            style: fontStyleFromWeight(spec.fontWeight),
          };
      try {
        await figma.loadFontAsync(fontName);
      } catch {
        result.skipped.push({
          name: spec.name,
          reason: "font",
          detail: `${fontName.family} ${fontName.style}`,
        });
        continue;
      }

      if (!style) {
        style = figma.createTextStyle();
        style.name = spec.name;
        style.fontName = fontName;
        style.fontSize = spec.fontSize;
      }
      const target = style;

      target.lineHeight =
        spec.lineHeight.unit === "PERCENT"
          ? { unit: "PERCENT", value: spec.lineHeight.value ?? 100 }
          : { unit: "AUTO" };
      target.letterSpacing = { unit: "PERCENT", value: spec.letterSpacing };

      const bind = (
        field: "fontFamily" | "fontSize" | "fontWeight",
        token: string | undefined
      ) => {
        if (!token) return;
        const variable = variableOf.get(token);
        if (!variable) {
          result.skipped.push({
            name: spec.name,
            reason: "error",
            detail: `variable for ${token} not found`,
          });
          return;
        }
        target.setBoundVariable(field, variable);
      };
      bind("fontFamily", spec.bindings.fontFamily);
      bind("fontSize", spec.bindings.fontSize);
      bind("fontWeight", spec.bindings.fontWeight);

      const link = (key: string, value: string | undefined) =>
        target.setSharedPluginData(TEXT_STYLE_LINK_NAMESPACE, key, value ?? "");
      link(LINE_HEIGHT_LINK_KEY, spec.links.lineHeightToken);
      link(LETTER_SPACING_LINK_KEY, spec.links.letterSpacingToken);
      link(DEFINITION_LINK_KEY, DEFINITION_LINK_VALUE);

      if (spec.id) result.updated++;
      else result.created++;
    } catch (error) {
      result.skipped.push({
        name: spec.name,
        reason: "error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return result;
}

/** One line for the post-import message: "Created 78 text styles, skipped 1 …". */
export function describeDefinitionResult(
  result: TextStyleDefinitionResult
): string {
  const plural = (n: number) => `${n} text style${n === 1 ? "" : "s"}`;
  const parts: string[] = [];
  if (result.created > 0) parts.push(`created ${plural(result.created)}`);
  if (result.updated > 0) parts.push(`updated ${plural(result.updated)}`);
  if (parts.length === 0) parts.push("no text styles written");
  if (result.skipped.length > 0) {
    const names = result.skipped
      .map((s) =>
        s.reason === "font"
          ? `${s.name} (font ${s.detail} unavailable)`
          : s.reason === "missing-style"
            ? `${s.name} (style not found)`
            : `${s.name} (${s.detail ?? "error"})`
      )
      .join(", ");
    parts.push(`skipped ${result.skipped.length}: ${names}`);
  }
  const text = parts.join(", ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
