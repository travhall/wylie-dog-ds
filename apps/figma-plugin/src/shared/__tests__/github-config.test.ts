import { describe, expect, it } from "vitest";
import { needsGitHubToken } from "../github-config";
import type { GitHubConfig } from "../types";

const repo = {
  owner: "o",
  repo: "r",
  branch: "main",
  tokenPath: "tokens",
} as unknown as GitHubConfig;

describe("needsGitHubToken", () => {
  it("is true for repo settings without a token (collaborator opens a configured file)", () => {
    expect(needsGitHubToken(repo)).toBe(true);
  });

  it("is true for an empty-string token", () => {
    expect(needsGitHubToken({ ...repo, accessToken: "" })).toBe(true);
  });

  it("is false when the user has a token", () => {
    expect(needsGitHubToken({ ...repo, accessToken: "ghp_x" })).toBe(false);
  });

  it("is false when there is no config at all (fresh setup, not a token problem)", () => {
    expect(needsGitHubToken(null)).toBe(false);
    expect(needsGitHubToken(undefined)).toBe(false);
  });
});
