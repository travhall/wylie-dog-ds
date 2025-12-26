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
export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
  branch: string;
  tokenPath: string;
}

const DEFAULT_BRANCH = "main";

export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Normalize certain prefixes so URL parsing works consistently
  const normalizedInput = (() => {
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    if (/^github\.com\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return trimmed;
  })();

  const parseSegments = (segments: string[]): ParsedGitHubUrl | null => {
    if (segments.length < 2) return null;

    const owner = segments[0];
    const repo = segments[1].replace(/\.git$/i, "");
    if (!owner || !repo) return null;

    let branch = DEFAULT_BRANCH;
    let tokenPath = "";

    if (segments[2] === "tree" && segments[3]) {
      branch = segments[3];
      tokenPath =
        segments.length > 4
          ? segments.slice(4).join("/").replace(/\/+$/, "")
          : "";
    }

    return {
      owner: owner.trim(),
      repo: repo.trim(),
      branch: branch.trim(),
      tokenPath,
    };
  };

  try {
    if (/^https?:\/\//i.test(normalizedInput)) {
      const urlObj = new URL(normalizedInput);
      if (!/github\.com$/i.test(urlObj.hostname)) return null;

      const segments = urlObj.pathname.split("/").filter(Boolean);
      return parseSegments(segments);
    }
  } catch (err) {
    // Fall through to simple parsing below
  }

  const simpleSegments = normalizedInput.split("/").filter(Boolean);
  return parseSegments(simpleSegments);
}

/**
 * Validates if a string looks like a GitHub repository URL
 */
export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
