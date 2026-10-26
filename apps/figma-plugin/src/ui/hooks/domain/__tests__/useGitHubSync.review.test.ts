import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MockInstance } from "vitest";
import { act, renderHook } from "@testing-library/preact";
import { useGitHubSync } from "../useGitHubSync";
import {
  buildBaseline,
  hashTokens,
} from "../../../../plugin/sync/sync-baseline";
import type { SyncBaseline } from "../../../../plugin/sync/sync-baseline";
import {
  setPendingRemoteHashes,
  takePendingRemoteHashes,
} from "../../../utils/pending-sync-hashes";
import type { ConflictAwareGitHubClient } from "../../../../plugin/sync/conflict-aware-github-client";
import type { PluginMessageActions } from "../../usePluginMessages";
import type { ExportData } from "../../../../plugin/variables/processor";

/**
 * Plan 200: Push and Pull show what they will change and wait for the user.
 * Before this, Pull imported straight away ("replace") and Push opened the
 * conflict list for ANY difference (see the Step 0 notes in the plan).
 */

const tokens = (a: string, b = "#000000"): ExportData[] => [
  {
    colors: {
      variables: {
        a: { $type: "color", $value: a },
        b: { $type: "color", $value: b },
      },
    },
  },
];

const baselineOf = (t: ExportData[]): SyncBaseline =>
  buildBaseline(hashTokens(t), hashTokens(t));

/** Records every action call, by name. */
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

/** Answer the UI's "get-local-tokens" request the way the plugin thread does. */
function figmaHolds(
  localTokens: ExportData[],
  baseline: SyncBaseline | null,
  fail = false,
  localScopes?: Record<string, Record<string, string[]>>,
  textStyles?: unknown[]
) {
  post.mockImplementation((data: unknown) => {
    const type = (data as { pluginMessage?: { type?: string } }).pluginMessage
      ?.type;
    if (type !== "get-local-tokens") return;
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          data: {
            pluginMessage: fail
              ? { type: "local-tokens-error" }
              : {
                  type: "local-tokens-exported",
                  localTokens,
                  baseline,
                  localScopes,
                  textStyles,
                },
          },
        })
      );
    }, 0);
  });
}

