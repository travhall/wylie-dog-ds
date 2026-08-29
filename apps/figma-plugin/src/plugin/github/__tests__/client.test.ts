import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Octokit mock ────────────────────────────────────────────────────────
// GitHubClient constructs `new Octokit(...)` internally (in configure()),
// so we mock the module and expose the individual method mocks used by
// pushFiles() for assertions/return-value control per test.
const mockGetAuthenticated = vi.fn();
const mockGetContent = vi.fn();
const mockGetRef = vi.fn();
const mockGetCommit = vi.fn();
const mockCreateBlob = vi.fn();
const mockCreateTree = vi.fn();
const mockCreateCommit = vi.fn();
const mockUpdateRef = vi.fn();

vi.mock("@octokit/rest", () => {
  class MockOctokit {
    users = { getAuthenticated: mockGetAuthenticated };
    repos = { getContent: mockGetContent, get: vi.fn() };
    git = {
      getRef: mockGetRef,
      getCommit: mockGetCommit,
      createBlob: mockCreateBlob,
      createTree: mockCreateTree,
      createCommit: mockCreateCommit,
      updateRef: mockUpdateRef,
    };
    pulls = { create: vi.fn() };
  }
  return { Octokit: MockOctokit };
});

// Import after the mock so GitHubClient picks up the mocked Octokit.
const { GitHubClient } = await import("../client");

function toB64(content: string): string {
  return Buffer.from(content, "utf-8").toString("base64");
}

function makeClient() {
  const client = new GitHubClient();
  client.configure({
    owner: "wylie-dog",
    repo: "design-tokens",
    branch: "main",
    tokenPath: "tokens",
    syncMode: "direct",
    accessToken: "fake-token",
  });
  return client;
}

describe("GitHubClient.pushFiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    mockGetCommit.mockResolvedValue({ data: { tree: { sha: "base-tree" } } });
  });

  it("returns { changed: false } and makes no commit API calls when no file content changed", async () => {
    mockGetContent.mockResolvedValue({
      data: { content: toB64("unchanged content"), encoding: "base64" },
    });

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "unchanged content" }],
      "chore: sync tokens"
    );

    expect(result).toEqual({ changed: false });
    expect(mockCreateBlob).not.toHaveBeenCalled();
    expect(mockCreateTree).not.toHaveBeenCalled();
    expect(mockCreateCommit).not.toHaveBeenCalled();
    expect(mockUpdateRef).not.toHaveBeenCalled();
  });

  it("creates exactly one blob/tree/commit and updates the ref when a file changed", async () => {
    mockGetContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockCreateBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockCreateTree.mockResolvedValue({ data: { sha: "tree-sha" } });
    mockCreateCommit.mockResolvedValue({ data: { sha: "commit-sha" } });
    mockUpdateRef.mockResolvedValue({});

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "new content" }],
      "chore: sync tokens"
    );

    expect(mockCreateBlob).toHaveBeenCalledTimes(1);
    expect(mockCreateTree).toHaveBeenCalledTimes(1);
    expect(mockCreateCommit).toHaveBeenCalledTimes(1);
    expect(mockUpdateRef).toHaveBeenCalledTimes(1);
    expect(mockUpdateRef).toHaveBeenCalledWith(
      expect.objectContaining({ sha: "commit-sha", force: false })
    );
    expect(result).toEqual({ changed: true, ref: "commit-sha" });
  });

  it("retries once via rebase when updateRef fails with a 422 non-fast-forward, then succeeds", async () => {
    mockGetContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockCreateBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockCreateTree
      .mockResolvedValueOnce({ data: { sha: "tree-sha" } })
      .mockResolvedValueOnce({ data: { sha: "rebased-tree-sha" } });
    mockCreateCommit
      .mockResolvedValueOnce({ data: { sha: "commit-sha" } })
      .mockResolvedValueOnce({ data: { sha: "rebased-commit-sha" } });
    // First updateRef call rejects with a non-fast-forward 422, second succeeds.
    mockUpdateRef
      .mockRejectedValueOnce({
        status: 422,
        message: "Update is not a fast forward",
      })
      .mockResolvedValueOnce({});
    // Second getRef/getCommit pair (the rebase re-fetch) reports a new HEAD.
    mockGetRef
      .mockResolvedValueOnce({ data: { object: { sha: "base-sha" } } })
      .mockResolvedValueOnce({ data: { object: { sha: "raced-ahead-sha" } } });
    mockGetCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "base-tree" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "raced-ahead-tree" } } });

    const client = makeClient();
    const result = await client.pushFiles(
      [{ filename: "primitive.json", content: "new content" }],
      "chore: sync tokens"
    );

    expect(mockUpdateRef).toHaveBeenCalledTimes(2);
    expect(mockCreateTree).toHaveBeenCalledTimes(2);
    expect(mockCreateCommit).toHaveBeenCalledTimes(2);
    expect(mockUpdateRef).toHaveBeenLastCalledWith(
      expect.objectContaining({ sha: "rebased-commit-sha", force: false })
    );
    expect(result).toEqual({ changed: true, ref: "rebased-commit-sha" });
  });

  it("throws a clear error when the rebase-retry also fails (two concurrent writes in a row)", async () => {
    mockGetContent.mockResolvedValue({
      data: { content: toB64("old content"), encoding: "base64" },
    });
    mockCreateBlob.mockResolvedValue({ data: { sha: "blob-sha" } });
    mockCreateTree.mockResolvedValue({ data: { sha: "tree-sha" } });
    mockCreateCommit.mockResolvedValue({ data: { sha: "commit-sha" } });
    mockUpdateRef.mockRejectedValue({
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
