import type { GitHubConfig } from "./types";

/**
 * True when a repo config is present but the current Figma user has no GitHub
 * token for it.
 *
 * Repo settings live in the Figma file (shared with collaborators); the token
 * lives in each user's figma.clientStorage. A collaborator opening a configured
 * file therefore gets a config with no `accessToken` and must add their own
 * before the plugin can sync.
 */
export function needsGitHubToken(
  config: GitHubConfig | null | undefined
): config is GitHubConfig {
  return Boolean(config) && !config?.accessToken;
}