/** Press Confirm, then let the async push finish. */
async function confirmReview(current: () => ReturnType<typeof useGitHubSync>) {
  await act(async () => {
    current().review?.onConfirm?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function setup(
  client: Record<string, unknown>,
  options: Parameters<typeof useGitHubSync>[5] = {}
) {
  const { actions, calls } = recordingActions();
  const hook = renderHook(() =>
    useGitHubSync(
      client as unknown as ConflictAwareGitHubClient,
      actions,
      undefined,
      undefined,
      undefined,
      options
    )
  );
  return { hook, calls, current: () => hook.result.current };
}

beforeEach(() => {
  post = vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("requestAnimationFrame", (cb: () => void) => cb());
  setPendingRemoteHashes(null);
});

afterEach(() => {
  setPendingRemoteHashes(null);
  vi.restoreAllMocks();
});

describe("Pull review", () => {
  const onGitHub = tokens("#00ff00");
  const inFigma = tokens("#ff0000");
  const pulls = () => ({
    pullTokens: vi.fn().mockResolvedValue({ success: true, tokens: onGitHub }),
  });

  it("imports nothing until the review is confirmed, then imports with replace", async () => {
    figmaHolds(inFigma, baselineOf(inFigma));
    const onPullSummary = vi.fn();
    const { current } = setup(pulls(), { onPullSummary });

    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.direction).toBe("pull");
    expect(current().review?.diff.rows).toHaveLength(1);
    expect(posted("import-tokens")).toHaveLength(0);

    act(() => current().review?.onConfirm?.());

    const imports = posted("import-tokens");
    expect(imports).toHaveLength(1);
    expect(imports[0]).toMatchObject({ mergeStrategy: "replace" });
    const files = imports[0]!.files as { content: string }[];
    expect(JSON.parse(files[0].content)).toEqual(onGitHub);
    expect(takePendingRemoteHashes()).toEqual(hashTokens(onGitHub));
    expect(onPullSummary).toHaveBeenCalledTimes(1);
    expect(onPullSummary.mock.calls[0][0].applied).toHaveLength(1);
    expect(current().review).toBeNull();
  });

  it("imports nothing when the review is cancelled", async () => {
    figmaHolds(inFigma, baselineOf(inFigma));
    const { current } = setup(pulls());
    await act(() => current().handleGitHubPull());

    act(() => current().review?.onClose());

    expect(current().review).toBeNull();
    expect(posted("import-tokens")).toHaveLength(0);
    expect(takePendingRemoteHashes()).toBeNull();
  });

  it("shows an empty review with nothing to confirm when the sides match", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub));
    const { current } = setup(pulls());

    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.rows).toEqual([]);
    expect(current().review?.onConfirm).toBeUndefined();
    expect(current().review?.onMarkSynced).toBeUndefined();
  });

  // Plan 202: the tokens match but Figma's scopes differ from the rules, so
  // the importer would change them. Pull must show that and be confirmable.
  // Colours named "a" and "b" carry no property word, so the rules give ALL_SCOPES
  const staleScopes = { colors: { a: ["TEXT_FILL"], b: [] } };

  it("equal tokens with stale scopes show the scope changes and can be pulled", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub), false, staleScopes);
    const { current } = setup(pulls());

    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.rows).toEqual([]);
    expect(current().review?.diff.settingsCount).toBe(2);
    expect(current().review?.onConfirm).toBeDefined();
    expect(current().review?.onMarkSynced).toBeUndefined();
    expect(posted("import-tokens")).toHaveLength(0);

    await confirmReview(current);
    expect(posted("import-tokens")).toHaveLength(1);
    expect(posted("import-tokens")[0]).toMatchObject({
      mergeStrategy: "replace",
    });
  });

  it("equal tokens with scopes the rules already give still say nothing to pull", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub), false, {
      colors: { a: ["ALL_SCOPES"], b: ["ALL_SCOPES"] },
    });
    const { current } = setup(pulls());

    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.settingsCount).toBe(0);
    expect(current().review?.onConfirm).toBeUndefined();
  });

  it("with no baseline and nothing different, offers to record the sync", async () => {
    figmaHolds(onGitHub, null);
    const { current } = setup(pulls());
    await act(() => current().handleGitHubPull());

    act(() => current().review?.onMarkSynced?.());

    expect(posted("record-last-sync")).toEqual([
      { type: "record-last-sync", remoteHashes: hashTokens(onGitHub) },
    ]);
    expect(posted("import-tokens")).toHaveLength(0);
  });

  it("Advanced opens the per-token conflict list in pull mode instead of importing", async () => {
    figmaHolds(inFigma, baselineOf(inFigma));
    const { current, calls } = setup(pulls());
    await act(() => current().handleGitHubPull());

    act(() => current().review?.onAdvanced?.());

    expect(calls("setConflictOperationType")).toEqual([["pull"]]);
    expect(calls("setShowConflictResolution")).toEqual([[true]]);
    expect((calls("setConflicts")[0][0] as unknown[]).length).toBeGreaterThan(
      0
    );
    expect(calls("setPendingTokensForConflictResolution")[0][0]).toEqual({
      local: inFigma,
      remote: onGitHub,
    });
    expect(posted("import-tokens")).toHaveLength(0);
    expect(current().review).toBeNull();
  });

  it("offers Push first when Figma has edits GitHub lacks, and hands off to Push", async () => {
    figmaHolds(inFigma, baselineOf(onGitHub));
    const onRequestPush = vi.fn();
    const { current } = setup(pulls(), { onRequestPush });
    await act(() => current().handleGitHubPull());
    expect(current().review?.diff.overwrites).toHaveLength(1);

    act(() => current().review?.onPushFirst?.());

    expect(onRequestPush).toHaveBeenCalledTimes(1);
    expect(posted("import-tokens")).toHaveLength(0);
  });

  it("reports an error and shows no review when GitHub can't be read", async () => {
    const { current, calls } = setup({
      pullTokens: vi.fn().mockResolvedValue({ success: false, error: "no" }),
    });
    await act(() => current().handleGitHubPull());
    expect(calls("setError")).toEqual([["no"]]);
    expect(current().review).toBeNull();
  });

  it("reports an error rather than a misleading review when Figma can't be read", async () => {
    figmaHolds([], null, true);
    const { current, calls } = setup(pulls());
    await act(() => current().handleGitHubPull());
    expect(calls("setError")[0][0]).toMatch(/Could not read Figma's variables/);
    expect(current().review).toBeNull();
    expect(posted("import-tokens")).toHaveLength(0);
  });

  it("flags variables a Pull would delete", async () => {
    const withExtra: ExportData[] = [
      {
        colors: {
          variables: {
            a: { $type: "color", $value: "#00ff00" },
            b: { $type: "color", $value: "#000000" },
            mine: { $type: "color", $value: "#123456" },
          },
        },
      },
    ];
    figmaHolds(withExtra, baselineOf(onGitHub));
    const { current } = setup(pulls());
    await act(() => current().handleGitHubPull());
    expect(current().review?.diff.deletions.map((r) => r.toName)).toEqual([
      "mine",
    ]);
  });
});

