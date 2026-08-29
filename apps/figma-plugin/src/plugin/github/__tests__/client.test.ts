import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ExportData } from "../../variables/processor";
import type { GitHubConfig } from "../../../shared/types";

// Mock the Octokit constructor so `new Octokit(...)` in GitHubClient returns
// a controllable fake with the git/repos/pulls/users methods this module
// touches. Declared with the `mock` prefix so vi.mock's hoisting is safe.
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

function makeClient(): GitHubClient {
  const client = new GitHubClient();
  client.configure(baseConfig);
  return client;
}

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

describe("GitHubClient pull-request sync", () => {
  it("does not touch deleteRef and returns success when every file updates cleanly", async () => {
    const client = makeClient();
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
    const client = makeClient();
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
    const client = makeClient();
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
