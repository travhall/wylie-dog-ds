/**
 * Provider registry — returns the right SourceControlProvider for a config,
 * mirroring the token format-adapter registry pattern. Handlers/UI should call
 * getProvider() rather than constructing a client directly, so new providers
 * slot in here without touching call sites.
 */
import type { GitHubConfig } from "../../shared/types";
import type { SourceControlProvider } from "./source-control-provider";
import { ConflictAwareGitHubClient } from "../sync/conflict-aware-github-client";

export type ProviderId = "github" | "gitlab" | "bitbucket";

/**
 * Resolve a configured provider for the given repo config. Defaults to GitHub
 * when `provider` is absent. Throws for providers not yet implemented.
 */
export function getProvider(config: GitHubConfig): SourceControlProvider {
  const id: ProviderId = config.provider ?? "github";

  switch (id) {
    case "github": {
      const client = new ConflictAwareGitHubClient();
      client.configure(config);
      return client;
    }
    case "gitlab":
      throw new Error("GitLab is not supported yet");
    case "bitbucket":
      throw new Error("Bitbucket is not supported yet");
    default:
      throw new Error(`Unknown source-control provider: ${id}`);
  }
}
