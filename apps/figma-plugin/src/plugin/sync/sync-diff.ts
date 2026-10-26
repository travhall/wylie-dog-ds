/**
 * Diff model for the sync review (plan 200): what a Push or Pull will change,
 * token by token, with old and new values.
 *
 * Owner decisions (2026-10-25):
 *  1. Pull is "review, then replace", with an Advanced per-token path that
 *     reuses the conflict list (see `conflictsForRows`).
 *  2. Push only blocks on real conflicts: GitHub-side changes Figma lacks
 *     (side "remote" or "both"). One-sided Figma edits go straight to review.
 *     With no baseline every difference blocks, as it always did.
 *  3. The review is always shown; an empty diff gets a default message.
 *  4. The list lives in a modal; the Sync tab keeps a short inline summary.
 *  5. Rows carry full detail: every mode, type and description notes.
 *  6. Pull deletions (the "replace" strategy removes Figma variables absent
 *     from GitHub) are flagged so the review can group and acknowledge them.
 *  7. Push in pull-request mode shows the same diff plus a notice (UI side).
 *
 * Owner decisions (2026-10-25, plan 202): scopes are derived settings the
 * importer writes on every Pull but the token JSON does not hold, so tokens
 * can match while a Pull would still change them.
 *  8. Pull and the overview list them in a `settings` section, grouped by
 *     transition ("42 variables: all pickers → font size") with the
 *     per-variable list behind each group. Push never lists them.
 *  9. Current scopes ride beside the tokens (`LocalScopes`), never inside, so
 *     hashes and the sync baseline are untouched. Expected scopes are
 *     `inferScopes` of the incoming tokens; comparison ignores order.
 * 10. The Sync tab status stays "Up to date" for tokens and adds a second line
 *     naming the scope changes; the overview says so too instead of "in sync".
 * 11. Scopes are the only invisible setting: descriptions, the original type
 *     and modes already show in the token diff.
 *
 * Owner decisions (2026-10-25, plan 205): text styles linked to a line-height
 * or letter-spacing token are the second derived setting a Pull writes.
 * 12. They are a "Text styles" group in the same `settings` section and the
 *     same confirm; the values come from the incoming tokens (see
 *     text-style-links.ts). Styles without a link are only listed, read-only.
 * 13. The Figma-side style list rides beside the tokens (`localTextStyles`),
 *     never inside, so hashes and the baseline are untouched. Push never lists
 *     or writes them.
 *
 * Owner decisions (2026-10-25, plan 206): with "Text styles" ticked, Pull also
 * creates and updates the styles in the definitions file.
 * 14. The plan (creates, updates, unchanged, collisions, removed) rides in
 *     `textStyles.definitions`, inside the same Text styles group and the same
 *     confirm. `textStyleCount` counts every style a Pull would write. A style
 *     a definition names is handled by the plan, not by the plan 205 links.
 * 15. The definitions file is not a token file: Push, the baseline and the
 *     token diff never see it.
 *
 * Direction decides which side is "from" (what the destination holds now) and
 * "to" (what it will hold): Push writes Figma to GitHub; Pull writes GitHub to
 * Figma; "overview" is a read-only look, ordered like a Push.
 *
 * Pure functions only: no `figma`, no network.
 */
import type { ExportData, ProcessedToken } from "../variables/processor";
import { ConflictDetector } from "./conflict-detector";
import type { SyncChangeItem, SyncChangeSummary } from "./change-summary";
import { inferScopes } from "../variables/scopes";
import {
  EMPTY_TEXT_STYLE_DIFF,
  computeTextStyleChanges,
} from "../variables/text-style-links";
import type {
  TextStyleDiff,
  TextStyleInfo,
} from "../variables/text-style-links";
import {
  EMPTY_TEXT_STYLE_PLAN,
  planTextStyles,
  planWorkCount,
} from "../variables/text-style-definitions";
import type { TextStyleDefinition } from "../variables/text-style-definitions";
import { classifyChanges } from "./sync-baseline";
import type { ChangeSide, SyncBaseline } from "./sync-baseline";
import type { TokenConflict } from "./types";

export type SyncDirection = "push" | "pull" | "overview";
export type DiffKind = "changed" | "added" | "removed" | "renamed";

export interface TokenView {
  type: string;
  /** Single value, or the default mode's value. */
  value: string;
  /** Every mode, when the token has per-mode values. */
  modes?: Array<{ mode: string; value: string }>;
  description?: string;
}

