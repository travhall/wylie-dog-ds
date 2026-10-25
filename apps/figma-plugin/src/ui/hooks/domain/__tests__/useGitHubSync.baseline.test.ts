import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/preact";
import { useGitHubSync } from "../useGitHubSync";
import { hashTokens } from "../../../../plugin/sync/sync-baseline";
import {
  setPendingRemoteHashes,
  takePendingRemoteHashes,
} from "../../../utils/pending-sync-hashes";
import type { ConflictAwareGitHubClient } from "../../../../plugin/sync/conflict-aware-github-client";
import type { PluginMessageActions } from "../../usePluginMessages";
import type { ExportData } from "../../../../plugin/variables/processor";

const tokens = (value: number): ExportData[] => [
  { primitive: { variables: { a: { $type: "number", $value: value } } } },
];

/** Every action is a no-op spy; the sync flow only calls them for UI state. */
const actions = new Proxy({} as PluginMessageActions, {
  get: () => vi.fn(),
});

function setup(client: Record<string, unknown>) {
  return renderHook(() =>
    useGitHubSync(client as unknown as ConflictAwareGitHubClient, actions)
  ).result.current;
}

describe("useGitHubSync: GitHub-side hashes for the sync baseline", () => {
  beforeEach(() => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => cb());
    setPendingRemoteHashes(null);
  });

  afterEach(() => {
    setPendingRemoteHashes(null);
    vi.restoreAllMocks();
  });

  it("a Pull remembers the hashes of the tokens it imports", async () => {
    const pulled = tokens(5);
    const { handleGitHubPull } = setup({
      pullTokens: vi.fn().mockResolvedValue({ success: true, tokens: pulled }),
    });

    await handleGitHubPull();

    expect(takePendingRemoteHashes()).toEqual(hashTokens(pulled));
  });

  it("a failed Pull remembers nothing", async () => {
    const { handleGitHubPull } = setup({
      pullTokens: vi.fn().mockResolvedValue({ success: false, error: "no" }),
    });
    await handleGitHubPull();
    expect(takePendingRemoteHashes()).toBeNull();
  });

  it("a direct Push remembers what GitHub holds afterwards", async () => {
    const onGitHub = tokens(7);
    const { handleGitHubSync } = setup({
      syncTokensWithConflictDetection: vi
        .fn()
        .mockResolvedValue({ success: true }),
      pullTokens: vi
        .fn()
        .mockResolvedValue({ success: true, tokens: onGitHub }),
    });

    await handleGitHubSync(tokens(7));

    expect(takePendingRemoteHashes()).toEqual(hashTokens(onGitHub));
  });

  it("a Push that opens a pull request leaves the baseline alone", async () => {
    const pullTokens = vi.fn();
    const { handleGitHubSync } = setup({
      syncTokensWithConflictDetection: vi.fn().mockResolvedValue({
        success: true,
        pullRequestUrl: "https://example.test/pr/1",
      }),
      pullTokens,
    });

    await handleGitHubSync(tokens(7));

    expect(takePendingRemoteHashes()).toBeNull();
    expect(pullTokens).not.toHaveBeenCalled();
  });

  it("a failed Push remembers nothing", async () => {
    const { handleGitHubSync } = setup({
      syncTokensWithConflictDetection: vi
        .fn()
        .mockResolvedValue({ success: false, error: "nope" }),
      pullTokens: vi.fn(),
    });
    await handleGitHubSync(tokens(7));
    expect(takePendingRemoteHashes()).toBeNull();
  });

  it("a Push whose follow-up fetch fails records no baseline rather than a wrong one", async () => {
    const { handleGitHubSync } = setup({
      syncTokensWithConflictDetection: vi
        .fn()
        .mockResolvedValue({ success: true }),
      pullTokens: vi.fn().mockRejectedValue(new Error("offline")),
    });
    await handleGitHubSync(tokens(7));
    expect(takePendingRemoteHashes()).toBeNull();
  });
});
