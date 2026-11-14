// Finds the folder a repository keeps its design tokens in, for the setup
// wizard's "Token Storage Path". The wizard used to offer Wylie Dog's own folder
// to everyone, so a repository with tokens anywhere else failed with "not found".

/** Wylie Dog's token folder (also the one fork inherits). */
export const WYLIE_DOG_FOLDER = "packages/tokens/io/sync";
export const DEFAULT_FOLDER = "tokens";

/** Folders checked, in order, when the repository has no resolver file. */
const KNOWN_FOLDERS = [
  WYLIE_DOG_FOLDER,
  "tokens",
  "design-tokens",
  "src/tokens",
  "packages/tokens",
  "design/tokens",
];

export interface TokenFolder {
  /** The folder with a trailing slash, as the wizard shows it. */
  path: string;
  /**
   * How it was chosen: `current` (the path already set holds files),
   * `resolver` (a tokens.resolver.json is there), `known-folder` (JSON files
   * in a conventional folder) or `none` (nothing found: the default).
   */
  found: "current" | "resolver" | "known-folder" | "none";
  /**
   * JSON token files directly in the folder (the resolver file not counted):
   * what "found" can name, so the wizard can say what it found. 0 when none.
   */
  tokenFiles: number;
}

const withSlash = (folder: string) => `${folder}/`;

/** JSON files directly in `folder`, not counting the resolver. */
function countTokenFiles(files: string[], folder: string): number {
  return files.filter(
    (p) =>
      p.startsWith(`${folder}/`) &&
      p.endsWith(".json") &&
      !p.slice(folder.length + 1).includes("/") &&
      !p.endsWith("/tokens.resolver.json")
  ).length;
}
const trim = (path: string) => path.replace(/^\/+|\/+$/g, "");
const dirOf = (path: string) => path.slice(0, path.lastIndexOf("/"));

/**
 * Pick the token folder from the repository's file paths. `current` is the path
 * already in the form (a saved setup's, or the default): it is kept when the
 * repository has files under it.
 */
export function chooseTokenFolder(
  paths: string[],
  current?: string
): TokenFolder {
  const files = paths.filter((p) => !p.endsWith("/"));
  const keep = current ? trim(current) : "";

  if (keep && files.some((p) => p.startsWith(`${keep}/`))) {
    return {
      path: withSlash(keep),
      found: "current",
      tokenFiles: countTokenFiles(files, keep),
    };
  }

  // A resolver file marks the token folder; the folder it is in must not be the
  // root (token paths are folders inside the repository).
  const resolverDirs = files
    .filter((p) => p.endsWith("/tokens.resolver.json"))
    .map(dirOf)
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
  if (resolverDirs.length > 0) {
    const dir = resolverDirs.includes(WYLIE_DOG_FOLDER)
      ? WYLIE_DOG_FOLDER
      : resolverDirs[0];
    return {
      path: withSlash(dir),
      found: "resolver",
      tokenFiles: countTokenFiles(files, dir),
    };
  }

  for (const folder of KNOWN_FOLDERS) {
    const direct = files.some(
      (p) =>
        p.startsWith(`${folder}/`) &&
        p.endsWith(".json") &&
        !p.slice(folder.length + 1).includes("/")
    );
    if (direct) {
      return {
        path: withSlash(folder),
        found: "known-folder",
        tokenFiles: countTokenFiles(files, folder),
      };
    }
  }

  return { path: withSlash(DEFAULT_FOLDER), found: "none", tokenFiles: 0 };
}

type FetchLike = (
  url: string,
  init: { headers: Record<string, string> }
) => Promise<{ ok: boolean; json(): Promise<unknown> }>;

/**
 * Look inside a repository (one request for its whole file tree) and choose
 * its token folder. Returns null when the repository could not be read, so the
 * caller can say so and leave the path to the user.
 */
export async function findTokenFolder(
  repository: { owner: string; repo: string; branch: string; token: string },
  current?: string,
  fetchFn: FetchLike = fetch as unknown as FetchLike
): Promise<TokenFolder | null> {
  try {
    const { owner, repo, branch, token } = repository;
    const response = await fetchFn(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      tree?: Array<{ path?: string; type?: string }>;
    };
    if (!Array.isArray(body.tree)) return null;
    const paths = body.tree
      .filter(
        (entry) => entry.type === "blob" && typeof entry.path === "string"
      )
      .map((entry) => entry.path as string);
    return chooseTokenFolder(paths, current);
  } catch {
    return null;
  }
}
