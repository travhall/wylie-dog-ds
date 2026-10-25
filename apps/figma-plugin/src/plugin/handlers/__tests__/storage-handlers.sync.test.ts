import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExportData } from "../../variables/processor";
import { hashTokens } from "../../sync/sync-baseline";

const exportLocalTokens = vi.fn();
vi.mock("../token-handlers", () => ({
  exportLocalTokens: (...args: unknown[]) => exportLocalTokens(...args),
}));

const getGitHubConfig = vi.fn();
vi.mock("../../storage/file-storage", () => ({
  fileConfigStorage: { getGitHubConfig: () => getGitHubConfig() },
}));

import { handleGetLastSync, handleRecordLastSync } from "../storage-handlers";
import { syncStateStorage } from "../../storage/sync-state-storage";

const config = { owner: "o", repo: "r", branch: "main", tokenPath: "tokens" };

const tokens = (value: number): ExportData[] => [
  { primitive: { variables: { a: { $type: "number", $value: value } } } },
];

describe("record-last-sync and the sync baseline", () => {
  let pluginData: Record<string, string>;
  let clientStorage: Record<string, unknown>;
  let posted: Array<Record<string, unknown>>;

  beforeEach(() => {
    pluginData = {};
    clientStorage = {};
    posted = [];
    exportLocalTokens.mockReset();
    getGitHubConfig.mockReset().mockResolvedValue(config);
    vi.stubGlobal("figma", {
      root: {
        getPluginData: (k: string) => pluginData[k] ?? "",
        setPluginData: (k: string, v: string) => {
          pluginData[k] = v;
        },
      },
      clientStorage: {
        getAsync: async (k: string) => clientStorage[k],
        setAsync: async (k: string, v: unknown) => {
          clientStorage[k] = v;
        },
      },
      ui: { postMessage: (m: Record<string, unknown>) => posted.push(m) },
    });
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("records a baseline from the live Figma export and the sent GitHub hashes", async () => {
    exportLocalTokens.mockResolvedValue(tokens(1));
    const remoteHashes = hashTokens(tokens(1));

    await handleRecordLastSync({ type: "record-last-sync", remoteHashes });

    const baseline = syncStateStorage.loadBaseline(config);
    expect(baseline?.collections.primitive.a).toEqual([
      hashTokens(tokens(1)).primitive.a,
      remoteHashes.primitive.a,
    ]);
    expect(posted).toEqual([
      { type: "last-sync-loaded", timestamp: expect.any(String) },
    ]);
  });

  it("a later Pull replaces the baseline written by an earlier Push", async () => {
    exportLocalTokens.mockResolvedValue(tokens(1));
    await handleRecordLastSync({
      type: "record-last-sync",
      remoteHashes: hashTokens(tokens(1)),
    });

    exportLocalTokens.mockResolvedValue(tokens(2));
    await handleRecordLastSync({
      type: "record-last-sync",
      remoteHashes: hashTokens(tokens(2)),
    });

    const second = hashTokens(tokens(2)).primitive.a;
    expect(
      syncStateStorage.loadBaseline(config)?.collections.primitive.a
    ).toEqual([second, second]);
  });

  it("records only the time when no hashes come along, leaving the baseline alone", async () => {
    exportLocalTokens.mockResolvedValue(tokens(1));
    await handleRecordLastSync({
      type: "record-last-sync",
      remoteHashes: hashTokens(tokens(1)),
    });
    const before = JSON.stringify(syncStateStorage.loadBaseline(config));
    exportLocalTokens.mockClear();

    // A pull request or a manual file import.
    await handleRecordLastSync({ type: "record-last-sync" });

    expect(JSON.stringify(syncStateStorage.loadBaseline(config))).toBe(before);
    expect(exportLocalTokens).not.toHaveBeenCalled();
    expect(posted).toHaveLength(2);
  });

  it("ignores hashes that are not in the expected shape", async () => {
    await handleRecordLastSync({
      type: "record-last-sync",
      remoteHashes: { primitive: { a: 42 } },
    });
    expect(syncStateStorage.loadBaseline(config)).toBeNull();
    expect(exportLocalTokens).not.toHaveBeenCalled();
  });

  it("does not write to the shared clientStorage any more", async () => {
    await handleRecordLastSync({ type: "record-last-sync" });
    expect(clientStorage).toEqual({});
  });
});

describe("get-last-sync", () => {
  it("reads this file's time and ignores the old global key", async () => {
    const posted: Array<Record<string, unknown>> = [];
    const pluginData: Record<string, string> = {};
    vi.stubGlobal("figma", {
      root: {
        getPluginData: (k: string) => pluginData[k] ?? "",
        setPluginData: (k: string, v: string) => {
          pluginData[k] = v;
        },
      },
      // What the other Figma file (or an older plugin version) left behind.
      clientStorage: {
        getAsync: async () => ({ timestamp: "2020-01-01T00:00:00.000Z" }),
      },
      ui: { postMessage: (m: Record<string, unknown>) => posted.push(m) },
    });
    getGitHubConfig.mockResolvedValue(config);

    await handleGetLastSync();
    expect(posted).toEqual([{ type: "last-sync-loaded", timestamp: null }]);

    syncStateStorage.saveLastSync(config, "2026-10-25T08:00:00.000Z");
    posted.length = 0;
    await handleGetLastSync();
    expect(posted).toEqual([
      { type: "last-sync-loaded", timestamp: "2026-10-25T08:00:00.000Z" },
    ]);
  });
});
