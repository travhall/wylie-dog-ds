import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExportData } from "../../variables/processor";
import type { GitHubConfig } from "../../../shared/types";

// ─── Octokit mock ────────────────────────────────────────────────────────
// GitHubClient constructs `new Octokit(...)` internally (in configure()),
// so we mock the module and expose a single shared mock object covering
// every method group `client.ts` calls (used by both the pushFiles() tests
// and the pull-request sync tests below). Declared with vi.hoisted so
// vi.mock's hoisting is safe.
const mockOctokit = vi.hoisted(() => ({
  users: {
    getAuthenticated: vi.fn(),
  },
  repos: {
    get: vi.fn(),
    getContent: vi.fn(),
    createOrUpdateFileContents: vi.fn(),
  },
  git: {
    getRef: vi.fn(),
    getCommit: vi.fn(),
    createBlob: vi.fn(),
    createTree: vi.fn(),
    createCommit: vi.fn(),
    updateRef: vi.fn(),
    createRef: vi.fn(),
    deleteRef: vi.fn(),
  },
  pulls: {
    create: vi.fn(),
  },
}));

vi.mock("@octokit/rest", () => ({
  Octokit: vi.fn().mockImplementation(function Octokit() {
    return mockOctokit;
  }),
}));

import { GitHubClient } from "../client";

function toB64(content: string): string {
  return Buffer.from(content, "utf-8").toString("base64");
}

function makeClient(overrides: Partial<GitHubConfig> = {}) {
  const client = new GitHubClient();
  client.configure({
    owner: "wylie-dog",
    repo: "design-tokens",
    branch: "main",
    tokenPath: "tokens",
    syncMode: "direct",
    accessToken: "fake-token",
    ...overrides,
  });
  return client;
}

describe("GitHubClient.pushFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOctokit.git.getRef.mockResolvedValue({
      data: { object: { sha: "base-sha" } },
    });
    mockOctokit.git.getCommit.mockResolvedValue({
      data: { tree: { sha: "base-tree" } },
    });
  });

  it("returns { changed: false } and makes no commit API calls when no file content changed", async () => {
    mockOctokit.repos.getContent.mockResolvedValue({
      data: { content: toB64("unchanged content"), encoding: "base64" },
    });

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "unchanged content" }],
      "chore: sync tokens"
    );

    expect(result).toEqual({ changed: false });
    expect(mockOctokit.git.createBlob).not.toHaveBeenCalled();
    expect(mockOctokit.git.createTree).not.toHaveBeenCalled();
    expect(mockOctokit.git.createCommit).not.toHaveBeenCalled();
    expect(mockOctokit.git.updateRef).not.toHaveBeenCalled();
  });

  it("creates exactly one blob/tree/commit and updates the ref when a file changed", async () => {
    mockOctokit.repos.getContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockOctokit.git.createBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockOctokit.git.createTree.mockResolvedValue({ data: { sha: "tree-sha" } });
    mockOctokit.git.createCommit.mockResolvedValue({
      data: { sha: "commit-sha" },
    });
    mockOctokit.git.updateRef.mockResolvedValue({});

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "new content" }],
      "chore: sync tokens"
    );

    expect(mockOctokit.git.createBlob).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.createTree).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.createCommit).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.updateRef).toHaveBeenCalledTimes(1);
    expect(mockOctokit.git.updateRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: "commit-sha", force: false })
    );
    expect(result).toEqual({ changed: true, ref: "commit-sha" });
  });

  it("retries once via rebase when updateRef fails with a 422 non-fast-forward, then succeeds", async () => {
    mockOctokit.repos.getContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockOctokit.git.createBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockOctokit.git.createTree
      .mockResolvedValueOnce({ data: { sha: "tree-sha" } })
      .mockResolvedValueOnce({ data: { sha: "rebased-tree-sha" } });
    mockOctokit.git.createCommit
      .mockResolvedValueOnce({ data: { sha: "commit-sha" } })
      .mockResolvedValueOnce({ data: { sha: "rebased-commit-sha" } });
    // First updateRef call rejects with a non-fast-forward 422, second succeeds.
    mockOctokit.git.updateRef
      .mockRejectedValueOnce({
        status: 422,
        message: "Update is not a fast forward",
      })
      .mockResolvedValueOnce({});
    // Second getRef/getCommit pair (the rebase re-fetch) reports a new HEAD.
    mockOctokit.git.getRef
      .mockResolvedValueOnce({ data: { object: { sha: "base-sha" } } })
      .mockResolvedValueOnce({ data: { object: { sha: "raced-ahead-sha" } } });
    mockOctokit.git.getCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "base-tree" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "raced-ahead-tree" } } });

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "new content" }],
      "chore: sync tokens"
    );

    expect(mockOctokit.git.updateRef).toHaveBeenCalledTimes(2);
    expect(mockOctokit.git.createTree).toHaveBeenCalledTimes(2);
    expect(mockOctokit.git.createCommit).toHaveBeenCalledTimes(2);
    expect(mockOctokit.git.updateRef).toHaveBeenLastCalledWith(
      expect.objectContaining({ sha: "rebased-commit-sha", force: false })
    );
    expect(result).toEqual({ changed: true, ref: "rebased-commit-sha" });
  });

  it("throws a clear error when the rebase-retry also fails (two concurrent writes in a row)", async () => {
    mockOctokit.repos.getContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockOctokit.git.createBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockOctokit.git.createTree.mockResolvedValue({ data: { sha: "tree-sha" } });
    mockOctokit.git.createCommit.mockResolvedValue({
      data: { sha: "commit-sha" },
    });
    mockOctokit.git.updateRef.mockRejectedValue({
      status: 422,
      message: "Update is not a fast forward",
    });

    const client = makeClient();
    await expect(
      client.pushFiles(
        [{ filename: "primitive.json", content: "new content" }],
        "chore: sync tokens"
      )
    ).rejects.toThrow(/Branch has new commits since push started/);
  });
});

