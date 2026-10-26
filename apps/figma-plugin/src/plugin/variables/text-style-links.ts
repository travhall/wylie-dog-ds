/**
 * Token links on Figma text styles (plan 205).
 *
 * Figma variables cannot carry a percent (a bound number always becomes
 * pixels), so line height and letter spacing live on text styles as PERCENT
 * values (plan 204). Nothing would keep those styles in line with their tokens
 * afterwards, so a text style records which tokens drive it, and Pull updates
 * the style when a token changes.
 *
 * Owner decisions (2026-10-25, plan 205):
 *  1. Link format: two shared plugin data keys on the style, namespace
 *     `wylie_dog`, keys `lineHeightToken` and `letterSpacingToken`, the value a
 *     dotted token path ("button.line-height"). Shared plugin data is readable
 *     by every plugin; the builder writes it, Token Bridge reads it. Anyone can
 *     make a hand-built style token-driven by adding the keys.
 *  2. Review shape: a "Text styles" group inside the Pull review's settings
 *     section (see sync-diff.ts and DiffReview.tsx), one review, one confirm.
 *  3. Styles with no link are designer-owned: never modified. They are listed
 *     in a read-only "no token link" report so you can see what is not driven.
 *  4. A style whose font cannot be loaded in the file is skipped and reported;
 *     the other styles still update and the Pull still completes.
 *  5. Wording mirrors the picker scopes wording (status line, headline,
 *     overview): "N text styles' line height or letter spacing will change".
 *
 * Which value a style gets: the review resolves each linked token from the
 * tokens the Pull will import (the Figma variables hold the old value until
 * the import runs), and the same list is applied after the import. Line
 * height is the token's percent value (125 gives 125%); letter spacing is em
 * times 100 (-0.025em gives -2.5%). Push, the baseline hashes and the token
 * JSON are never touched: the style list rides beside the tokens, like
 * `LocalScopes`.
 *
 * The computation is pure (no `figma`); only `readLocalTextStyles` and
 * `applyTextStyleChanges` touch the file.
 */
import type { ExportData } from "./processor";

export const TEXT_STYLE_LINK_NAMESPACE = "wylie_dog";
export const LINE_HEIGHT_LINK_KEY = "lineHeightToken";
export const LETTER_SPACING_LINK_KEY = "letterSpacingToken";

/** A line height or letter spacing as Figma stores it. */
export interface SpacingValue {
  unit: "PERCENT" | "PIXELS" | "AUTO";
  value?: number;
}

/** A local text style with its current spacing and token links. */
export interface TextStyleInfo {
  id: string;
  name: string;
  lineHeight: SpacingValue;
  letterSpacing: SpacingValue;
  /** Dotted token path driving the line height, when linked. */
  lineHeightToken?: string;
  /** Dotted token path driving the letter spacing, when linked. */
  letterSpacingToken?: string;
}

export interface SpacingChange {
  from: SpacingValue;
  /** The new PERCENT value. */
  to: number;
}

/** One style whose line height or letter spacing a Pull would change. */
export interface TextStyleChange {
  id: string;
  name: string;
  lineHeight?: SpacingChange;
  letterSpacing?: SpacingChange;
}

/** A linked token that cannot give a percent. */
export interface TextStyleProblem {
  id: string;
  name: string;
  token: string;
  reason: "missing" | "unsupported";
}

export interface TextStyleDiff {
  changes: TextStyleChange[];
  problems: TextStyleProblem[];
  /** Styles with no link at all: designer-owned, never modified. */
  unlinked: Array<{ id: string; name: string }>;
}

export const EMPTY_TEXT_STYLE_DIFF: TextStyleDiff = {
  changes: [],
  problems: [],
  unlinked: [],
};

const round3 = (n: number) => Math.round(n * 1000) / 1000;

/** "125%", "-2.5%", "auto", "20px". */
export function formatSpacing(spacing: SpacingValue): string {
  if (spacing.unit === "AUTO") return "auto";
  const value = round3(spacing.value ?? 0);
  return spacing.unit === "PERCENT" ? `${value}%` : `${value}px`;
}

/** "line height 100% → 125%, letter spacing 0% → -2.5%". */
export function describeTextStyleChange(change: TextStyleChange): string {
  const parts: string[] = [];
  if (change.lineHeight) {
    parts.push(
      `line height ${formatSpacing(change.lineHeight.from)} → ${round3(change.lineHeight.to)}%`
    );
  }
  if (change.letterSpacing) {
    parts.push(
      `letter spacing ${formatSpacing(change.letterSpacing.from)} → ${round3(change.letterSpacing.to)}%`
    );
  }
  return parts.join(", ");
}

type Resolved =
  | { ok: true; value: number; unit: "none" | "em" | "percent" }
  | { ok: false; reason: "missing" | "unsupported" };

const MAX_ALIAS_DEPTH = 10;

function findToken(path: string, tokens: ExportData[]) {
  for (const data of tokens) {
    for (const content of Object.values(data)) {
      const token = content.variables[path];
      if (token) return token;
    }
  }
  return undefined;
}

/** A token's number, following `{alias}` chains through every collection. */
export function resolveTokenNumber(
  path: string,
  tokens: ExportData[],
  depth = 0
): Resolved {
  if (depth > MAX_ALIAS_DEPTH) return { ok: false, reason: "missing" };
  const token = findToken(path, tokens);
  if (!token) return { ok: false, reason: "missing" };
  const raw: unknown = token.$value;
  if (typeof raw === "number") return { ok: true, value: raw, unit: "none" };
  if (typeof raw !== "string") return { ok: false, reason: "unsupported" };
  const alias = /^\{([^{}]+)\}$/.exec(raw.trim());
  if (alias) return resolveTokenNumber(alias[1], tokens, depth + 1);
  const match = /^(-?\d*\.?\d+)(em|%)?$/.exec(raw.trim());
  if (!match) return { ok: false, reason: "unsupported" };
  const unit = match[2] === "em" ? "em" : match[2] === "%" ? "percent" : "none";
  return { ok: true, value: parseFloat(match[1]), unit };
}