describe("Push review", () => {
  const onGitHub = tokens("#ff0000");
  const edited = tokens("#0000ff");
  const baseline = baselineOf(onGitHub);

  function pushClient(over: Record<string, unknown> = {}) {
    return {
      pullTokens: vi
        .fn()
        .mockResolvedValue({ success: true, tokens: onGitHub }),
      syncTokens: vi.fn().mockResolvedValue({ success: true }),
      ...over,
    };
  }

  it("shows a Figma-only edit for review instead of the conflict list, and writes nothing yet", async () => {
    const client = pushClient();
    const { current, calls } = setup(client);

    await act(() => current().handleGitHubSync(edited, baseline));

    expect(current().review?.diff.direction).toBe("push");
    expect(current().review?.diff.rows).toHaveLength(1);
    // Scopes are never pushed, so a Push review never lists them (plan 202)
    expect(current().review?.diff.settings).toEqual([]);
    expect(calls("setShowConflictResolution")).toHaveLength(0);
    expect(client.syncTokens).not.toHaveBeenCalled();
  });

  it("writes nothing when the review is cancelled", async () => {
    const client = pushClient();
    const { current } = setup(client);
    await act(() => current().handleGitHubSync(edited, baseline));

    act(() => current().review?.onClose());

    expect(client.syncTokens).not.toHaveBeenCalled();
    expect(posted("github-sync-complete")).toHaveLength(0);
  });

  it("on confirm calls the same sync write as before, with the same tokens", async () => {
    const client = pushClient();
    const { current } = setup(client);
    await act(() => current().handleGitHubSync(edited, baseline));

    await confirmReview(current);

    expect(client.syncTokens).toHaveBeenCalledTimes(1);
    expect(client.syncTokens).toHaveBeenCalledWith(edited);
    expect(posted("github-sync-complete")).toHaveLength(1);
  });

  it("remembers what GitHub holds after a direct push, for the baseline", async () => {
    const pullTokens = vi
      .fn()
      // the review, the re-check on confirm, then the read after the push
      .mockResolvedValueOnce({ success: true, tokens: onGitHub })
      .mockResolvedValueOnce({ success: true, tokens: onGitHub })
      .mockResolvedValue({ success: true, tokens: edited });
    const { current } = setup(pushClient({ pullTokens }));
    await act(() => current().handleGitHubSync(edited, baseline));

    await confirmReview(current);

    expect(takePendingRemoteHashes()).toEqual(hashTokens(edited));
  });

  it("leaves the baseline alone when the push only opens a pull request", async () => {
    const client = pushClient({
      syncTokens: vi.fn().mockResolvedValue({
        success: true,
        pullRequestUrl: "https://example.test/pr/1",
      }),
    });
    const { current } = setup(client);
    await act(() => current().handleGitHubSync(edited, baseline));
    await confirmReview(current);
    expect(takePendingRemoteHashes()).toBeNull();
  });

  it("remembers nothing when the push fails, or when the follow-up fetch fails", async () => {
    const failing = pushClient({
      syncTokens: vi.fn().mockResolvedValue({ success: false, error: "nope" }),
    });
    const a = setup(failing);
    await act(() => a.current().handleGitHubSync(edited, baseline));
    await confirmReview(a.current);
    expect(takePendingRemoteHashes()).toBeNull();

    const pullTokens = vi
      .fn()
      .mockResolvedValueOnce({ success: true, tokens: onGitHub })
      .mockResolvedValueOnce({ success: true, tokens: onGitHub })
      .mockRejectedValue(new Error("offline"));
    const b = setup(pushClient({ pullTokens }));
    await act(() => b.current().handleGitHubSync(edited, baseline));
    await confirmReview(b.current);
    expect(takePendingRemoteHashes()).toBeNull();
  });

  it("sends a GitHub-side change Figma lacks to the conflict list, not the review", async () => {
    const remoteMoved = tokens("#ff0000", "#999999");
    const client = pushClient({
      pullTokens: vi
        .fn()
        .mockResolvedValue({ success: true, tokens: remoteMoved }),
    });
    const { current, calls } = setup(client);

    await act(() => current().handleGitHubSync(onGitHub, baseline));

    expect(calls("setConflictOperationType")).toEqual([["push"]]);
    expect(calls("setShowConflictResolution")).toEqual([[true]]);
    expect(current().review).toBeNull();
    expect(client.syncTokens).not.toHaveBeenCalled();
  });

  it("with no baseline, any difference still opens the conflict list", async () => {
    const { current, calls } = setup(pushClient());
    await act(() => current().handleGitHubSync(edited, null));
    expect(calls("setShowConflictResolution")).toEqual([[true]]);
    expect(current().review).toBeNull();
  });

  it("shows an empty review with nothing to confirm when GitHub already has everything", async () => {
    const client = pushClient();
    const { current } = setup(client);

    await act(() => current().handleGitHubSync(onGitHub, baseline));

    expect(current().review?.diff.rows).toEqual([]);
    expect(current().review?.onConfirm).toBeUndefined();
    expect(client.syncTokens).not.toHaveBeenCalled();
  });

  it("re-checks GitHub on confirm and stops if it moved while the review was open", async () => {
    const remoteMoved = tokens("#ff0000", "#999999");
    const pullTokens = vi
      .fn()
      .mockResolvedValueOnce({ success: true, tokens: onGitHub })
      .mockResolvedValue({ success: true, tokens: remoteMoved });
    const client = pushClient({ pullTokens });
    const { current, calls } = setup(client);
    await act(() => current().handleGitHubSync(edited, baseline));

    await confirmReview(current);

    expect(client.syncTokens).not.toHaveBeenCalled();
    expect(calls("setShowConflictResolution")).toEqual([[true]]);
  });

  it("treats an empty repo path as a first push: nothing on GitHub to lose, so just review", async () => {
    const client = pushClient({
      pullTokens: vi.fn().mockResolvedValue({
        success: false,
        error: "No JSON files found at tokens in o/r@main.",
      }),
    });
    const { current, calls } = setup(client);

    await act(() => current().handleGitHubSync(edited, null));

    expect(calls("setError")).toHaveLength(0);
    expect(calls("setShowConflictResolution")).toHaveLength(0);
    expect(current().review?.diff.rows.length).toBeGreaterThan(0);
    expect(current().review?.onConfirm).toBeDefined();
  });

  it("reports other read errors instead of guessing", async () => {
    const client = pushClient({
      pullTokens: vi
        .fn()
        .mockResolvedValue({ success: false, error: "Bad credentials" }),
    });
    const { current, calls } = setup(client);
    await act(() => current().handleGitHubSync(edited, baseline));
    expect(calls("setError")).toEqual([["Bad credentials"]]);
    expect(current().review).toBeNull();
    expect(client.syncTokens).not.toHaveBeenCalled();
  });
});

