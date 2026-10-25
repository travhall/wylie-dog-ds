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

const PLUGIN_TIMEOUT_MS = 10000;

export interface LocalExport {
  localTokens: ExportData[];
  baseline: SyncBaseline | null;
  /** Figma's current variable scopes, beside (never inside) the tokens. */
  localScopes?: LocalScopes;
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

export async function checkSyncStatus(
  client: ConflictAwareGitHubClient
): Promise<SyncStatusResult> {
  const { localTokens, baseline, localScopes } = await requestLocalExport();
  return client.getSyncStatus(localTokens, baseline, localScopes);
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