function collection(name: string): ExportData {
  return {
    [name]: {
      variables: {
        color: { $type: "color", $value: "#ff0000" },
      },
    },
  };
}

const baseConfig: GitHubConfig = {
  owner: "wylie-dog",
  repo: "tokens-repo",
  branch: "main",
  tokenPath: "tokens",
  accessToken: "fake-token",
  syncMode: "pull-request",
};

/** getContent's 404 makes updateFile() take the "create new file" branch. */
const notFoundError = Object.assign(new Error("Not Found"), { status: 404 });

function makePrClient(): GitHubClient {
  const client = new GitHubClient();
  client.configure(baseConfig);
  return client;
}

describe("GitHubClient pull-request sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockOctokit.git.getRef.mockResolvedValue({
      data: { object: { sha: "base-sha" } },
    });
    mockOctokit.git.createRef.mockResolvedValue({});
    mockOctokit.git.deleteRef.mockResolvedValue({});
    mockOctokit.repos.getContent.mockRejectedValue(notFoundError);
    mockOctokit.repos.createOrUpdateFileContents.mockResolvedValue({});
    mockOctokit.pulls.create.mockResolvedValue({
      data: { html_url: "https://github.com/wylie-dog/tokens-repo/pull/1" },
    });
  });

  it("does not touch deleteRef and returns success when every file updates cleanly", async () => {
    const client = makePrClient();
    const exportData = [collection("colors"), collection("spacing")];

    const result = await client.syncTokens(exportData, "chore: update tokens");

    expect(result.success).toBe(true);
    expect(result.pullRequestUrl).toBe(
      "https://github.com/wylie-dog/tokens-repo/pull/1"
    );
    expect(result.filesUpdated).toEqual([
      "tokens/colors.json",
      "tokens/spacing.json",
    ]);
    expect(mockOctokit.git.deleteRef).not.toHaveBeenCalled();
    expect(mockOctokit.pulls.create).toHaveBeenCalledTimes(1);
  });

  it("deletes the branch it just created and propagates the original error when the 2nd of 3 file updates fails", async () => {
    const client = makePrClient();
    const exportData = [
      collection("colors"),
      collection("spacing"),
      collection("typography"),
    ];

    const updateError = new Error("network error updating spacing.json");
    // File 1 (colors): getContent 404s -> create path succeeds.
    // File 2 (spacing): getContent 404s -> create path throws.
    // File 3 (typography): never reached.
    mockOctokit.repos.createOrUpdateFileContents
      .mockResolvedValueOnce({}) // colors.json created
      .mockRejectedValueOnce(updateError); // spacing.json fails

    const result = await client.syncTokens(exportData, "chore: update tokens");

    expect(result.success).toBe(false);
    expect(result.error).toBe(updateError.message);

    expect(mockOctokit.git.deleteRef).toHaveBeenCalledTimes(1);
    const [deleteRefArgs] = mockOctokit.git.deleteRef.mock.calls[0];
    expect(deleteRefArgs).toMatchObject({
      owner: "wylie-dog",
      repo: "tokens-repo",
    });
    expect(deleteRefArgs.ref).toMatch(/^heads\/token-bridge-update-/);

    // Only the two files attempted before the failure were touched.
    expect(mockOctokit.repos.createOrUpdateFileContents).toHaveBeenCalledTimes(
      2
    );
    expect(mockOctokit.pulls.create).not.toHaveBeenCalled();
  });

  it("still propagates the original update error, not the cleanup error, when deleteRef itself throws", async () => {
    const client = makePrClient();
    const exportData = [collection("colors"), collection("spacing")];

    const updateError = new Error("permissions changed mid-sync");
    mockOctokit.repos.createOrUpdateFileContents.mockRejectedValueOnce(
      updateError
    );
    mockOctokit.git.deleteRef.mockRejectedValueOnce(
      new Error("branch already deleted")
    );

    const result = await client.syncTokens(exportData, "chore: update tokens");

    expect(result.success).toBe(false);
    expect(result.error).toBe(updateError.message);
    expect(mockOctokit.git.deleteRef).toHaveBeenCalledTimes(1);
    expect(mockOctokit.pulls.create).not.toHaveBeenCalled();
  });
});
