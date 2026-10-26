import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  MAX_ENTRY_CHARS,
  SyncStateStorage,
  syncScope,
} from "../sync-state-storage";
import { buildBaseline } from "../../sync/sync-baseline";

const config = {
  owner: "o",
  repo: "r",
  branch: "main",
  tokenPath: "tokens",
};

/** A fake Figma file: its own root plugin data. */
function fakeFile() {
  const data: Record<string, string> = {};
  return {
    data,
    root: {
      getPluginData: (k: string) => data[k] ?? "",
      setPluginData: (k: string, v: string) => {
        data[k] = v;
      },
    },
  };
}

const baselineOf = (collections: Record<string, string[]>) => {
  const hashes = Object.fromEntries(
    Object.entries(collections).map(([name, tokens]) => [
      name,
      Object.fromEntries(tokens.map((t) => [t, `h-${t}`])),
    ])
  );
  return buildBaseline(hashes, hashes, "2026-10-25T08:00:00.000Z");
};

describe("SyncStateStorage", () => {
  let file: ReturnType<typeof fakeFile>;
  const storage = new SyncStateStorage();

  beforeEach(() => {
    file = fakeFile();
    vi.stubGlobal("figma", { root: file.root });
  });

  it("reads back what it saved, per collection", () => {
    const baseline = baselineOf({ primitive: ["a", "b"], semantic: ["x"] });
    expect(storage.saveBaseline(config, baseline)).toBe(true);
    expect(storage.loadBaseline(config)).toEqual(baseline);
  });

  it("has no baseline before the first sync", () => {
    expect(storage.loadBaseline(config)).toBeNull();
  });

  it("scopes the baseline to repo, branch and token path", () => {
    storage.saveBaseline(config, baselineOf({ primitive: ["a"] }));
    expect(storage.loadBaseline({ ...config, branch: "dev" })).toBeNull();
    expect(storage.loadBaseline({ ...config, repo: "other" })).toBeNull();
    expect(storage.loadBaseline({ ...config, tokenPath: "x" })).toBeNull();
    expect(syncScope(null)).toBe("unconfigured");
  });

  it("drops collections that are gone from the next baseline", () => {
    storage.saveBaseline(config, baselineOf({ one: ["a"], two: ["b"] }));
    storage.saveBaseline(config, baselineOf({ one: ["a"] }));
    expect(
      Object.keys(storage.loadBaseline(config)?.collections ?? {})
    ).toEqual(["one"]);
    expect(file.data[`sync-baseline:${syncScope(config)}:two`]).toBe("");
  });

  it("refuses to store a collection that would exceed the plugin data limit", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const huge = Array.from({ length: 4000 }, (_, i) => `token-number-${i}`);
    const baseline = baselineOf({ small: ["a"], huge });
    expect(JSON.stringify(baseline.collections.huge).length).toBeGreaterThan(
      MAX_ENTRY_CHARS
    );
    expect(storage.saveBaseline(config, baseline)).toBe(false);
    // Nothing was written, so there is no half-baseline to mislead the status.
    expect(Object.keys(file.data)).toEqual([]);
    expect(storage.loadBaseline(config)).toBeNull();
  });

  it("fits the real token set: about 1,000 tokens per collection", () => {
    // Real hashes are at most 7 base-36 characters (a 32-bit hash).
    const hashes = Object.fromEntries(
      Array.from({ length: 1000 }, (_, i) => [
        `color.interactive.primary-hover-state-${i}`,
        (2 ** 31 - i).toString(36),
      ])
    );
    const baseline = buildBaseline({ semantic: hashes }, { semantic: hashes });
    expect(storage.saveBaseline(config, baseline)).toBe(true);
    const stored = file.data[`sync-baseline:${syncScope(config)}:semantic`];
    expect(stored.length).toBeLessThan(MAX_ENTRY_CHARS);
  });

  it("ignores a baseline with a damaged collection entry", () => {
    storage.saveBaseline(config, baselineOf({ one: ["a"] }));
    file.data[`sync-baseline:${syncScope(config)}:one`] = "{not json";
    expect(storage.loadBaseline(config)).toBeNull();
  });

  it("ignores a baseline written by a different schema version", () => {
    storage.saveBaseline(config, baselineOf({ one: ["a"] }));
    const key = `sync-baseline-meta:${syncScope(config)}`;
    file.data[key] = JSON.stringify({
      ...JSON.parse(file.data[key]),
      schema: 999,
    });
    expect(storage.loadBaseline(config)).toBeNull();
  });
});

describe("SyncStateStorage last sync", () => {
  const storage = new SyncStateStorage();

  it("keeps two Figma files' last sync apart", () => {
    const tokenBridge = fakeFile();
    const wylieDog = fakeFile();

    vi.stubGlobal("figma", { root: tokenBridge.root });
    storage.saveLastSync(config, "2026-10-25T08:00:00.000Z");

    vi.stubGlobal("figma", { root: wylieDog.root });
    expect(storage.loadLastSync(config)).toBeNull();
    storage.saveLastSync(config, "2026-10-20T08:00:00.000Z");

    vi.stubGlobal("figma", { root: tokenBridge.root });
    expect(storage.loadLastSync(config)).toBe("2026-10-25T08:00:00.000Z");
    vi.stubGlobal("figma", { root: wylieDog.root });
    expect(storage.loadLastSync(config)).toBe("2026-10-20T08:00:00.000Z");
  });

  it("is also scoped to the repo and branch the file syncs with", () => {
    vi.stubGlobal("figma", { root: fakeFile().root });
    storage.saveLastSync(config, "2026-10-25T08:00:00.000Z");
    expect(storage.loadLastSync({ ...config, branch: "dev" })).toBeNull();
  });

  describe("Text styles choice (plan 207)", () => {
    it("is null before the file ever chose", () => {
      vi.stubGlobal("figma", { root: fakeFile().root });
      expect(storage.loadIncludeTextStyles()).toBeNull();
    });

    it("reads back both a yes and a no", () => {
      vi.stubGlobal("figma", { root: fakeFile().root });
      storage.saveIncludeTextStyles(true);
      expect(storage.loadIncludeTextStyles()).toBe(true);
      storage.saveIncludeTextStyles(false);
      expect(storage.loadIncludeTextStyles()).toBe(false);
    });

    it("belongs to the file, whatever repo or branch it syncs with", () => {
      const a = fakeFile();
      const b = fakeFile();
      vi.stubGlobal("figma", { root: a.root });
      storage.saveIncludeTextStyles(true);
      vi.stubGlobal("figma", { root: b.root });
      expect(storage.loadIncludeTextStyles()).toBeNull();
      vi.stubGlobal("figma", { root: a.root });
      expect(storage.loadIncludeTextStyles()).toBe(true);
    });

    it("treats an unreadable value as never chosen", () => {
      const file = fakeFile();
      file.data["include-text-styles"] = "maybe";
      vi.stubGlobal("figma", { root: file.root });
      expect(storage.loadIncludeTextStyles()).toBeNull();
    });
  });
});
