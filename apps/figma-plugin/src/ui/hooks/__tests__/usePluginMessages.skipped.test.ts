import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/preact";
import { usePluginMessages } from "../usePluginMessages";
import type { ConflictAwareGitHubClient } from "../../../plugin/sync/conflict-aware-github-client";

const client = {} as ConflictAwareGitHubClient;
const skipped = [
  {
    id: "V1",
    name: "easing/default",
    collection: "Semantic",
    resolvedType: "EASING",
    reason: "native EASING variables are not exported yet",
  },
];

function post(pluginMessage: Record<string, unknown>) {
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data: { pluginMessage } })
    );
  });
}

describe("usePluginMessages skippedVariables", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => usePluginMessages(client));
    expect(result.current[0].skippedVariables).toEqual([]);
  });

  it("stores skipped variables from tokens-exported", () => {
    const { result } = renderHook(() => usePluginMessages(client));
    post({ type: "tokens-exported", exportData: [], skipped });
    expect(result.current[0].skippedVariables).toEqual(skipped);
  });

  it("treats a missing skipped field as none", () => {
    const { result } = renderHook(() => usePluginMessages(client));
    post({ type: "tokens-exported", exportData: [], skipped });
    post({ type: "tokens-exported", exportData: [] });
    expect(result.current[0].skippedVariables).toEqual([]);
  });

  it("stores skipped variables from github-sync-tokens", () => {
    const { result } = renderHook(() => usePluginMessages(client));
    post({ type: "github-sync-tokens", exportData: [], skipped });
    expect(result.current[0].skippedVariables).toEqual(skipped);
  });

  it("clears the list when a new export or sync starts", () => {
    vi.spyOn(window.parent, "postMessage").mockImplementation(() => {});
    const { result } = renderHook(() => usePluginMessages(client));
    post({ type: "tokens-exported", exportData: [], skipped });
    act(() =>
      result.current[1].sendMessage({
        type: "export-tokens",
        collectionIds: [],
      } as never)
    );
    expect(result.current[0].skippedVariables).toEqual([]);
  });
});
