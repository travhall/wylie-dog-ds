/**
 * Sync baseline: what the last successful Push or Pull agreed on (plan 199).
 *
 * A plain diff of Figma against GitHub cannot say WHICH side changed, so a
 * rename in Figma looked like three remote changes. This module remembers, for
 * every token, a hash of the Figma export (L0) and a hash of the GitHub tokens
 * (R0) as they were after the last sync, and later compares each side with its
 * OWN baseline hash. Hashes from the two export pipelines are never compared
 * with each other (they are normalised differently), so no cross-pipeline
 * equivalence is needed, except to tell "both sides changed to the same value"
 * from a real conflict, where the existing ConflictDetector is the judge.
 *
 * Owner decisions (2026-10-25):
 *  1. Storage: Figma root plugin data, one entry per repo + branch + token path
 *     + collection, so it follows the file (a duplicated file inherits the
 *     baseline, which is correct at the moment of duplication) and switching
 *     repo or branch invalidates it. See storage/baseline-storage.ts.
 *  2. Labels: "N to push" / "N to pull" / "N conflicts".
 *  3. No baseline: "N differences, direction unknown" (the plain two-way count).
 *  4. A removed and an added token with equal content on the same side are
 *     reported as one rename. An alias Figma re-points after a rename stays a
 *     separate (follow-on) change of its own.
 *  5. A Pull that would overwrite Figma-side changes asks for confirmation.
 *
 * Pure functions only: no `figma`, no network, safe in either thread.
 */
import type { ExportData } from "../variables/processor";
import { ConflictDetector } from "./conflict-detector";
import { SyncMetadataManager } from "./metadata-manager";

/** Bump when the stored shape changes; older baselines are then ignored. */
export const BASELINE_SCHEMA_VERSION = 1;

/** collection name -> token name -> hash */
export type TokenHashes = Record<string, Record<string, string>>;

/** [Figma hash at last sync, GitHub hash at last sync]; null = absent then. */
export type BaselineEntry = [string | null, string | null];

export interface SyncBaseline {
  schema: number;
  recordedAt: string;
  /** collection name -> token name -> [L0, R0] */
  collections: Record<string, Record<string, BaselineEntry>>;
}

export type ChangeSide = "local" | "remote" | "both";
export type ChangeKind = "modified" | "added" | "removed" | "renamed";

export interface ChangeEntry {
  collection: string;
  token: string;
  /** local = Figma changed (push), remote = GitHub changed (pull) */
  side: ChangeSide;
  kind: ChangeKind;
  /** New name, for kind "renamed". `token` is the old name. */
  renamedTo?: string;
}

export interface ClassifiedChanges {
  hasBaseline: boolean;
  /** Tokens changed in Figma only (renames count once). */
  toPush: number;
  /** Tokens changed on GitHub only (renames count once). */
  toPull: number;
  /** Tokens changed on both sides to different values. */
  conflicts: number;
  /** How many of toPush / toPull are renames. */
  renamedLocal: number;
  renamedRemote: number;
  /** Every Figma vs GitHub difference; the only honest number with no baseline. */
  differences: number;
  /** Changed tokens (empty with no baseline). */
  entries: ChangeEntry[];
}

const metadata = new SyncMetadataManager();

/** Hash every token of an export, keyed by collection and token name. */
export function hashTokens(tokens: ExportData[]): TokenHashes {
  const hashes: TokenHashes = {};
  for (const data of tokens) {
    for (const [collection, content] of Object.entries(data)) {
      const target = (hashes[collection] ??= {});
      for (const [name, token] of Object.entries(content.variables)) {
        target[name] = metadata.generateTokenHash(token);
      }
    }
  }
  return hashes;
}

/** Combine the two sides' hashes, taken right after a successful sync. */
export function buildBaseline(
  local: TokenHashes,
  remote: TokenHashes,
  recordedAt = new Date().toISOString()
): SyncBaseline {
  const collections: SyncBaseline["collections"] = {};
  const names = new Set([...Object.keys(local), ...Object.keys(remote)]);
  for (const collection of names) {
    const l = local[collection] ?? {};
    const r = remote[collection] ?? {};
    const entries: Record<string, BaselineEntry> = {};
    for (const token of new Set([...Object.keys(l), ...Object.keys(r)])) {
      entries[token] = [l[token] ?? null, r[token] ?? null];
    }
    collections[collection] = entries;
  }
  return { schema: BASELINE_SCHEMA_VERSION, recordedAt, collections };
}

/** Runtime guard for data read back from storage or a message. */
export function isSyncBaseline(value: unknown): value is SyncBaseline {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<SyncBaseline>;
  return (
    v.schema === BASELINE_SCHEMA_VERSION &&
    typeof v.recordedAt === "string" &&
    typeof v.collections === "object" &&
    v.collections !== null
  );
}

interface Candidate {
  collection: string;
  token: string;
  hash: string;
}

/**
 * Pair removed and added tokens that carry identical content. Only unambiguous
 * 1:1 matches within a collection count; anything else stays added/removed.
 */
