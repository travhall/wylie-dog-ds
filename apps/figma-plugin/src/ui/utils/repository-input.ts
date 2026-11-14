// What a person types into the setup wizard's Repository box, turned into the
// owner and repository name GitHub's API wants.
//
// People paste what they have: `owner/repo`, the repository's web address, or a
// clone address. The wizard has a separate Owner box, so a pasted `owner/repo`
// in the Repository box used to ask GitHub for `owner/owner/repo` and fail.

export interface ParsedRepository {
  owner: string;
  repo: string;
  /** A branch named by a /tree/<branch> web address. */
  branch?: string;
}

const NAME = "[A-Za-z0-9_.-]+";

/**
 * `owner/repo`, `https://github.com/owner/repo`, `.../repo.git`,
 * `.../repo/tree/branch` or `git@github.com:owner/repo.git`. Returns null for a
 * plain repository name (nothing to split) or anything else.
 */
export function parseRepositoryInput(input: string): ParsedRepository | null {
  const text = input.trim();
  if (!text) return null;

  const web = new RegExp(
    `^(?:https?://)?(?:www\\.)?github\\.com/(${NAME})/(${NAME}?)(?:\\.git)?(?:/tree/([^?#\\s]+))?/?(?:[?#].*)?$`
  ).exec(text);
  if (web) return clean(web[1], web[2], web[3]);

  const ssh = new RegExp(
    `^git@github\\.com:(${NAME})/(${NAME}?)(?:\\.git)?$`
  ).exec(text);
  if (ssh) return clean(ssh[1], ssh[2]);

  const pair = new RegExp(`^(${NAME})/(${NAME}?)(?:\\.git)?/?$`).exec(text);
  if (pair) return clean(pair[1], pair[2]);

  return null;
}

function clean(owner: string, repo: string, branch?: string): ParsedRepository {
  return {
    owner,
    repo,
    ...(branch ? { branch: decodeURIComponent(branch) } : {}),
  };
}

/** A plain-language reason for a repository check that GitHub answered with `status`. */
export function describeRepositoryStatus(status: number): string {
  switch (status) {
    case 401:
      return "GitHub rejected the access token. Go back and check it.";
    case 403:
      return "GitHub refused the request. The token may lack access to this repository, or the rate limit was hit; try again in a minute.";
    case 404:
      return "Repository not found. Check the owner and name. For a private repository the token needs access to it: a classic token needs the repo scope, a fine-grained token needs this repository selected.";
    default:
      return `GitHub answered with an error (HTTP ${status}).`;
  }
}
