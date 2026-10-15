// Builds the "what changed" list shown after a pull is applied to Figma.
//
// The conflict detector already knows every token that differs between Figma
// and GitHub, and the resolution step records which side the user chose for
// each. Combining the two answers "what did accepting those conflicts do?".
import type { ProcessedToken } from "../variables/processor";
import type { ConflictResolution, TokenConflict } from "./types";

export type SyncChangeKind = "added" | "changed" | "removed";

export interface SyncChangeItem {
  collection: string;
  token: string;
  kind: SyncChangeKind;
  /** What Figma had before (absent for additions). */
  from?: string;
  /** What Figma has now (absent for removals). */
  to?: string;
}

export interface SyncChangeSummary {
  /** Differences that were applied to Figma. */
  applied: SyncChangeItem[];
  /** Differences where the user kept the Figma version, so Figma is unchanged. */
  kept: SyncChangeItem[];
}

function formatValue(value: unknown): string {
  if (value === undefined) return "(no value)";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Human-readable value of a token. Tokens with several modes list each mode
 * (`Light: … · Dark: …`); the type is shown first when it differs between sides.
 */
export function describeToken(
  token: ProcessedToken | undefined,
  includeType = false
): string | undefined {
  if (!token) return undefined;
  const modes = token.valuesByMode ?? undefined;
  const modeEntries = modes ? Object.entries(modes) : [];
  const value =
    modeEntries.length > 1
      ? modeEntries.map(([mode, v]) => `${mode}: ${formatValue(v)}`).join(" · ")
      : formatValue(token.$value);
  return includeType ? `(${token.$type}) ${value}` : value;
}

function kindOf(conflict: TokenConflict): SyncChangeKind {
  if (conflict.type === "addition") return "added";
  if (conflict.type === "deletion") return "removed";
  return "changed";
}

/**
 * Summarise a pull. In a pull, "local" is what Figma has and "remote" is what
 * GitHub has, so taking the remote side changes Figma and taking the local side
 * leaves it alone. A manual resolution changes Figma to the typed value.
 */
export function buildPullChangeSummary(
  conflicts: TokenConflict[],
  resolutions: ConflictResolution[]
): SyncChangeSummary {
  const byId = new Map(resolutions.map((r) => [r.conflictId, r]));
  const applied: SyncChangeItem[] = [];
  const kept: SyncChangeItem[] = [];

  for (const conflict of conflicts) {
    const resolution = byId.get(conflict.conflictId);
    if (!resolution) continue;

    const typeChanged =
      conflict.localToken !== undefined &&
      conflict.remoteToken !== undefined &&
      conflict.localToken.$type !== conflict.remoteToken.$type;
    const item: SyncChangeItem = {
      collection: conflict.collectionName,
      token: conflict.tokenName,
      kind: kindOf(conflict),
      from: describeToken(conflict.localToken, typeChanged),
      to: describeToken(conflict.remoteToken, typeChanged),
    };

    if (resolution.resolution === "take-local") {
      kept.push(item);
    } else if (resolution.resolution === "manual") {
      applied.push({
        ...item,
        kind: conflict.localToken ? "changed" : "added",
        to: formatValue(resolution.manualValue),
      });
    } else {
      applied.push(item);
    }
  }

  return { applied, kept };
}
