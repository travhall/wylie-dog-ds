import { describe, expect, it } from "vitest";
import { classifyFailure } from "../sync-failure";

const http = (
  status: number,
  headers: Record<string, string> = {},
  message = `HTTP ${status}`
) => Object.assign(new Error(message), { status, response: { headers } });

const ctx = {
  repo: "acme/tokens",
  branch: "main",
  folder: "design/",
};

describe("classifyFailure", () => {
  it("401 means the token was rejected, and the fix is a new token", () => {
    const f = classifyFailure(http(401), ctx);
    expect(f).toMatchObject({
      kind: "token-rejected",
      action: "new-token",
      status: 401,
    });
    expect(f.message).toMatch(/rejected your access token/);
  });

  it("recognises bad credentials by text when there is no status", () => {
    expect(classifyFailure(new Error("Bad credentials")).kind).toBe(
      "token-rejected"
    );
  });

  it("403 with an exhausted rate limit gives the reset time, not a permissions message", () => {
    const resetAt = 1_800_000_000;
    const f = classifyFailure(
      http(403, {
        "x-ratelimit-remaining": "0",
        "x-ratelimit-reset": String(resetAt),
      }),
      ctx
    );
    expect(f.kind).toBe("rate-limited");
    expect(f.action).toBe("wait");
    expect(f.retryAt).toBe(new Date(resetAt * 1000).toISOString());
    expect(f.message).toMatch(
      /^GitHub's rate limit was reached\. Try again at /
    );
  });

  it("429 and Retry-After are rate limits too", () => {
    const now = Date.parse("2026-11-14T12:00:00Z");
    const f = classifyFailure(http(429, { "retry-after": "90" }), ctx, now);
    expect(f.kind).toBe("rate-limited");
    expect(f.retryAt).toBe("2026-11-14T12:01:30.000Z");
  });

  it("a rate limit with no time still says to wait", () => {
    const f = classifyFailure(
      http(403, {}, "API rate limit exceeded for user"),
      ctx
    );
    expect(f.kind).toBe("rate-limited");
    expect(f.retryAt).toBeUndefined();
    expect(f.message).toMatch(/Wait a few minutes/);
  });

  it("other 403s say what a private repository needs of the token", () => {
    const f = classifyFailure(http(403), ctx);
    expect(f.kind).toBe("no-access");
    expect(f.action).toBe("new-token");
    expect(f.message).toContain("acme/tokens");
    expect(f.message).toContain("repo scope");
    expect(f.message).toContain("fine-grained");
  });

  it("404 means the repository, the folder or the file, by what was being read", () => {
    const repo = classifyFailure(http(404), { ...ctx, stage: "repo" });
    expect(repo.kind).toBe("repo-not-found");
    expect(repo.message).toContain("acme/tokens");
    expect(repo.action).toBe("edit-setup");

    const folder = classifyFailure(http(404), { ...ctx, stage: "folder" });
    expect(folder.kind).toBe("folder-not-found");
    expect(folder.message).toContain('"design/"');
    expect(folder.message).toContain("on main");

    const file = classifyFailure(
      new Error("Failed to fetch palette.json: HTTP 404"),
      { ...ctx, stage: "file" }
    );
    expect(file.kind).toBe("file-not-found");
    expect(file.message).toContain("palette.json");
  });

  it("a 404 with no stage says what could be missing, never 'check the token file path' advice", () => {
    const f = classifyFailure(http(404), { repo: "acme/tokens" });
    expect(f.kind).toBe("not-found");
    expect(f.message).toMatch(
      /repository, branch or token folder in acme\/tokens/
    );
  });

  it("recognises this plugin's own not-found errors by text", () => {
    expect(
      classifyFailure(
        new Error("design/ is not a directory in the repository"),
        ctx
      ).kind
    ).toBe("folder-not-found");
    expect(
      classifyFailure(new Error("Repository not found or no access"), ctx).kind
    ).toBe("repo-not-found");
  });

  it("a moved branch is retryable", () => {
    for (const error of [
      http(422),
      http(409),
      new Error("Branch has new commits since sync started. Please try again"),
    ]) {
      const f = classifyFailure(error, ctx);
      expect(f.kind).toBe("branch-moved");
      expect(f.action).toBe("retry");
      expect(f.message).toMatch(/Nothing was lost/);
    }
  });

  it("a file that is not JSON names the file and offers no retry", () => {
    const f = classifyFailure(
      new Error("Failed to parse palette.json: Unexpected token } in JSON"),
      ctx
    );
    expect(f.kind).toBe("bad-file");
    expect(f.message).toContain("palette.json");
    expect(f.action).toBeUndefined();
  });

  it("names the file when the repository's own resolver is not valid JSON", () => {
    const f = classifyFailure(
      new Error(
        "tokens.resolver.json in the repository is not valid JSON. Fix it, then push again."
      ),
      ctx
    );
    expect(f.kind).toBe("bad-file");
    expect(f.message).toContain("tokens.resolver.json");
  });

  it("does not take a file name that ends in .json for a parse error", () => {
    const f = classifyFailure(
      new Error("network error updating spacing.json"),
      ctx
    );
    expect(f.kind).not.toBe("bad-file");
  });

  it("a request that got no answer is offline", () => {
    for (const error of [
      new TypeError("Failed to fetch"),
      new Error("NetworkError when attempting to fetch resource."),
    ]) {
      const f = classifyFailure(error, ctx);
      expect(f.kind).toBe("offline");
      expect(f.action).toBe("retry");
    }
  });

  it("does not take a number inside some other message for an HTTP status", () => {
    // used to be sorted as an authentication error because it contains "401"
    const f = classifyFailure(
      new Error("Imported 1401 tokens, 3 skipped"),
      ctx
    );
    expect(f.kind).toBe("other");
    expect(f.status).toBeUndefined();
  });

  it("keeps the original text as the technical detail, and handles non-errors", () => {
    expect(classifyFailure(http(401, {}, "Bad credentials")).detail).toBe(
      "Bad credentials"
    );
    expect(classifyFailure("boom").detail).toBe("boom");
    expect(classifyFailure(undefined).kind).toBe("other");
  });
});