describe("Pull review: text styles (plan 205)", () => {
  const lineHeights = (value: number) =>
    [
      {
        components: {
          variables: {
            "button.line-height": { $type: "number", $value: value },
          },
        },
      },
    ] as unknown as ExportData[];
  const onGitHub = lineHeights(125);
  const style = (name: string, linked: boolean) => ({
    id: `S:${name}`,
    name,
    lineHeight: { unit: "PERCENT", value: 100 },
    letterSpacing: { unit: "PERCENT", value: 0 },
    ...(linked ? { lineHeightToken: "button.line-height" } : {}),
  });
  const pulls = () => ({
    pullTokens: vi.fn().mockResolvedValue({ success: true, tokens: onGitHub }),
  });

  it("equal tokens with a lagging linked style show it and can be pulled", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub), false, undefined, [
      style("button/label/sm", true),
      style("designer/hero", false),
    ]);
    const { current } = setup(pulls());

    await act(() => current().handleGitHubPull());

    const diff = current().review?.diff;
    expect(diff?.rows).toEqual([]);
    expect(diff?.textStyleCount).toBe(1);
    expect(diff?.textStyles.unlinked).toHaveLength(1);
    expect(current().review?.onConfirm).toBeDefined();
    expect(current().review?.onMarkSynced).toBeUndefined();
    expect(posted("import-tokens")).toHaveLength(0);
  });

  it("sends the reviewed text style changes with the import, and nothing for unlinked styles", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub), false, undefined, [
      style("button/label/sm", true),
      style("designer/hero", false),
    ]);
    const { current } = setup(pulls());
    await act(() => current().handleGitHubPull());

    await confirmReview(current);

    const imports = posted("import-tokens");
    expect(imports).toHaveLength(1);
    expect(imports[0]!.textStyleChanges).toEqual([
      {
        id: "S:button/label/sm",
        name: "button/label/sm",
        lineHeight: { from: { unit: "PERCENT", value: 100 }, to: 125 },
      },
    ]);
  });

  it("with only unlinked styles there is nothing to confirm", async () => {
    figmaHolds(onGitHub, baselineOf(onGitHub), false, undefined, [
      style("designer/hero", false),
    ]);
    const { current } = setup(pulls());
    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.textStyleCount).toBe(0);
    expect(current().review?.onConfirm).toBeUndefined();
  });
});

