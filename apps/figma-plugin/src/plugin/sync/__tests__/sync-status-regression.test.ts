import { describe, it, expect, vi, afterEach } from "vitest";
import { ConflictAwareGitHubClient } from "../conflict-aware-github-client";
import { GitHubClient } from "../../github/client";
import type { ExportData, ProcessedToken } from "../../variables/processor";

const token = (
  $type: string,
  $value: unknown,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type, $value, ...extra });

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Plan 199, Step 0. The owner renamed the primitive `z-index.1` to
 * `z-index.01` in Figma; Figma re-pointed the one token aliasing it. Nothing
 * changed on GitHub, yet the Sync tab showed "1 local, 3 remote".
 *
 * This documents the two-way diff's behaviour (no baseline) so the baseline
 * work can be measured against it.
 */
describe("getSyncStatus without a baseline: z-index rename scenario", () => {
  const remote: ExportData[] = [
    {
      primitive: {
        variables: {
          "z-index.0": token("number", 0),
          "z-index.1": token("number", 10),
          "z-index.2": token("number", 20),
        },
      },
    },
    {
      component: {
        variables: {
          "navigation-menu.indicator-z-index": token("number", "{z-index.1}"),
        },
      },
    },
  ];

  // Figma side: z-index.1 renamed to z-index.01, alias re-pointed, and the
  // collections listed in the opposite order (reordering must be a no-op).
  const local: ExportData[] = [
    {
      component: {
        variables: {
          "navigation-menu.indicator-z-index": token("number", "{z-index.01}"),
        },
      },
    },
    {
      primitive: {
        variables: {
          "z-index.2": token("number", 20),
          "z-index.01": token("number", 10),
          "z-index.0": token("number", 0),
        },
      },
    },
  ];

  it("reports 1 local and 3 remote although nothing changed on GitHub", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const status = await new ConflictAwareGitHubClient().getSyncStatus(local);

    expect(status.upToDate).toBe(false);
    expect(status.localChanges).toBe(1);
    expect(status.remoteChanges).toBe(3);
    expect(status.conflicts?.map((c) => c.type).sort()).toEqual([
      "addition",
      "deletion",
      "value-change",
    ]);
  });

  it("reports nothing for a pure reorder", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const reordered: ExportData[] = [remote[1], remote[0]];
    const status = await new ConflictAwareGitHubClient().getSyncStatus(
      reordered
    );

    expect(status.upToDate).toBe(true);
    expect(status.localChanges).toBe(0);
    expect(status.remoteChanges).toBe(0);
  });
});
