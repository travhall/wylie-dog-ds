// Every docs link the plugin opens must land on a real heading in the user docs.
// The links used to point at files that did not exist (slice 3.1) and at a
// path in the wrong repository (the Help menu), so this guards against both.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { docsLinkFor } from "../EnhancedErrorDisplay";
import type { FailureKind } from "../../../shared/sync-failure";

const DOCS = resolve(__dirname, "../../../../docs");
const PREFIX =
  "https://github.com/travhall/wylie-dog-ds/blob/main/apps/figma-plugin/docs/";

/** GitHub's heading anchor: lower case, punctuation dropped, spaces to hyphens. */
const slug = (heading: string) =>
  heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, "")
    .replace(/ /g, "-");

function headingsOf(file: string): Set<string> {
  const text = readFileSync(resolve(DOCS, file), "utf8");
  return new Set(
    [...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map((match) => slug(match[1]))
  );
}

const KINDS: FailureKind[] = [
  "token-rejected",
  "no-access",
  "rate-limited",
  "repo-not-found",
  "folder-not-found",
  "file-not-found",
  "not-found",
  "branch-moved",
  "offline",
  "bad-file",
  "other",
];

describe("docs links", () => {
  it.each(KINDS)("the link for %s lands on a heading", (kind) => {
    const link = docsLinkFor(kind);
    if (link === null) return; // some failures have no docs section, on purpose
    expect(link.startsWith(PREFIX)).toBe(true);
    const [file, anchor] = link.slice(PREFIX.length).split("#");
    expect(headingsOf(file).has(anchor), `${file}#${anchor}`).toBe(true);
  });

  it("covers the anchors the generic error help opens", () => {
    // getDocsLink in EnhancedErrorDisplay, for errors with no classified kind
    for (const [file, anchor] of [
      ["FORMATS.md", "supported-formats"],
      ["SETUP.md", "create-a-github-token"],
      ["SETUP.md", "find-the-token-folder"],
      ["SYNC.md", "review-before-anything-is-written"],
    ]) {
      expect(headingsOf(file).has(anchor), `${file}#${anchor}`).toBe(true);
    }
  });
});
