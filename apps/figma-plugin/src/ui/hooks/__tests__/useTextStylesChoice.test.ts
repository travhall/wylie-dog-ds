import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/preact";
import {
  saveTextStylesChoice,
  useStoredTextStylesChoice,
} from "../useTextStylesChoice";

const pluginMessage = (message: Record<string, unknown>) =>
  act(() => {
    window.dispatchEvent(
      new MessageEvent("message", { data: { pluginMessage: message } })
    );
  });

describe("Text styles choice messages (plan 207)", () => {
  let postMessage: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("asks the plugin for the stored choice once, at startup", () => {
    renderHook(() => useStoredTextStylesChoice(vi.fn()));
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      { pluginMessage: { type: "get-text-styles-choice" } },
      "*"
    );
  });

  it("restores a stored yes, a stored no and a never-chosen null", () => {
    const dispatch = vi.fn();
    renderHook(() => useStoredTextStylesChoice(dispatch));

    pluginMessage({ type: "text-styles-choice-loaded", value: true });
    pluginMessage({ type: "text-styles-choice-loaded", value: false });
    pluginMessage({ type: "text-styles-choice-loaded", value: null });

    expect(dispatch.mock.calls.map(([a]) => a)).toEqual([
      { type: "LOAD_TEXT_STYLES_CHOICE", value: true },
      { type: "LOAD_TEXT_STYLES_CHOICE", value: false },
      { type: "LOAD_TEXT_STYLES_CHOICE", value: null },
    ]);
  });

  it("ignores other plugin messages", () => {
    const dispatch = vi.fn();
    renderHook(() => useStoredTextStylesChoice(dispatch));
    pluginMessage({ type: "last-sync-loaded", timestamp: null });
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("saves a choice through the plugin thread", () => {
    saveTextStylesChoice(false);
    expect(postMessage).toHaveBeenCalledWith(
      {
        pluginMessage: {
          type: "save-text-styles-choice",
          includeTextStyles: false,
        },
      },
      "*"
    );
  });
});
