/**
 * Parses a GitHub repository URL into owner and repo components
 *
 * Supports formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - github.com/owner/repo
 * - owner/repo
 *
 * @param url - GitHub repository URL or path
 * @returns Object with owner and repo, or null if invalid
 */
export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Trim whitespace
  const trimmed = url.trim();

  // Remove .git suffix if present
  const withoutGit = trimmed.replace(/\.git$/i, "");

  // Try to extract owner/repo from various formats
  const patterns = [
    // https://github.com/owner/repo
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)/i,
    // github.com/owner/repo
    /^github\.com\/([^\/]+)\/([^\/]+)/i,
    // owner/repo (simple format)
    /^([^\/\s]+)\/([^\/\s]+)$/,
  ];

  for (const pattern of patterns) {
    const match = withoutGit.match(pattern);
    if (match) {
      const [, owner, repo] = match;
      if (owner && repo) {
        return {
          owner: owner.trim(),
          repo: repo.trim(),
        };
      }
    }
  }

  return null;
}

/**
 * Validates if a string looks like a GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
