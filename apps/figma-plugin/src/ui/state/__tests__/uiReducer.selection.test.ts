import { describe, expect, it } from "vitest";
import { uiReducer } from "../uiReducer";
import { initialUIState } from "../types";
import type { UIAction } from "../types";

describe("collection selection", () => {
  it("an automatic preselection fills an untouched selection", () => {
    const next = uiReducer(initialUIState, {
      type: "PRESELECT_COLLECTIONS",
      ids: ["a", "b"],
    });
    expect([...next.selectedCollections]).toEqual(["a", "b"]);
    expect(next.selectionTouched).toBe(false);
  });

  it("a person's own choice is never replaced by a preselection", () => {
    const actions: UIAction[] = [
      { type: "TOGGLE_COLLECTION", id: "x" },
      { type: "SELECT_ALL_COLLECTIONS", ids: ["x"] },
      { type: "DESELECT_ALL_COLLECTIONS" },
    ];
    for (const action of actions) {
      const chosen = uiReducer(initialUIState, action);
      expect(chosen.selectionTouched).toBe(true);
      const after = uiReducer(chosen, {
        type: "PRESELECT_COLLECTIONS",
        ids: ["a"],
      });
      expect(after.selectedCollections).toEqual(chosen.selectedCollections);
    }
  });

  it("clearing everything counts as a choice", () => {
    const cleared = uiReducer(
      uiReducer(initialUIState, {
        type: "PRESELECT_COLLECTIONS",
        ids: ["a"],
      }),
      { type: "DESELECT_ALL_COLLECTIONS" }
    );
    expect(cleared.selectedCollections.size).toBe(0);
    expect(
      uiReducer(cleared, { type: "PRESELECT_COLLECTIONS", ids: ["a"] })
        .selectedCollections.size
    ).toBe(0);
  });
});