function pairRenames(
  removed: Candidate[],
  added: Candidate[]
): Array<{ from: Candidate; to: Candidate }> {
  const key = (c: Candidate) => `${c.collection}\u0000${c.hash}`;
  const group = (list: Candidate[]) => {
    const m = new Map<string, Candidate[]>();
    for (const c of list) m.set(key(c), [...(m.get(key(c)) ?? []), c]);
    return m;
  };
  const removedBy = group(removed);
  const addedBy = group(added);
  const pairs: Array<{ from: Candidate; to: Candidate }> = [];
  for (const [k, from] of removedBy) {
    const to = addedBy.get(k);
    if (from.length === 1 && to?.length === 1) {
      pairs.push({ from: from[0], to: to[0] });
    }
  }
  return pairs;
}

/**
 * Classify every token against the baseline.
 *
 * Per token, L (Figma now) is compared with L0 and R (GitHub now) with R0:
 *  - neither moved: unchanged
 *  - only Figma moved: push; only GitHub moved: pull
 *  - both moved: converged (equal content now, not a change) or a conflict
 * With no baseline the result carries only the honest two-way `differences`.
 */
export function classifyChanges(
  baseline: SyncBaseline | null | undefined,
  localTokens: ExportData[],
  remoteTokens: ExportData[]
): ClassifiedChanges {
  // The detector is the one place that knows when a Figma token and a GitHub
  // token mean the same thing (colour formats, dimension types, ...).
  const diff = new ConflictDetector().detectConflicts(
    localTokens,
    remoteTokens
  ).conflicts;
  const differs = new Set(diff.map((c) => c.tokenName));

  if (!baseline) {
    return {
      hasBaseline: false,
      toPush: 0,
      toPull: 0,
      conflicts: 0,
      renamedLocal: 0,
      renamedRemote: 0,
      differences: diff.length,
      entries: [],
    };
  }

  const local = hashTokens(localTokens);
  const remote = hashTokens(remoteTokens);
  const collections = new Set([
    ...Object.keys(baseline.collections),
    ...Object.keys(local),
    ...Object.keys(remote),
  ]);

  const entries: ChangeEntry[] = [];
  const removedLocal: Candidate[] = [];
  const addedLocal: Candidate[] = [];
  const removedRemote: Candidate[] = [];
  const addedRemote: Candidate[] = [];

  for (const collection of collections) {
    const base = baseline.collections[collection] ?? {};
    const l = local[collection] ?? {};
    const r = remote[collection] ?? {};
    const tokens = new Set([
      ...Object.keys(base),
      ...Object.keys(l),
      ...Object.keys(r),
    ]);

    for (const token of tokens) {
      const [l0, r0] = base[token] ?? [null, null];
      const lNow = l[token] ?? null;
      const rNow = r[token] ?? null;
      const localMoved = lNow !== l0;
      const remoteMoved = rNow !== r0;
      if (!localMoved && !remoteMoved) continue;

      if (localMoved && remoteMoved) {
        const converged =
          (lNow === null && rNow === null) ||
          (lNow !== null &&
            rNow !== null &&
            !differs.has(`${collection}.${token}`));
        if (converged) continue;
        entries.push({ collection, token, side: "both", kind: "modified" });
        continue;
      }

      const side: ChangeSide = localMoved ? "local" : "remote";
      const [before, now] = localMoved ? [l0, lNow] : [r0, rNow];
      const kind: ChangeKind =
        before === null ? "added" : now === null ? "removed" : "modified";
      entries.push({ collection, token, side, kind });

      const candidate = { collection, token, hash: (now ?? before) as string };
      if (kind === "removed") {
        (localMoved ? removedLocal : removedRemote).push(candidate);
      } else if (kind === "added") {
        (localMoved ? addedLocal : addedRemote).push(candidate);
      }
    }
  }

  // Merge each removed+added pair on one side into a single rename.
  const merged = new Set<ChangeEntry>();
  const renames: ChangeEntry[] = [];
  for (const [side, removed, added] of [
    ["local", removedLocal, addedLocal],
    ["remote", removedRemote, addedRemote],
  ] as const) {
    for (const { from, to } of pairRenames(removed, added)) {
      for (const e of entries) {
        const isFrom =
          e.side === side &&
          e.kind === "removed" &&
          e.collection === from.collection &&
          e.token === from.token;
        const isTo =
          e.side === side &&
          e.kind === "added" &&
          e.collection === to.collection &&
          e.token === to.token;
        if (isFrom || isTo) merged.add(e);
      }
      renames.push({
        collection: from.collection,
        token: from.token,
        side,
        kind: "renamed",
        renamedTo: to.token,
      });
    }
  }
  const finalEntries = [
    ...entries.filter((e) => !merged.has(e)),
    ...renames,
  ].sort(
    (a, b) =>
      a.collection.localeCompare(b.collection) || a.token.localeCompare(b.token)
  );

  const count = (side: ChangeSide) =>
    finalEntries.filter((e) => e.side === side).length;
  const renamed = (side: ChangeSide) =>
    finalEntries.filter((e) => e.side === side && e.kind === "renamed").length;

  return {
    hasBaseline: true,
    toPush: count("local"),
    toPull: count("remote"),
    conflicts: count("both"),
    renamedLocal: renamed("local"),
    renamedRemote: renamed("remote"),
    differences: diff.length,
    entries: finalEntries,
  };
}