export interface DiffRow {
  id: string;
  collection: string;
  kind: DiffKind;
  /** Which side moved since the last sync ("unknown" with no baseline). */
  side: ChangeSide | "unknown";
  /** Name on the destination now, and name it will have after the sync. */
  fromName: string;
  toName: string;
  from?: TokenView;
  to?: TokenView;
  /** Short human notes: type or description changed. */
  notes: string[];
  /** Push only: GitHub has changes Figma lacks, so pushing would lose them. */
  blocksPush: boolean;
  /** Pull only: Figma has changes of its own that Pull would overwrite. */
  overwritesFigma: boolean;
  /** Pull only: the variable would be deleted from Figma. */
  deletesInFigma: boolean;
}

/** Current Figma scopes: collection name, then token name, then scopes. */
export type LocalScopes = Record<string, Record<string, string[]>>;

/** One variable whose picker scopes a Pull would change. */
export interface ScopeChange {
  collection: string;
  tokenPath: string;
  from: string[];
  to: string[];
}

/** Variables that move between the same two scope sets. */
export interface ScopeGroup {
  id: string;
  from: string[];
  to: string[];
  changes: ScopeChange[];
}

export interface SyncDiff {
  direction: SyncDirection;
  hasBaseline: boolean;
  rows: DiffRow[];
  counts: {
    toPush: number;
    toPull: number;
    conflicts: number;
    differences: number;
  };
  /** Push: rows that must be resolved first. */
  blocking: DiffRow[];
  /** Pull: rows that delete variables in Figma. */
  deletions: DiffRow[];
  /** Pull: rows that overwrite Figma-side edits. */
  overwrites: DiffRow[];
  /**
   * Pull and overview: picker scopes a Pull would change although the tokens
   * may match. Always empty for Push (scopes are never pushed).
   */
  settings: ScopeGroup[];
  /** Variables across all `settings` groups. */
  settingsCount: number;
  /**
   * Pull and overview: linked text styles a Pull would change, linked tokens
   * that cannot give a percent, and styles with no link (read-only). Always
   * empty for Push (text styles are never pushed).
   */
  textStyles: TextStyleDiff;
  /** Styles a Pull would write: `textStyles.changes` plus creates and updates. */
  textStyleCount: number;
}

export interface BuildDiffOptions {
  direction: SyncDirection;
  baseline: SyncBaseline | null | undefined;
  localTokens: ExportData[];
  remoteTokens: ExportData[];
  /** Figma's current scopes; without them no scope differences are reported. */
  localScopes?: LocalScopes;
  /** Figma's local text styles with their links; without them none are reported. */
  localTextStyles?: TextStyleInfo[];
  /**
   * The definitions file (plan 206): the list when "Text styles" is ticked and
   * the branch has one, `null` when ticked but the file is absent, `undefined`
   * when the option is off.
   */
  textStyleDefinitions?: TextStyleDefinition[] | null;
}

const SEP = "\u0000";

function indexTokens(tokens: ExportData[]): Map<string, ProcessedToken> {
  const map = new Map<string, ProcessedToken>();
  for (const data of tokens) {
    for (const [collection, content] of Object.entries(data)) {
      for (const [name, token] of Object.entries(content.variables)) {
        map.set(`${collection}${SEP}${name}`, token);
      }
    }
  }
  return map;
}

const text = (value: unknown): string =>
  value === undefined
    ? "(no value)"
    : typeof value === "string"
      ? value
      : JSON.stringify(value);

function viewOf(token: ProcessedToken | undefined): TokenView | undefined {
  if (!token) return undefined;
  const modes = token.valuesByMode
    ? Object.entries(token.valuesByMode).map(([mode, value]) => ({
        mode,
        value: text(value),
      }))
    : [];
  return {
    type: String(token.$type),
    value: text(token.$value),
    modes: modes.length > 1 ? modes : undefined,
    description: token.$description || undefined,
  };
}

/** One-line text of a token view, for summaries ("Light: #fff · Dark: #000"). */
export function viewText(view: TokenView | undefined): string | undefined {
  if (!view) return undefined;
  return view.modes
    ? view.modes.map((m) => `${m.mode}: ${m.value}`).join(" · ")
    : view.value;
}