describe("Pull review: text styles from definitions (plan 206)", () => {
  const sync: ExportData[] = [
    {
      primitive: {
        variables: {
          "typography.font-family.sans": {
            $type: "fontFamily",
            $value: "Manrope",
          },
          "typography.font-size.sm": { $type: "number", $value: 14 },
          "typography.line-height.tight": { $type: "number", $value: 125 },
        },
      },
    },
    {
      components: {
        variables: {
          "button.font-size.sm": {
            $type: "number",
            $value: "{typography.font-size.sm}",
          },
          "button.line-height": {
            $type: "number",
            $value: "{typography.line-height.tight}",
          },
        },
      },
    },
  ] as unknown as ExportData[];
  const definitions = [
    {
      name: "button/sm",
      fontFamily: "typography.font-family.sans",
      fontSize: "button.font-size.sm",
      lineHeight: "button.line-height",
    },
  ];
  const pulls = (over: Record<string, unknown> = {}) => ({
    pullTokens: vi.fn().mockResolvedValue({ success: true, tokens: sync }),
    fetchTextStyleDefinitions: vi
      .fn()
      .mockResolvedValue({ status: "found", definitions }),
    ...over,
  });

  it("plans no styles when Text styles is off, but notes how many are on offer (plan 207)", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls();
    const { current } = setup(client);

    await act(() => current().handleGitHubPull());

    expect(client.fetchTextStyleDefinitions).toHaveBeenCalledTimes(1);
    expect(current().review?.diff.textStyles.definitions).toBeUndefined();
    expect(current().review?.diff.textStyleCount).toBe(0);
    expect(current().review?.textStylesAvailable).toBe(1);
    // Nothing about the styles is written without the box.
    expect(current().review?.onConfirm).toBeUndefined();
  });

  it("says nothing about styles when the branch has no definitions file (Text styles off)", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls({
      fetchTextStyleDefinitions: vi
        .fn()
        .mockResolvedValue({ status: "absent" }),
    });
    const { current } = setup(client);

    await act(() => current().handleGitHubPull());

    expect(current().review).not.toBeNull();
    expect(current().review?.textStylesAvailable).toBeUndefined();
  });

  it("never blocks the Pull when the definitions cannot be read (Text styles off)", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    for (const fetchTextStyleDefinitions of [
      vi.fn().mockResolvedValue({ status: "error", error: "rate limited" }),
      vi.fn().mockRejectedValue(new Error("network")),
    ]) {
      const { current } = setup(pulls({ fetchTextStyleDefinitions }));
      await act(() => current().handleGitHubPull());
      expect(current().review).not.toBeNull();
      expect(current().review?.textStylesAvailable).toBeUndefined();
    }
  });

  it("with Text styles on, reads the definitions once and announces nothing", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls();
    const { current } = setup(client, { includeTextStyles: true });

    await act(() => current().handleGitHubPull());

    expect(client.fetchTextStyleDefinitions).toHaveBeenCalledTimes(1);
    expect(current().review?.textStylesAvailable).toBeUndefined();
  });

  it("in an empty file with Text styles on, plans every definition as a create", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls();
    const { current } = setup(client, { includeTextStyles: true });

    await act(() => current().handleGitHubPull());

    const plan = current().review?.diff.textStyles.definitions;
    expect(plan?.status).toBe("found");
    expect(plan?.creates.map((c) => c.name)).toEqual(["button/sm"]);
    expect(plan?.creates[0].lineHeight).toEqual({
      unit: "PERCENT",
      value: 125,
    });
    expect(current().review?.diff.textStyleCount).toBe(1);
    // tokens match, but there is styles work to confirm
    expect(current().review?.diff.rows).toEqual([]);
    expect(current().review?.onConfirm).toBeDefined();
    expect(posted("import-tokens")).toHaveLength(0);
  });

  it("sends the resolved styles with the import on confirm", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const { current } = setup(pulls(), { includeTextStyles: true });
    await act(() => current().handleGitHubPull());

    await confirmReview(current);

    const imports = posted("import-tokens");
    expect(imports).toHaveLength(1);
    expect(imports[0]!.textStyleDefinitions).toEqual([
      expect.objectContaining({
        name: "button/sm",
        fontSize: 14,
        lineHeight: { unit: "PERCENT", value: 125 },
      }),
    ]);
  });

  it("with no definitions file on the branch still pulls, and says so instead of failing", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls({
      fetchTextStyleDefinitions: vi
        .fn()
        .mockResolvedValue({ status: "absent" }),
    });
    const { current, calls } = setup(client, { includeTextStyles: true });

    await act(() => current().handleGitHubPull());

    expect(current().review?.diff.textStyles.definitions?.status).toBe(
      "absent"
    );
    expect(current().review?.diff.textStyleCount).toBe(0);
    expect(calls("setError").filter(([e]) => e)).toHaveLength(0);
  });

  it("reports an unreadable definitions file instead of silently skipping the styles", async () => {
    figmaHolds(sync, baselineOf(sync), false, undefined, []);
    const client = pulls({
      fetchTextStyleDefinitions: vi
        .fn()
        .mockResolvedValue({ status: "error", error: "HTTP 500" }),
    });
    const { current, calls } = setup(client, { includeTextStyles: true });

    await act(() => current().handleGitHubPull());

    expect(current().review).toBeNull();
    expect(calls("setError")).toContainEqual(["HTTP 500"]);
  });

  it("a Push with Text styles on reads and writes nothing about styles", async () => {
    const client = {
      pullTokens: vi.fn().mockResolvedValue({ success: true, tokens: sync }),
      syncTokens: vi.fn().mockResolvedValue({ success: true }),
      fetchTextStyleDefinitions: vi.fn(),
    };
    const { current } = setup(client, { includeTextStyles: true });

    await act(() => current().handleGitHubSync(sync, baselineOf(sync)));

    expect(client.fetchTextStyleDefinitions).not.toHaveBeenCalled();
    expect(current().review?.diff.textStyles.definitions).toBeUndefined();
    expect(current().review?.diff.textStyleCount).toBe(0);
  });
});