/** Line height: a bare number or % is already percent; em is times 100. */
function lineHeightPercent(r: Resolved): number | null {
  if (!r.ok) return null;
  return round3(r.unit === "em" ? r.value * 100 : r.value);
}

/** Letter spacing: a bare number or em is em, times 100; % is already percent. */
function letterSpacingPercent(r: Resolved): number | null {
  if (!r.ok) return null;
  return round3(r.unit === "percent" ? r.value : r.value * 100);
}

const sameSpacing = (current: SpacingValue, to: number) =>
  current.unit === "PERCENT" && Math.abs((current.value ?? 0) - to) < 0.001;

/**
 * What a Pull would change on the linked text styles, given the tokens it will
 * import. Pure: styles without a link are listed as `unlinked` and nothing
 * more; a linked token that is missing or has an unusable unit is a problem,
 * not a change.
 */
export function computeTextStyleChanges(
  styles: TextStyleInfo[],
  tokens: ExportData[]
): TextStyleDiff {
  const diff: TextStyleDiff = { changes: [], problems: [], unlinked: [] };

  for (const style of styles) {
    if (!style.lineHeightToken && !style.letterSpacingToken) {
      diff.unlinked.push({ id: style.id, name: style.name });
      continue;
    }
    const change: TextStyleChange = { id: style.id, name: style.name };

    if (style.lineHeightToken) {
      const resolved = resolveTokenNumber(style.lineHeightToken, tokens);
      const to = lineHeightPercent(resolved);
      if (to === null) {
        diff.problems.push({
          id: style.id,
          name: style.name,
          token: style.lineHeightToken,
          reason: resolved.ok ? "unsupported" : resolved.reason,
        });
      } else if (!sameSpacing(style.lineHeight, to)) {
        change.lineHeight = { from: style.lineHeight, to };
      }
    }

    if (style.letterSpacingToken) {
      const resolved = resolveTokenNumber(style.letterSpacingToken, tokens);
      const to = letterSpacingPercent(resolved);
      if (to === null) {
        diff.problems.push({
          id: style.id,
          name: style.name,
          token: style.letterSpacingToken,
          reason: resolved.ok ? "unsupported" : resolved.reason,
        });
      } else if (!sameSpacing(style.letterSpacing, to)) {
        change.letterSpacing = { from: style.letterSpacing, to };
      }
    }

    if (change.lineHeight || change.letterSpacing) diff.changes.push(change);
  }

  const byName = (a: { name: string }, b: { name: string }) =>
    a.name.localeCompare(b.name);
  diff.changes.sort(byName);
  diff.problems.sort(byName);
  diff.unlinked.sort(byName);
  return diff;
}

const spacingOf = (value: LineHeight | LetterSpacing): SpacingValue =>
  value.unit === "AUTO"
    ? { unit: "AUTO" }
    : { unit: value.unit, value: value.value };

/** Every local text style with its spacing and links (plugin thread). */
export async function readLocalTextStyles(): Promise<TextStyleInfo[]> {
  const styles = await figma.getLocalTextStylesAsync();
  return styles.map((style) => {
    const link = (key: string) =>
      style.getSharedPluginData(TEXT_STYLE_LINK_NAMESPACE, key) || undefined;
    return {
      id: style.id,
      name: style.name,
      lineHeight: spacingOf(style.lineHeight),
      letterSpacing: spacingOf(style.letterSpacing),
      lineHeightToken: link(LINE_HEIGHT_LINK_KEY),
      letterSpacingToken: link(LETTER_SPACING_LINK_KEY),
    };
  });
}

export interface TextStyleSkip {
  name: string;
  reason: "font" | "missing-style" | "error";
  detail?: string;
}

export interface TextStyleApplyResult {
  applied: number;
  skipped: TextStyleSkip[];
}

/**
 * Apply reviewed changes to the file (plugin thread, after the import). The
 * style's font is loaded first, as Figma requires before text properties are
 * set; a style whose font is unavailable is skipped and reported, never fatal.
 */
export async function applyTextStyleChanges(
  changes: TextStyleChange[]
): Promise<TextStyleApplyResult> {
  const result: TextStyleApplyResult = { applied: 0, skipped: [] };

  for (const change of changes) {
    try {
      const style = await figma.getStyleByIdAsync(change.id);
      if (!style || style.type !== "TEXT") {
        result.skipped.push({ name: change.name, reason: "missing-style" });
        continue;
      }
      try {
        await figma.loadFontAsync(style.fontName);
      } catch {
        result.skipped.push({
          name: change.name,
          reason: "font",
          detail: `${style.fontName.family} ${style.fontName.style}`,
        });
        continue;
      }
      if (change.lineHeight) {
        style.lineHeight = { unit: "PERCENT", value: change.lineHeight.to };
      }
      if (change.letterSpacing) {
        style.letterSpacing = {
          unit: "PERCENT",
          value: change.letterSpacing.to,
        };
      }
      result.applied++;
    } catch (error) {
      result.skipped.push({
        name: change.name,
        reason: "error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return result;
}

/** One line for the post-import message: "Updated 3 text styles, skipped 1 …". */
export function describeApplyResult(result: TextStyleApplyResult): string {
  const plural = (n: number) => `${n} text style${n === 1 ? "" : "s"}`;
  const parts = [`Updated ${plural(result.applied)}`];
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
  return parts.join(", ");
}
