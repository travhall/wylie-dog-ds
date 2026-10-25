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
 * Direction decides which side is "from" (what the destination holds now) and
 * "to" (what it will hold): Push writes Figma to GitHub; Pull writes GitHub to
 * Figma; "overview" is a read-only look, ordered like a Push.
 *
 * Pure functions only: no `figma`, no network.
 */
import type { ExportData, ProcessedToken } from "../variables/processor";
import { ConflictDetector } from "./conflict-detector";
import type { SyncChangeItem, SyncChangeSummary } from "./change-summary";
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
}

export interface BuildDiffOptions {
  direction: SyncDirection;
  baseline: SyncBaseline | null | undefined;
  localTokens: ExportData[];
  remoteTokens: ExportData[];
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

export function buildSyncDiff({
  direction,
  baseline,
  localTokens,
  remoteTokens,
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
