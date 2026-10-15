import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/preact";
import { useSyncChangesSummary } from "../useSyncChangesSummary";
import type { SyncChangeSummary } from "../../../plugin/sync/change-summary";

const changes: SyncChangeSummary = {
  applied: [
    { collection: "primitive", token: "space.025", kind: "changed", to: "2px" },
  ],
  kept: [],
};

const imported = { type: "tokens-imported", result: { success: true } };

function setup() {
  return renderHook(() => useSyncChangesSummary());
}

describe("useSyncChangesSummary", () => {
  it("starts with nothing to show", () => {
    const { result } = setup();
    expect(result.current.summary).toBeNull();
  });

  it("shows the remembered changes once the import succeeds, and says it consumed the message", () => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    expect(result.current.summary).toBeNull();

    let consumed = false;
    act(() => {
      consumed = result.current.handleMessage(imported);
    });
    expect(consumed).toBe(true);
    expect(result.current.summary).toEqual(changes);
  });

  it("does not consume a successful import when nothing was remembered", () => {
    const { result } = setup();
    let consumed = true;
    act(() => {
      consumed = result.current.handleMessage(imported);
    });
    expect(consumed).toBe(false);
    expect(result.current.summary).toBeNull();
  });

  it("only shows the changes once", () => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    act(() => {
      result.current.handleMessage(imported);
    });
    act(() => result.current.dismiss());
    let consumed = true;
    act(() => {
      consumed = result.current.handleMessage(imported);
    });
    expect(consumed).toBe(false);
    expect(result.current.summary).toBeNull();
  });

  it.each([
    [
      "a failed import result",
      { type: "tokens-imported", result: { success: false } },
    ],
    ["an import error", { type: "import-error", error: "bad" }],
    ["a plugin error", { type: "error", message: "bad" }],
  ])("discards the remembered changes after %s", (_label, message) => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    let consumed = true;
    act(() => {
      consumed = result.current.handleMessage(message);
    });
    expect(consumed).toBe(false);
    act(() => {
      result.current.handleMessage(imported);
    });
    expect(result.current.summary).toBeNull();
  });

  it("ignores unrelated messages and keeps what was remembered", () => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    act(() => {
      result.current.handleMessage({ type: "loading-state" });
      result.current.handleMessage({});
    });
    act(() => {
      result.current.handleMessage(imported);
    });
    expect(result.current.summary).toEqual(changes);
  });

  it("forgets earlier changes when told to remember nothing", () => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    act(() => result.current.remember(null));
    act(() => {
      result.current.handleMessage(imported);
    });
    expect(result.current.summary).toBeNull();
  });

  it("clears the summary when dismissed", () => {
    const { result } = setup();
    act(() => result.current.remember(changes));
    act(() => {
      result.current.handleMessage(imported);
    });
    act(() => result.current.dismiss());
    expect(result.current.summary).toBeNull();
  });
});
