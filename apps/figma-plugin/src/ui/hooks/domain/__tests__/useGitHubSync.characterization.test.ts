import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { renderHook } from "@testing-library/preact";
import { useGitHubSync } from "../useGitHubSync";
import { ConflictAwareGitHubClient } from "../../../../plugin/sync/conflict-aware-github-client";
import { GitHubClient } from "../../../../plugin/github/client";
import type { PluginMessageActions } from "../../usePluginMessages";
import type { ExportData } from "../../../../plugin/variables/processor";

/**
 * Plan 200, Step 0. Documents how Pull and Push gate on differences TODAY, so
 * the diff-review work can change them on purpose and visibly:
 *
 *  - Pull never shows a diff or conflicts: it imports GitHub's tokens with the
 *    "replace" strategy straight away (since commit d8a92cbc, 2026-01-22).
 *    The per-token conflict list and the plan 169 post-pull summary only run
 *    for conflictOperationType "pull", which nothing sets any more.
 *  - Push treats ANY Figma/GitHub difference as a conflict and opens the
 *    conflict list, even when only Figma changed.
 */

const tokens = (value: string): ExportData[] => [
  { colors: { variables: { primary: { $type: "color", $value: value } } } },
];

/** Records every action call, by name, so tests can assert what the flow did. */
function recordingActions() {
  const fns = new Map<string, MockInstance>();
  const actions = new Proxy({} as PluginMessageActions, {
    get: (_target, name: string) => {
      if (!fns.has(name)) fns.set(name, vi.fn());
      return fns.get(name);
    },
  });
  return { actions, calls: (name: string) => fns.get(name)?.mock.calls ?? [] };
}

let post: MockInstance;
const posted = (type: string) =>
  post.mock.calls
    .map(
      ([data]) =>
        (data as { pluginMessage?: { type?: string; [k: string]: unknown } })
          .pluginMessage
    )
    .filter((m) => m?.type === type);

describe("Pull today (no review, no conflicts)", () => {
  beforeEach(() => {
    post = vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => cb());
  });
  afterEach(() => vi.restoreAllMocks());

  it("imports GitHub's tokens with the replace strategy and never opens the conflict list", async () => {
    // GitHub differs from Figma; Pull does not even look at Figma's side.
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: tokens("#00ff00"),
    });
    const { actions, calls } = recordingActions();
    const { result } = renderHook(() =>
      useGitHubSync(new ConflictAwareGitHubClient(), actions)
    );

    await result.current.handleGitHubPull();

    const imports = posted("import-tokens");
    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatchObject({ mergeStrategy: "replace" });
    // Nothing asked the user anything first.
    expect(calls("setShowConflictResolution")).toHaveLength(0);
    expect(calls("setConflicts")).toHaveLength(0);
    expect(calls("setConflictOperationType")).toHaveLength(0);
  });

  it("never selects the pull conflict mode, so the plan 169 summary cannot run", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: tokens("#00ff00"),
    });
    const { actions, calls } = recordingActions();
    const { result } = renderHook(() =>
      useGitHubSync(new ConflictAwareGitHubClient(), actions)
    );

    await result.current.handleGitHubPull();

    const modes = calls("setConflictOperationType").map(([mode]) => mode);
    expect(modes).not.toContain("pull");
  });
});

describe("Push today (any difference is a conflict)", () => {
  beforeEach(() => {
    post = vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => cb());
  });
  afterEach(() => vi.restoreAllMocks());

  it("opens the conflict list for a Figma-only edit and writes nothing", async () => {
    // GitHub is untouched since the last sync; only Figma changed.
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: tokens("#ff0000"),
    });
    const syncSpy = vi
      .spyOn(GitHubClient.prototype, "syncTokens")
      .mockResolvedValue({ success: true });
    const { actions, calls } = recordingActions();
    const { result } = renderHook(() =>
      useGitHubSync(new ConflictAwareGitHubClient(), actions)
    );

    await result.current.handleGitHubSync(tokens("#0000ff"));

    expect(calls("setShowConflictResolution")).toEqual([[true]]);
    expect(calls("setConflictOperationType")).toEqual([["push"]]);
    expect(syncSpy).not.toHaveBeenCalled();
    expect(posted("github-sync-complete")).toHaveLength(0);
  });

  it("pushes straight through when Figma and GitHub already match", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: tokens("#ff0000"),
    });
    const syncSpy = vi
      .spyOn(GitHubClient.prototype, "syncTokens")
      .mockResolvedValue({ success: true });
    const { actions, calls } = recordingActions();
    const { result } = renderHook(() =>
      useGitHubSync(new ConflictAwareGitHubClient(), actions)
    );

    await result.current.handleGitHubSync(tokens("#ff0000"));

    expect(syncSpy).toHaveBeenCalledTimes(1);
    expect(calls("setShowConflictResolution")).toHaveLength(0);
  });
});
