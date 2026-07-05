/**
 * SourceControlProvider — the full operation set the plugin needs from a git
 * host, behind one interface so providers (GitHub today; GitLab/Bitbucket next)
 * can be swapped via the provider registry without touching call sites.
 *
 * It extends the existing StorageAdapter (the low-level file ops) and adds the
 * higher-level operations GitHubClient already exposes. GitHubClient satisfies
 * this interface as-is. Auth is PAT-only (a token on the config).
 */
import type { StorageAdapter } from "../storage/storage-adapter";
import type { PullResult, SyncResult } from "../github/client";
import type { GitHubConfig } from "../../shared/types";
import type { ExportData } from "../variables/processor";

export interface SourceControlProvider extends StorageAdapter {
  /** Which host this provider talks to. */
  readonly id: "github" | "gitlab" | "bitbucket";

  /** Configure the provider with repo coordinates + PAT (from config.accessToken). */
  configure(config: GitHubConfig): void;

  /** Verify the token is valid (e.g. an authenticated whoami call). */
  validateConfiguration(): Promise<boolean>;

  /** Verify the configured repository is reachable with the current token. */
  validateRepository(): Promise<{ valid: boolean; error?: string }>;

  /** Read all token files from the repo and return their parsed contents. */
  pullTokens(): Promise<PullResult>;

  /** Write token files back to the repo (commit / PR-or-MR as the host supports). */
  syncTokens(
    exportData: ExportData[],
    commitMessage?: string
  ): Promise<SyncResult>;
}
