/**
 * Per-file sync state (plan 199): the sync baseline and the last-sync time.
 * Plan 207 adds the "Text styles" choice, which belongs to the file alone (no
 * repo scope): "1", "0", or absent when the file never chose.
 *
 * Both live in Figma's root plugin data, so they belong to the file (not to the
 * user, as figma.clientStorage does, which is shared across every file). They
 * are keyed by repo, branch and token path, so pointing the file at another
 * repo or branch finds no baseline and falls back to the honest two-way count.
 *
 * The baseline is stored one entry per collection: Figma caps a plugin data
 * entry (key plus value) at 100 KB, and the largest collection (about 1,000
 * tokens at roughly 65 bytes each) stays well under that. A collection that
 * would not fit is not stored, which leaves the file without a baseline rather
 * than with a partial one.
 */
import type { GitHubConfig } from "../../shared/types";
import {
  BASELINE_SCHEMA_VERSION,
  isSyncBaseline,
  type BaselineEntry,
  type SyncBaseline,
} from "../sync/sync-baseline";

const BASELINE_KEY = "sync-baseline";
const BASELINE_META_KEY = "sync-baseline-meta";
const LAST_SYNC_KEY = "sync-last";
const INCLUDE_TEXT_STYLES_KEY = "include-text-styles";

/** Figma allows 100 KB per plugin data entry; stay clear of the edge. */
export const MAX_ENTRY_CHARS = 90_000;

interface BaselineMeta {
  schema: number;
  recordedAt: string;
  collections: string[];
}

type ScopeConfig = Pick<
  GitHubConfig,
  "owner" | "repo" | "branch" | "tokenPath"
>;

/** Identifies what a baseline is a baseline OF. */
export function syncScope(config: ScopeConfig | null | undefined): string {
  if (!config) return "unconfigured";
  return `${config.owner}/${config.repo}@${config.branch}:${config.tokenPath}`;
}

function readJson<T>(key: string): T | null {
  const raw = figma.root.getPluginData(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export class SyncStateStorage {
  /** The baseline for this file and repo scope, or null (never synced here). */
  loadBaseline(config: ScopeConfig | null | undefined): SyncBaseline | null {
    const scope = syncScope(config);
    const meta = readJson<BaselineMeta>(`${BASELINE_META_KEY}:${scope}`);
    if (!meta || meta.schema !== BASELINE_SCHEMA_VERSION) return null;

    const collections: SyncBaseline["collections"] = {};
    for (const name of meta.collections) {
      const entries = readJson<Record<string, BaselineEntry>>(
        `${BASELINE_KEY}:${scope}:${name}`
      );
      // A missing collection means storage was damaged: no baseline at all is
      // safer than one that silently drops a collection.
      if (!entries) return null;
      collections[name] = entries;
    }

    const baseline: SyncBaseline = {
      schema: meta.schema,
      recordedAt: meta.recordedAt,
      collections,
    };
    return isSyncBaseline(baseline) ? baseline : null;
  }

  /**
   * Persist a baseline. Returns false (and writes nothing) if any collection
   * would exceed Figma's plugin data limit.
   */
  saveBaseline(
    config: ScopeConfig | null | undefined,
    baseline: SyncBaseline
  ): boolean {
    const scope = syncScope(config);
    const writes: Array<[string, string]> = [];
    for (const [name, entries] of Object.entries(baseline.collections)) {
      const key = `${BASELINE_KEY}:${scope}:${name}`;
      const value = JSON.stringify(entries);
      if (key.length + value.length > MAX_ENTRY_CHARS) {
        console.warn(
          `Sync baseline not saved: collection "${name}" is too large for plugin data`
        );
        return false;
      }
      writes.push([key, value]);
    }

    const metaKey = `${BASELINE_META_KEY}:${scope}`;
    const previous = readJson<BaselineMeta>(metaKey);
    for (const [key, value] of writes) figma.root.setPluginData(key, value);

    const names = Object.keys(baseline.collections);
    for (const stale of previous?.collections ?? []) {
      if (!names.includes(stale)) {
        figma.root.setPluginData(`${BASELINE_KEY}:${scope}:${stale}`, "");
      }
    }

    const meta: BaselineMeta = {
      schema: baseline.schema,
      recordedAt: baseline.recordedAt,
      collections: names,
    };
    figma.root.setPluginData(metaKey, JSON.stringify(meta));
    return true;
  }

  /** Last successful sync time for this file and repo scope, if any. */
  loadLastSync(config: ScopeConfig | null | undefined): string | null {
    const stored = readJson<{ timestamp?: string }>(
      `${LAST_SYNC_KEY}:${syncScope(config)}`
    );
    return stored?.timestamp ?? null;
  }

  saveLastSync(
    config: ScopeConfig | null | undefined,
    timestamp: string
  ): void {
    figma.root.setPluginData(
      `${LAST_SYNC_KEY}:${syncScope(config)}`,
      JSON.stringify({ timestamp })
    );
  }

  /** The file's "Text styles" choice, or null when it never made one. */
  loadIncludeTextStyles(): boolean | null {
    const raw = figma.root.getPluginData(INCLUDE_TEXT_STYLES_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  }

  saveIncludeTextStyles(value: boolean): void {
    figma.root.setPluginData(INCLUDE_TEXT_STYLES_KEY, value ? "1" : "0");
  }
}

export const syncStateStorage = new SyncStateStorage();