function notesFor(from?: TokenView, to?: TokenView): string[] {
  if (!from || !to) return [];
  const notes: string[] = [];
  if (from.type !== to.type) notes.push(`type ${from.type} → ${to.type}`);
  if ((from.description ?? "") !== (to.description ?? "")) {
    notes.push("description changed");
  }
  return notes;
}

/** Keep only the remote collections Figma also has (Push of a subset). */
function scopeToLocalCollections(
  localTokens: ExportData[],
  remoteTokens: ExportData[],
  baseline: SyncBaseline | null | undefined
) {
  const names = new Set(localTokens.flatMap((d) => Object.keys(d)));
  return {
    remote: remoteTokens.filter((d) =>
      Object.keys(d).some((name) => names.has(name))
    ),
    baseline: baseline
      ? {
          ...baseline,
          collections: Object.fromEntries(
            Object.entries(baseline.collections).filter(([name]) =>
              names.has(name)
            )
          ),
        }
      : baseline,
  };
}

const sameScopes = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

/** Plain words for a scope set: "font size", "all pickers", "hidden". */
export function describeScopes(scopes: string[]): string {
  if (scopes.length === 0) return "hidden from pickers";
  if (scopes.includes("ALL_SCOPES")) return "all pickers";
  return [...scopes]
    .sort()
    .map((s) => s.toLowerCase().replace(/_/g, " "))
    .join(", ");
}

/**
 * Variables whose current Figma scopes differ from what the rules would set for
 * the incoming tokens. Variables Figma lacks (additions) and tokens that
 * already have a row (type or rename changes) are left to the token diff.
 */
function diffScopes(
  localScopes: LocalScopes,
  remoteIndex: Map<string, ProcessedToken>,
  rows: DiffRow[]
): ScopeGroup[] {
  const hasRow = new Set(rows.map((r) => `${r.collection}${SEP}${r.toName}`));
  const groups = new Map<string, ScopeGroup>();
  for (const [key, token] of remoteIndex) {
    if (hasRow.has(key)) continue;
    const [collection, name] = key.split(SEP);
    const current = localScopes[collection]?.[name];
    if (!current) continue;
    const expected = inferScopes(String(token.$type), name);
    if (sameScopes(current, expected)) continue;
    const from = [...current].sort();
    const to = [...expected].sort();
    const id = `${from.join("+")}>${to.join("+")}`;
    const group = groups.get(id) ?? { id, from, to, changes: [] };
    group.changes.push({ collection, tokenPath: name, from, to });
    groups.set(id, group);
  }
  const list = [...groups.values()];
  for (const g of list) {
    g.changes.sort(
      (a, b) =>
        a.collection.localeCompare(b.collection) ||
        a.tokenPath.localeCompare(b.tokenPath)
    );
  }
  return list.sort(
    (a, b) => b.changes.length - a.changes.length || a.id.localeCompare(b.id)
  );
}

