// Which of this project's conventions Token Bridge applies to a Figma file.
//
// The token contract (documentation/tokens/dtcg-contract.md) fixes only the file
// format. A few behaviours are Wylie Dog's own choices on top of it, and are right
// only for a repository that follows them:
//
//   - Figma variable scopes inferred from token names (color.background.* fills,
//     a palette hidden from every picker, line height and opacity hidden)
//   - collections named primitive and components hidden from publishing
//
// A repository that is not a Wylie Dog project gets none of that: variables get the
// scope their type implies, a scope a designer set is never overwritten, and no
// collection is hidden from publishing.

import type { GitHubConfig } from "../shared/types";
import { WYLIE_DOG_TOKEN_PATH } from "./github/project-detector";

export type Conventions = "wylie-dog" | "none";

const trimSlashes = (path: string) => path.replace(/^\/+|\/+$/g, "");

/**
 * The conventions for a repository: an explicit `isWylieDogProject` in the saved
 * config decides; without one, the Wylie Dog token folder does. A fork of this
 * repository keeps that folder, so it keeps the conventions it inherited.
 */
export function conventionsFor(
  config:
    Pick<GitHubConfig, "tokenPath" | "isWylieDogProject"> | null | undefined
): Conventions {
  if (!config) return "none";
  if (config.isWylieDogProject !== undefined) {
    return config.isWylieDogProject ? "wylie-dog" : "none";
  }
  return trimSlashes(config.tokenPath) === trimSlashes(WYLIE_DOG_TOKEN_PATH)
    ? "wylie-dog"
    : "none";
}
