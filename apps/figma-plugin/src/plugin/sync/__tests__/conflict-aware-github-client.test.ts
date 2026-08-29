import { describe, it, expect, vi, afterEach } from "vitest";
import { ConflictAwareGitHubClient } from "../conflict-aware-github-client";
import { GitHubClient } from "../../github/client";
import { ConflictDetector } from "../conflict-detector";
import type { ExportData, ProcessedToken } from "../../variables/processor";
import type { ConflictResolution } from "../types";

/**
 * Build a single-collection ExportData wrapper — same helper shape as
 * conflict-detector.test.ts / conflict-resolver.test.ts use.
 */
function collection(
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData {
  return { [name]: { variables } };
}

const token = (
  $type: string,
  $value: unknown,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type, $value, ...extra });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ConflictAwareGitHubClient.pullTokensWithConflictDetection", () => {
  it("propagates failure when the underlying pull fails", async () => {
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: false,
      error: "network down",
    });

    const client = new ConflictAwareGitHubClient();
    const result = await client.pullTokensWithConflictDetection([
      collection("colors", { primary: token("color", "#ff0000") }),
    ]);

    expect(result.success).toBe(false);
    expect(result.error).toBe("network down");
    expect(result.requiresConflictResolution).toBe(false);
  });

  it("skips conflict detection when no local tokens are provided", async () => {
    const remote = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const client = new ConflictAwareGitHubClient();
    const result = await client.pullTokensWithConflictDetection();

    expect(result.success).toBe(true);
    expect(result.tokens).toEqual(remote);
    expect(result.requiresConflictResolution).toBe(false);
    expect(result.conflicts).toBeUndefined();
  });

  it("also skips conflict detection when local tokens is an empty array", async () => {
    const remote = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const client = new ConflictAwareGitHubClient();
    const result = await client.pullTokensWithConflictDetection([]);

    expect(result.requiresConflictResolution).toBe(false);
  });

  it("returns requiresConflictResolution: true with the conflict list when local and remote diverge", async () => {
    const local = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    const remote = [
      collection("colors", { primary: token("color", "#00ff00") }),
    ];
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });

    const client = new ConflictAwareGitHubClient();
    const result = await client.pullTokensWithConflictDetection(local);

    expect(result.requiresConflictResolution).toBe(true);
    expect(result.conflicts).toHaveLength(1);
    expect(result.conflicts?.[0].tokenName).toBe("colors.primary");
    expect(result.localTokens).toEqual(local);
  });
});

describe("ConflictAwareGitHubClient.syncTokensWithConflictDetection", () => {
  it("blocks the sync and does not call syncTokens when conflicts are detected", async () => {
    const local = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    const remote = [
      collection("colors", { primary: token("color", "#00ff00") }),
    ];
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: remote,
    });
    const syncSpy = vi
      .spyOn(GitHubClient.prototype, "syncTokens")
      .mockResolvedValue({ success: true });

    const client = new ConflictAwareGitHubClient();
    const result = await client.syncTokensWithConflictDetection(local);

    expect(result.success).toBe(false);
    expect(result.requiresConflictResolution).toBe(true);
    expect(result.conflicts).toHaveLength(1);
    expect(result.error).toMatch(/1 conflicts detected/);
    expect(syncSpy).not.toHaveBeenCalled();
  });

  it("proceeds with the normal sync when no conflicts are detected", async () => {
    const local = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    // Remote matches local exactly — no conflicts.
    vi.spyOn(GitHubClient.prototype, "pullTokens").mockResolvedValue({
      success: true,
      tokens: local,
    });
    const syncSpy = vi
      .spyOn(GitHubClient.prototype, "syncTokens")
      .mockResolvedValue({
        success: true,
        filesUpdated: ["tokens/colors.json"],
      });

    const client = new ConflictAwareGitHubClient();
    const result = await client.syncTokensWithConflictDetection(
      local,
      "chore: sync"
    );

    expect(result.success).toBe(true);
    expect(result.requiresConflictResolution).toBe(false);
    expect(syncSpy).toHaveBeenCalledTimes(1);
    expect(syncSpy).toHaveBeenCalledWith(local, "chore: sync");
  });
});

describe("ConflictAwareGitHubClient.applyConflictResolutions", () => {
  // Direct regression test for Plan 065's key-mismatch fix. Before that fix,
  // applyConflictResolutions() keyed its lookup map by the raw conflictId
  // (e.g. "conflict_value-change_colors.primary") but looked entries up by
  // tokenPath ("colors.primary") built from the export data — a permanent
  // mismatch that meant no resolution was ever found, so the stale local
  // token silently survived every conflict resolution. This test fails
  // against that pre-fix code and passes against the current code.
  it("applies the resolved token, replacing the stale local value", () => {
    const local = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    const remote = [
      collection("colors", { primary: token("color", "#00ff00") }),
    ];

    // Use the real detector so the conflictId is in its actual production
    // format rather than a hand-built guess — if generateConflictId()'s
    // format ever changes, this test fails loudly instead of drifting.
    const detection = new ConflictDetector().detectConflicts(local, remote);
    expect(detection.conflicts).toHaveLength(1);
    const conflict = detection.conflicts[0];
    expect(conflict.tokenName).toBe("colors.primary");

    const resolution: ConflictResolution = {
      conflictId: conflict.conflictId,
      resolution: "take-remote",
      token: conflict.remoteToken,
    };

    const client = new ConflictAwareGitHubClient();
    const result = client.applyConflictResolutions(local, [resolution]);

    expect(result[0].colors.variables.primary.$value).toBe("#00ff00");
  });

  it("leaves the token unchanged when no resolution matches its path", () => {
    const local = [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    const resolution: ConflictResolution = {
      conflictId: "conflict_value-change_colors.other",
      resolution: "take-remote",
      token: token("color", "#0000ff"),
    };

    const client = new ConflictAwareGitHubClient();
    const result = client.applyConflictResolutions(local, [resolution]);

    expect(result[0].colors.variables.primary.$value).toBe("#ff0000");
  });
});