export function buildSyncDiff({
  direction,
  baseline,
  localTokens,
  remoteTokens,
  localScopes,
  localTextStyles,
  textStyleDefinitions,
}: BuildDiffOptions): SyncDiff {
  // A Push may cover only the selected collections; don't report the others.
  const scoped =
    direction === "push"
      ? scopeToLocalCollections(localTokens, remoteTokens, baseline)
      : { remote: remoteTokens, baseline };

  const classified = classifyChanges(
    scoped.baseline,
    localTokens,
    scoped.remote
  );
  const localIndex = indexTokens(localTokens);
  const remoteIndex = indexTokens(scoped.remote);
  const figmaIsSource = direction !== "pull";

  const rows: DiffRow[] = [];

  const addRow = (
    collection: string,
    figmaName: string | undefined,
    githubName: string | undefined,
    side: DiffRow["side"],
    renamed: boolean
  ) => {
    const figma = figmaName
      ? localIndex.get(`${collection}${SEP}${figmaName}`)
      : undefined;
    const github = githubName
      ? remoteIndex.get(`${collection}${SEP}${githubName}`)
      : undefined;
    const source = figmaIsSource ? figma : github;
    const dest = figmaIsSource ? github : figma;
    if (!source && !dest) return;

    const sourceName = (figmaIsSource ? figmaName : githubName) ?? "";
    const destName = (figmaIsSource ? githubName : figmaName) ?? "";
    const kind: DiffKind =
      renamed && source && dest
        ? "renamed"
        : source && dest
          ? "changed"
          : source
            ? "added"
            : "removed";
    const from = viewOf(dest);
    const to = viewOf(source);
    const fromName = destName || sourceName;
    const toName = sourceName || destName;
    rows.push({
      id: [collection, fromName, toName].join(SEP),
      collection,
      kind,
      side,
      fromName,
      toName,
      from,
      to,
      notes: notesFor(from, to),
      blocksPush: side === "remote" || side === "both" || side === "unknown",
      overwritesFigma:
        direction === "pull" && (side === "local" || side === "both"),
      deletesInFigma: direction === "pull" && kind === "removed",
    });
  };

  if (classified.hasBaseline) {
    for (const entry of classified.entries) {
      if (entry.kind === "renamed") {
        const localSide = entry.side === "local";
        addRow(
          entry.collection,
          localSide ? entry.renamedTo : entry.token,
          localSide ? entry.token : entry.renamedTo,
          entry.side,
          true
        );
      } else {
        addRow(entry.collection, entry.token, entry.token, entry.side, false);
      }
    }
  } else {
    const conflicts = new ConflictDetector().detectConflicts(
      localTokens,
      scoped.remote
    ).conflicts;
    for (const c of conflicts) {
      const name = c.tokenName.slice(c.collectionName.length + 1);
      addRow(
        c.collectionName,
        c.type === "addition" ? undefined : name,
        c.type === "deletion" ? undefined : name,
        "unknown",
        false
      );
    }
  }

  rows.sort(
    (a, b) =>
      a.collection.localeCompare(b.collection) ||
      a.toName.localeCompare(b.toName)
  );

  const settings =
    direction !== "push" && localScopes
      ? diffScopes(localScopes, remoteIndex, rows)
      : [];

  let textStyles: TextStyleDiff = EMPTY_TEXT_STYLE_DIFF;
  if (direction !== "push" && localTextStyles) {
    const wantsDefinitions = textStyleDefinitions !== undefined;
    const defined = new Set((textStyleDefinitions ?? []).map((d) => d.name));
    // A style a definition names is the plan's: leave it out of the links flow
    textStyles = computeTextStyleChanges(
      localTextStyles.filter((s) => !defined.has(s.name)),
      remoteTokens
    );
    if (wantsDefinitions) {
      textStyles = {
        ...textStyles,
        definitions: textStyleDefinitions
          ? planTextStyles(textStyleDefinitions, localTextStyles, remoteTokens)
          : { ...EMPTY_TEXT_STYLE_PLAN, status: "absent" },
      };
    }
  }

  return {
    direction,
    hasBaseline: classified.hasBaseline,
    rows,
    counts: {
      toPush: classified.toPush,
      toPull: classified.toPull,
      conflicts: classified.conflicts,
      differences: classified.differences,
    },
    blocking: direction === "push" ? rows.filter((r) => r.blocksPush) : [],
    deletions: direction === "pull" ? rows.filter((r) => r.deletesInFigma) : [],
    overwrites:
      direction === "pull" ? rows.filter((r) => r.overwritesFigma) : [],
    settings,
    settingsCount: settings.reduce((n, g) => n + g.changes.length, 0),
    textStyles,
    textStyleCount:
      textStyles.changes.length + planWorkCount(textStyles.definitions),
  };
}

/**
 * The existing conflict objects for some rows, so the per-token conflict list
 * (Keep Figma / Take GitHub) can resolve them. A rename touches two token
 * paths, so both are included.
 */
export function conflictsForRows(
  rows: DiffRow[],
  localTokens: ExportData[],
  remoteTokens: ExportData[]
): TokenConflict[] {
  const paths = new Set(
    rows.flatMap((r) => [
      `${r.collection}.${r.fromName}`,
      `${r.collection}.${r.toName}`,
    ])
  );
  return new ConflictDetector()
    .detectConflicts(localTokens, remoteTokens)
    .conflicts.filter((c) => paths.has(c.tokenName));
}

/** The plan 169 "what changed" summary for a pull that applied these rows. */
export function buildPullSummaryFromDiff(diff: SyncDiff): SyncChangeSummary {
  const applied: SyncChangeItem[] = diff.rows.map((row) => ({
    collection: row.collection,
    token:
      row.kind === "renamed" ? `${row.fromName} → ${row.toName}` : row.toName,
    kind:
      row.kind === "added"
        ? "added"
        : row.kind === "removed"
          ? "removed"
          : "changed",
    from: viewText(row.from),
    to: viewText(row.to),
  }));
  return { applied, kept: [] };
}
