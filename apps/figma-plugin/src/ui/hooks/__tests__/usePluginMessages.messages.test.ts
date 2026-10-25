import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { act, renderHook } from "@testing-library/preact";
import { usePluginMessages } from "../usePluginMessages";
import { setPendingRemoteHashes } from "../../utils/pending-sync-hashes";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";

const configure = vi.fn();
const client = { configure } as unknown as ConflictAwareGitHubClient;

const config = { owner: "acme", repo: "tokens", branch: "main" };

let postMessage: MockInstance;
let warn: MockInstance;

function post(pluginMessage: Record<string, unknown> | undefined) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data: { pluginMessage } })
    );
  });
}

function setup() {
  const hook = renderHook(() => usePluginMessages(client));
  return {
    state: () => hook.result.current[0],
    actions: () => hook.result.current[1],
    hook,
  };
}

const sent = (type: string) =>
  postMessage.mock.calls
    .map(
      ([data]) => (data as { pluginMessage?: { type?: string } }).pluginMessage
    )
    .filter((m) => m?.type === type);

describe("usePluginMessages message handling", () => {
  beforeEach(() => {
    postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    configure.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("startup", () => {
    it("requests collections, GitHub config, onboarding state and file engagement", () => {
      setup();
      expect(sent("get-collections")).toHaveLength(1);
      expect(sent("get-github-config")).toHaveLength(1);
      expect(sent("get-onboarding-state")).toHaveLength(1);
      expect(sent("check-file-engagement")).toHaveLength(1);
    });

    it("ignores events with no plugin message", () => {
      const { state } = setup();
      post(undefined);
      expect(warn).toHaveBeenCalledWith(
        "usePluginMessages: No pluginMessage in event data"
      );
      expect(state().collections).toEqual([]);
    });

    it("stops listening when unmounted", () => {
      const { state, hook } = setup();
      hook.unmount();
      post({ type: "error", message: "late" });
      expect(state().error).toBeNull();
    });
  });

  describe("actions", () => {
    it("posts the matching request for each load action", () => {
      const { actions } = setup();
      act(() => actions().loadCollectionDetails("c1"));
      expect(sent("get-collection-details")).toEqual([
        { type: "get-collection-details", collectionId: "c1" },
      ]);
    });

    it("forwards other messages to the plugin", () => {
      const { actions } = setup();
      act(() =>
        actions().sendMessage({ type: "generate-demo-tokens" } as never)
      );
      expect(sent("generate-demo-tokens")).toHaveLength(1);
    });

    it("clears the tab-switch hint and the download queue", () => {
      const { state, actions } = setup();
      post({ type: "tokens-exported", exportData: [{ filename: "a.json" }] });
      expect(state().downloadQueue).toHaveLength(1);
      act(() => actions().clearDownloadQueue());
      expect(state().downloadQueue).toEqual([]);

      post({
        type: "tokens-imported",
        result: {
          success: true,
          totalVariablesCreated: 1,
          collectionsProcessed: 1,
        },
      });
      expect(state().shouldSwitchToTokensTab).toBe(true);
      act(() => actions().clearShouldSwitchToTokensTab());
      expect(state().shouldSwitchToTokensTab).toBe(false);
    });
  });

  describe("collections", () => {
    it("stores loaded collections and clears loading and errors", () => {
      const { state, actions } = setup();
      act(() => {
        actions().setLoading(true);
        actions().setError("old");
      });
      const collections = [
        { id: "c1", name: "primitive", modes: [], variableIds: [] },
      ];
      post({ type: "collections-loaded", collections });
      expect(state().collections).toEqual(collections);
      expect(state().loading).toBe(false);
      expect(state().error).toBeNull();
    });

    it("treats a missing collections list as empty", () => {
      const { state } = setup();
      post({ type: "collections-loaded" });
      expect(state().collections).toEqual([]);
    });

    it("stores collection details", () => {
      const { state } = setup();
      const collection = {
        id: "c1",
        name: "primitive",
        modes: [],
        variables: [],
      };
      post({ type: "collection-details-loaded", collection });
      expect(state().selectedCollection).toEqual(collection);
    });

    it("reloads collections when variables change in Figma", () => {
      setup();
      postMessage.mockClear();
      post({ type: "variables-changed" });
      expect(sent("get-collections")).toHaveLength(1);
    });
  });

  describe("export", () => {
    it("queues exported files and ignores a missing export", () => {
      const { state } = setup();
      post({ type: "tokens-exported" });
      expect(state().downloadQueue).toEqual([]);
      post({ type: "tokens-exported", exportData: [{ filename: "a.json" }] });
      expect(state().downloadQueue).toEqual([{ filename: "a.json" }]);
    });
  });

  describe("import", () => {
    const success = {
      type: "tokens-imported",
      result: {
        success: true,
        totalVariablesCreated: 3,
        collectionsProcessed: 2,
      },
    };

    it("reports a successful import and tells the plugin to remember it", () => {
      vi.useFakeTimers();
      const { state } = setup();
      postMessage.mockClear();
      post(success);
      expect(state().successMessage).toBe(
        "✅ Added 3 tokens in 2 collections!"
      );
      expect(sent("mark-file-engaged")).toHaveLength(1);
      expect(sent("record-last-sync")).toHaveLength(1);
      expect(sent("get-collections")).toHaveLength(1);
      expect(state().shouldSwitchToTokensTab).toBe(true);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(state().successMessage).toBeNull();
    });

    it("uses singular wording", () => {
      const { state } = setup();
      post({
        type: "tokens-imported",
        result: {
          success: true,
          totalVariablesCreated: 1,
          collectionsProcessed: 1,
        },
      });
      expect(state().successMessage).toBe("✅ Added 1 token in 1 collection!");
    });

    it("falls back to collectionsCreated, then to zero", () => {
      const { state } = setup();
      post({
        type: "tokens-imported",
        result: {
          success: true,
          totalVariablesCreated: 2,
          collectionsCreated: 4,
        },
      });
      expect(state().successMessage).toBe(
        "✅ Added 2 tokens in 4 collections!"
      );
      post({ type: "tokens-imported", result: { success: true } });
      expect(state().successMessage).toBe(
        "✅ Added 0 tokens in 0 collections!"
      );
    });

    it("shows the failure message, or Unknown error without one", () => {
      const { state } = setup();
      post({
        type: "tokens-imported",
        result: { success: false, message: "bad file" },
      });
      expect(state().error).toBe("Import failed: bad file");
      post({ type: "tokens-imported" });
      expect(state().error).toBe("Import failed: Unknown error");
    });

    it("shows a validation report and adapter results when provided", () => {
      const { state } = setup();
      const validationReport = { errors: [], warnings: [] };
      const adapterResults = [{ filename: "a.json" }];
      post({ ...success, validationReport, adapterResults });
      expect(state().validationReport).toEqual(validationReport);
      expect(state().showValidation).toBe(true);
      expect(state().adapterResults).toEqual(adapterResults);
    });

    it("ignores an empty adapter results list", () => {
      const { state } = setup();
      post({ ...success, adapterResults: [] });
      expect(state().adapterResults).toEqual([]);
    });

    it("adds guidance when the import error mentions reference issues", () => {
      const { state } = setup();
      post({ type: "import-error", error: "Reference Issues: {a.b} missing" });
      expect(state().error).toContain(
        "Import failed due to token reference problems"
      );
      expect(state().error).toContain("dependency order");
    });

    it("shows other import errors as they are", () => {
      const { state } = setup();
      post({ type: "import-error", error: "disk full" });
      expect(state().error).toBe("Import failed: disk full");
    });
  });

  describe("GitHub config", () => {
    it("is configured when the loaded config has a token", () => {
      const { state } = setup();
      post({
        type: "github-config-loaded",
        config: { ...config, accessToken: "t" },
      });
      expect(state().githubConfig).toMatchObject(config);
      expect(state().githubConfigured).toBe(true);
      expect(configure).toHaveBeenCalledTimes(1);
    });

    it("stays unconfigured when this user has no token yet", () => {
      const { state } = setup();
      post({ type: "github-config-loaded", config });
      expect(state().githubConfig).toMatchObject(config);
      expect(state().githubConfigured).toBe(false);
    });

    it("keeps going when configuring the client throws", () => {
      configure.mockImplementation(() => {
        throw new Error("bad config");
      });
      const { state } = setup();
      post({
        type: "github-config-loaded",
        config: { ...config, accessToken: "t" },
      });
      expect(warn).toHaveBeenCalledWith(
        "Failed to configure GitHub client:",
        expect.any(Error)
      );
      expect(state().githubConfigured).toBe(true);
    });

    it("clears the config when none is stored", () => {
      const { state } = setup();
      post({
        type: "github-config-loaded",
        config: { ...config, accessToken: "t" },
      });
      post({ type: "github-config-loaded", config: null });
      expect(state().githubConfig).toBeNull();
      expect(state().githubConfigured).toBe(false);
    });

    it("confirms a save, reloads the config and clears the message after three seconds", () => {
      vi.useFakeTimers();
      const { state } = setup();
      postMessage.mockClear();
      post({ type: "github-config-saved", success: true });
      expect(state().successMessage).toBe("✅ GitHub settings saved!");
      expect(sent("get-github-config")).toHaveLength(1);
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(state().successMessage).toBeNull();
    });

    it("shows the save error, or a default", () => {
      const { state } = setup();
      post({ type: "github-config-saved", success: false, error: "nope" });
      expect(state().error).toBe("nope");
      post({ type: "github-config-saved", success: false });
      expect(state().error).toBe("Failed to save GitHub configuration");
    });
  });

  describe("GitHub sync and pull", () => {
    it("hands exported data to the registered sync handler", () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const { actions } = setup();
      act(() => actions().registerGitHubSyncHandler(handler));
      post({
        type: "github-sync-tokens",
        exportData: [{ filename: "a.json" }],
      });
      expect(handler).toHaveBeenCalledWith([{ filename: "a.json" }]);
    });

    it("warns when no sync or pull handler is registered", () => {
      setup();
      post({ type: "github-sync-tokens", exportData: [] });
      expect(warn).toHaveBeenCalledWith("No GitHub sync handler registered");
      post({ type: "github-pull-tokens" });
      expect(warn).toHaveBeenCalledWith("No GitHub pull handler registered");
    });

    it("runs the registered pull handler", () => {
      const handler = vi.fn().mockResolvedValue(undefined);
      const { actions } = setup();
      act(() => actions().registerGitHubPullHandler(handler));
      post({ type: "github-pull-tokens" });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("keeps the config-test handler registrable", () => {
      const { actions } = setup();
      expect(() =>
        act(() =>
          actions().registerGitHubConfigTestHandler((async () => ({
            success: true,
            data: true,
          })) as never)
        )
      ).not.toThrow();
    });

    it("reports a completed push, with a pull request link or without", () => {
      vi.useFakeTimers();
      const { state } = setup();
      postMessage.mockClear();
      post({ type: "github-sync-complete", result: { success: true } });
      expect(state().successMessage).toBe("✅ Saved to GitHub successfully!");
      expect(sent("record-last-sync")).toHaveLength(1);
      act(() => {
        vi.advanceTimersByTime(6000);
      });
      expect(state().successMessage).toBeNull();
      post({
        type: "github-sync-complete",
        result: { success: true, pullRequestUrl: "https://example.test/pr/1" },
      });
      expect(state().successMessage).toBe(
        "✅ Pull request created! Check GitHub to review"
      );
    });

    it("reports a failed push, or a default message", () => {
      const { state } = setup();
      post({
        type: "github-sync-complete",
        result: { success: false, error: "403" },
      });
      expect(state().error).toBe("403");
      post({ type: "github-sync-complete" });
      expect(state().error).toBe("GitHub sync failed");
    });

    it("reports a completed pull and reloads collections a second later", () => {
      vi.useFakeTimers();
      const { state } = setup();
      postMessage.mockClear();
      post({ type: "github-pull-complete", result: { success: true } });
      expect(state().successMessage).toBe("✅ Got your tokens from GitHub!");
      expect(sent("mark-file-engaged")).toHaveLength(1);
      expect(sent("get-collections")).toHaveLength(0);
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(sent("get-collections")).toHaveLength(1);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(state().successMessage).toBeNull();
    });

    it("reports a failed pull, or a default message", () => {
      const { state } = setup();
      post({
        type: "github-pull-complete",
        result: { success: false, error: "404" },
      });
      expect(state().error).toBe("404");
      post({ type: "github-pull-complete" });
      expect(state().error).toBe("GitHub pull failed");
    });
  });

  describe("loading and errors", () => {
    it("tracks the loading state and its message", () => {
      const { state } = setup();
      post({ type: "loading-state", loading: true, message: "Working" });
      expect(state().loading).toBe(true);
      expect(state().loadingMessage).toBe("Working");
      post({ type: "loading-state", loading: true });
      expect(state().loadingMessage).toBe("Working");
      post({ type: "loading-state", loading: false });
      expect(state().loading).toBe(false);
      expect(state().loadingMessage).toBe("");
    });

    it("ignores a loading-state message without a boolean", () => {
      const { state } = setup();
      post({ type: "loading-state", loading: "yes" });
      expect(state().loading).toBe(false);
    });

    it("surfaces plugin errors and stops every spinner", () => {
      const { state, actions } = setup();
      act(() => {
        actions().setLoading(true);
        actions().setLoadingMessage("Busy");
      });
      post({ type: "error", message: "Figma said no" });
      expect(state().error).toBe("Figma said no");
      expect(state().loading).toBe(false);
      expect(state().loadingMessage).toBe("");
    });
  });

  describe("onboarding", () => {
    it("shows onboarding for an unengaged file with nothing set up", () => {
      const { state } = setup();
      post({ type: "file-engagement-status", hasEngaged: false });
      expect(state().showOnboarding).toBe(true);
    });

    it("hides it again once collections arrive", () => {
      const { state } = setup();
      post({ type: "file-engagement-status", hasEngaged: false });
      post({
        type: "collections-loaded",
        collections: [
          { id: "c1", name: "primitive", modes: [], variableIds: [] },
        ],
      });
      expect(state().showOnboarding).toBe(false);
    });

    it("never shows it for a file the user has engaged with", () => {
      const { state } = setup();
      post({ type: "file-engagement-status", hasEngaged: true });
      expect(state().showOnboarding).toBe(false);
    });

    it("accepts the onboarding and transformation notices without changing state", () => {
      const { state } = setup();
      post({ type: "onboarding-state-loaded", hasSeenOnboarding: true });
      post({
        type: "format-transformations",
        transformations: [{ type: "x" }],
        detection: { format: "w3c" },
        stats: {},
      });
      post({ type: "format-transformations" });
      expect(state().showOnboarding).toBe(false);
    });
  });

  describe("unknown messages", () => {
    it("warns about messages the plugin should not send", () => {
      setup();
      post({ type: "mystery" });
      expect(warn).toHaveBeenCalledWith(
        "Unknown message type from plugin:",
        "mystery"
      );
    });

    it("stays quiet about outgoing and component-handled message types", () => {
      setup();
      warn.mockClear();
      post({ type: "import-tokens" });
      post({ type: "last-sync-loaded" });
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

describe("usePluginMessages: sync baseline hashes", () => {
  const hashes = { primitive: { a: "abc12" } };
  const imported = { type: "tokens-imported", result: { success: true } };

  const recorded = () =>
    sent("record-last-sync") as Array<{
      type: string;
      remoteHashes?: unknown;
    }>;

  beforeEach(() => {
    postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    setPendingRemoteHashes(null);
  });

  afterEach(() => {
    setPendingRemoteHashes(null);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("sends the GitHub hashes of a pull along with record-last-sync, once", () => {
    vi.useFakeTimers();
    setup();
    setPendingRemoteHashes(hashes);
    postMessage.mockClear();

    post(imported);
    post(imported);

    expect(recorded()).toEqual([
      { type: "record-last-sync", remoteHashes: hashes },
      { type: "record-last-sync" },
    ]);
  });

  it("sends the hashes of a direct push the same way", () => {
    setup();
    setPendingRemoteHashes(hashes);
    postMessage.mockClear();

    post({ type: "github-sync-complete", result: { success: true } });

    expect(recorded()).toEqual([
      { type: "record-last-sync", remoteHashes: hashes },
    ]);
  });

  it("records no baseline for a manual import (nothing pending)", () => {
    vi.useFakeTimers();
    setup();
    postMessage.mockClear();
    post(imported);
    expect(recorded()).toEqual([{ type: "record-last-sync" }]);
  });

  it.each([
    [
      "a failed import",
      { type: "tokens-imported", result: { success: false } },
    ],
    ["an import error", { type: "import-error", error: "bad" }],
  ])("forgets pending hashes after %s", (_label, failure) => {
    vi.useFakeTimers();
    setup();
    setPendingRemoteHashes(hashes);
    post(failure);
    postMessage.mockClear();

    // A later manual import must not inherit the failed pull's hashes.
    post(imported);

    expect(recorded()).toEqual([{ type: "record-last-sync" }]);
  });
});
