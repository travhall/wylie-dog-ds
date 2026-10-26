/**
 * Sync status check shared by the status card and the Pull warning.
 *
 * Asks the plugin thread for the Figma-side export (it also returns the file's
 * sync baseline), then lets the GitHub client fetch the remote and classify.
 */
import type {
  ConflictAwareGitHubClient,
  SyncStatusResult,
} from "../../plugin/sync/conflict-aware-github-client";
import type {
  ChangeEntry,
  SyncBaseline,
} from "../../plugin/sync/sync-baseline";
import { isSyncBaseline } from "../../plugin/sync/sync-baseline";
import type { LocalScopes } from "../../plugin/sync/sync-diff";
import type { ExportData } from "../../plugin/variables/processor";
import type { TextStyleInfo } from "../../plugin/variables/text-style-links";
import type { TextStyleDefinition } from "../../plugin/variables/text-style-definitions";

const PLUGIN_TIMEOUT_MS = 10000;

export interface LocalExport {
  localTokens: ExportData[];
  baseline: SyncBaseline | null;
  /** Figma's current variable scopes, beside (never inside) the tokens. */
  localScopes?: LocalScopes;
  /** Figma's local text styles with their token links (plan 205). */
  localTextStyles?: TextStyleInfo[];
  /** The plugin reported an error or never answered. */
  failed?: boolean;
}

/** Ask the plugin thread for the Figma tokens and the file's sync baseline. */
export function requestLocalExport(): Promise<LocalExport> {
  return new Promise<LocalExport>((resolve) => {
    const finish = (value: LocalExport) => {
      window.removeEventListener("message", handler);
      resolve(value);
    };
    const handler = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      if (message?.type === "local-tokens-exported") {
        finish({
          localTokens: message.localTokens || [],
          baseline: isSyncBaseline(message.baseline) ? message.baseline : null,
          localScopes: message.localScopes ?? undefined,
          localTextStyles: message.textStyles ?? undefined,
        });
      } else if (message?.type === "local-tokens-error") {
        finish({ localTokens: [], baseline: null, failed: true });
      }
    };
    window.addEventListener("message", handler);

    parent.postMessage({ pluginMessage: { type: "get-local-tokens" } }, "*");

    setTimeout(
      () => finish({ localTokens: [], baseline: null, failed: true }),
      PLUGIN_TIMEOUT_MS
    );
  });
}

/**
 * The definitions file when "Text styles" is ticked (plan 206): the list, or
 * `null` when the branch has none. `undefined` when the option is off or the
 * file could not be read (the status then simply leaves styles out).
 */
export async function readTextStyleDefinitions(
  client: ConflictAwareGitHubClient,
  includeTextStyles: boolean
): Promise<TextStyleDefinition[] | null | undefined> {
  if (!includeTextStyles) return undefined;
  const result = await client.fetchTextStyleDefinitions();
  if (result.status === "found") return result.definitions;
  return result.status === "absent" ? null : undefined;
}

export async function checkSyncStatus(
  client: ConflictAwareGitHubClient,
  includeTextStyles = false
): Promise<SyncStatusResult> {
  const { localTokens, baseline, localScopes, localTextStyles } =
    await requestLocalExport();
  return client.getSyncStatus(
    localTokens,
    baseline,
    localScopes,
    localTextStyles,
    await readTextStyleDefinitions(client, includeTextStyles)
  );
}

/** "collection / token", or "collection / old → new" for a rename. */
export function describeChange(entry: ChangeEntry): string {
  const name =
    entry.kind === "renamed"
      ? `${entry.token} → ${entry.renamedTo}`
      : entry.token;
  return `${entry.collection} / ${name}`;
}

/** The changes a Pull would overwrite in Figma (Figma-side and conflicting). */
export function overwrittenByPull(status: SyncStatusResult): ChangeEntry[] {
  return status.entries.filter((e) => e.side !== "remote");
}
