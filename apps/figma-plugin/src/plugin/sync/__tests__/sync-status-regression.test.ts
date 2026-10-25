import { describe, it, expect, vi, afterEach } from "vitest";
import { ConflictAwareGitHubClient } from "../conflict-aware-github-client";
import { GitHubClient } from "../../github/client";
import { buildBaseline, hashTokens } from "../sync-baseline";
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
 * Before the baseline, getSyncStatus diffed Figma against GitHub with no
 * memory and called every difference "remote". Now each side is compared with
 * what the last sync agreed on.
 */
describe("getSyncStatus: z-index rename scenario", () => {
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

  it("without a baseline reports honest differences, not local or remote", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const status = await new ConflictAwareGitHubClient().getSyncStatus(local);

    expect(status.upToDate).toBe(false);
    expect(status.hasBaseline).toBe(false);
    // 1 value change + 1 addition + 1 deletion, direction unknown
    expect(status.differences).toBe(3);
    expect(status.toPush).toBe(0);
    expect(status.toPull).toBe(0);
  });

  it("with a baseline shows the rename as Figma-side changes and 0 to pull", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });
    // Last sync: Figma and GitHub both held the old names.
    const baseline = buildBaseline(hashTokens(remote), hashTokens(remote));

    const status = await new ConflictAwareGitHubClient().getSyncStatus(
      local,
      baseline
    );

    expect(status.upToDate).toBe(false);
    expect(status.hasBaseline).toBe(true);
    expect(status.toPull).toBe(0);
    expect(status.conflicts).toBe(0);
    // The renamed primitive and the alias Figma re-pointed.
    expect(status.toPush).toBe(2);
    expect(status.renamedLocal).toBe(1);
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
    expect(status.differences).toBe(0);
  });
});
