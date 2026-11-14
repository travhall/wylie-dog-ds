import { describe, expect, it } from "vitest";
import {
  describeRepositoryStatus,
  parseRepositoryInput,
} from "../repository-input";

describe("parseRepositoryInput", () => {
  it("splits owner/repo", () => {
    expect(parseRepositoryInput("travhall/acme-tokens-dry-run")).toEqual({
      owner: "travhall",
      repo: "acme-tokens-dry-run",
    });
  });

  it("reads a web address, with or without scheme, .git or a trailing slash", () => {
    for (const text of [
      "https://github.com/travhall/acme-tokens-dry-run",
      "http://github.com/travhall/acme-tokens-dry-run/",
      "github.com/travhall/acme-tokens-dry-run",
      "https://www.github.com/travhall/acme-tokens-dry-run.git",
      "https://github.com/travhall/acme-tokens-dry-run?tab=readme",
    ]) {
      expect(parseRepositoryInput(text), text).toEqual({
        owner: "travhall",
        repo: "acme-tokens-dry-run",
      });
    }
  });

  it("reads a clone address", () => {
    expect(
      parseRepositoryInput("git@github.com:travhall/acme-tokens-dry-run.git")
    ).toEqual({ owner: "travhall", repo: "acme-tokens-dry-run" });
  });

  it("takes the branch from a /tree/ address", () => {
    expect(
      parseRepositoryInput("https://github.com/travhall/repo/tree/feat%2Fx")
    ).toEqual({ owner: "travhall", repo: "repo", branch: "feat/x" });
  });

  it("keeps dots inside a repository name", () => {
    expect(parseRepositoryInput("acme/design.tokens")).toEqual({
      owner: "acme",
      repo: "design.tokens",
    });
  });

  it("leaves a plain name, an empty box and other text alone", () => {
    expect(parseRepositoryInput("acme-tokens-dry-run")).toBeNull();
    expect(parseRepositoryInput("   ")).toBeNull();
    expect(parseRepositoryInput("https://example.com/a/b")).toBeNull();
  });
});

describe("describeRepositoryStatus", () => {
  it("names the cause of the common failures", () => {
    expect(describeRepositoryStatus(401)).toContain("token");
    expect(describeRepositoryStatus(404)).toContain("private");
    expect(describeRepositoryStatus(404)).toContain("repo scope");
    expect(describeRepositoryStatus(403)).toContain("rate limit");
    expect(describeRepositoryStatus(500)).toContain("HTTP 500");
  });
});
