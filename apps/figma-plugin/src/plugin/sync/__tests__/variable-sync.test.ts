import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

/**
 * variable-sync.ts polls `figma.variables` every 2s and posts a
 * "variables-changed" message to the UI when it detects a change. These
 * tests drive that poll loop with fake timers and a per-test mock of the
 * global `figma` object (the module-level mock already installed in
 * src/__tests__/setup.ts provides `getLocalVariablesAsync`; we add/override
 * `getLocalVariableCollectionsAsync` and `getLocalVariablesAsync` per test).
 *
 * The module keeps its change-detection cache in module-level state, so
 * each test re-imports a fresh instance of the module via
 * `vi.resetModules()` to avoid cache bleed between cases.
 */

type FakeCollection = { id: string; variableIds: string[] };
type FakeVariable = { id: string; valuesByMode: Record<string, unknown> };

function mockFigmaState(
  collections: FakeCollection[],
  variables: FakeVariable[]
) {
  (
    figma.variables as unknown as {
      getLocalVariableCollectionsAsync: ReturnType<typeof vi.fn>;
    }
  ).getLocalVariableCollectionsAsync = vi.fn().mockResolvedValue(collections);
  (
    figma.variables as unknown as {
      getLocalVariablesAsync: ReturnType<typeof vi.fn>;
    }
  ).getLocalVariablesAsync = vi.fn().mockResolvedValue(variables);
}

describe("variable-sync", () => {
  let startVariableSync: typeof import("../variable-sync").startVariableSync;
  let stopVariableSync: typeof import("../variable-sync").stopVariableSync;

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    const mod = await import("../variable-sync");
    startVariableSync = mod.startVariableSync;
    stopVariableSync = mod.stopVariableSync;
  });

  afterEach(() => {
    stopVariableSync();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("does not postMessage when nothing changes between polls", async () => {
    const collections = [{ id: "c1", variableIds: ["v1"] }];
    const variables = [{ id: "v1", valuesByMode: { m1: "#ffffff" } }];
    mockFigmaState(collections, variables);

    startVariableSync();
    await vi.advanceTimersByTimeAsync(0); // let the initial check resolve
    (figma.ui.postMessage as ReturnType<typeof vi.fn>).mockClear();

    // Second poll, identical state
    await vi.advanceTimersByTimeAsync(2000);

    expect(figma.ui.postMessage).not.toHaveBeenCalled();
  });

  it("postMessages when a variable is added", async () => {
    const collectionsBefore = [{ id: "c1", variableIds: ["v1"] }];
    const variablesBefore = [{ id: "v1", valuesByMode: { m1: "#ffffff" } }];
    mockFigmaState(collectionsBefore, variablesBefore);

    startVariableSync();
    await vi.advanceTimersByTimeAsync(0);
    (figma.ui.postMessage as ReturnType<typeof vi.fn>).mockClear();

    const collectionsAfter = [{ id: "c1", variableIds: ["v1", "v2"] }];
    const variablesAfter = [
      { id: "v1", valuesByMode: { m1: "#ffffff" } },
      { id: "v2", valuesByMode: { m1: "#000000" } },
    ];
    mockFigmaState(collectionsAfter, variablesAfter);

    await vi.advanceTimersByTimeAsync(2000);

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "variables-changed", variableCount: 2 })
    );
  });

  it("postMessages when a variable is removed", async () => {
    const collectionsBefore = [{ id: "c1", variableIds: ["v1", "v2"] }];
    const variablesBefore = [
      { id: "v1", valuesByMode: { m1: "#ffffff" } },
      { id: "v2", valuesByMode: { m1: "#000000" } },
    ];
    mockFigmaState(collectionsBefore, variablesBefore);

    startVariableSync();
    await vi.advanceTimersByTimeAsync(0);
    (figma.ui.postMessage as ReturnType<typeof vi.fn>).mockClear();

    const collectionsAfter = [{ id: "c1", variableIds: ["v1"] }];
    const variablesAfter = [{ id: "v1", valuesByMode: { m1: "#ffffff" } }];
    mockFigmaState(collectionsAfter, variablesAfter);

    await vi.advanceTimersByTimeAsync(2000);

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "variables-changed", variableCount: 1 })
    );
  });

  it("postMessages when a variable's value changes in place (same collections, same count)", async () => {
    const collections = [{ id: "c1", variableIds: ["v1"] }];
    const variablesBefore = [{ id: "v1", valuesByMode: { m1: "#ffffff" } }];
    mockFigmaState(collections, variablesBefore);

    startVariableSync();
    await vi.advanceTimersByTimeAsync(0);
    (figma.ui.postMessage as ReturnType<typeof vi.fn>).mockClear();

    // Same collection IDs, same variable count, only the value differs —
    // this is the bug this plan fixes: pre-fix logic (collection ID set +
    // scalar count only) would see no change here and never fire.
    const variablesAfter = [{ id: "v1", valuesByMode: { m1: "#ff0000" } }];
    mockFigmaState(collections, variablesAfter);

    await vi.advanceTimersByTimeAsync(2000);

    expect(figma.ui.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: "variables-changed", variableCount: 1 })
    );
  });
});
