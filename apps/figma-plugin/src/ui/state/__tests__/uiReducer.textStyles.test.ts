import { describe, expect, it } from "vitest";
import { uiReducer } from "../uiReducer";
import { initialUIState } from "../types";

describe("uiReducer Text styles choice (plan 207)", () => {
  it("starts unticked with no choice made", () => {
    expect(initialUIState.includeTextStyles).toBe(false);
    expect(initialUIState.textStylesChosen).toBe(false);
  });

  it("restores a stored yes or no", () => {
    const yes = uiReducer(initialUIState, {
      type: "LOAD_TEXT_STYLES_CHOICE",
      value: true,
    });
    expect(yes.includeTextStyles).toBe(true);
    expect(yes.textStylesChosen).toBe(true);

    const no = uiReducer(initialUIState, {
      type: "LOAD_TEXT_STYLES_CHOICE",
      value: false,
    });
    expect(no.includeTextStyles).toBe(false);
    expect(no.textStylesChosen).toBe(true);
  });

  it("leaves the box alone when the file never chose", () => {
    const state = uiReducer(initialUIState, {
      type: "LOAD_TEXT_STYLES_CHOICE",
      value: null,
    });
    expect(state).toBe(initialUIState);
  });

  it("does not let a late stored value override a click", () => {
    const clicked = uiReducer(initialUIState, {
      type: "SET_INCLUDE_TEXT_STYLES",
      value: true,
    });
    const state = uiReducer(clicked, {
      type: "LOAD_TEXT_STYLES_CHOICE",
      value: false,
    });
    expect(state.includeTextStyles).toBe(true);
  });

  describe("first-run default", () => {
    it("ticks the box when told to and records it as a choice", () => {
      const state = uiReducer(initialUIState, {
        type: "APPLY_TEXT_STYLES_DEFAULT",
        value: true,
      });
      expect(state.includeTextStyles).toBe(true);
      expect(state.textStylesChosen).toBe(true);
      expect(state.textStylesDefaultChecked).toBe(true);
    });

    it("weighs an off default once and leaves no choice behind", () => {
      const off = uiReducer(initialUIState, {
        type: "APPLY_TEXT_STYLES_DEFAULT",
        value: false,
      });
      expect(off.includeTextStyles).toBe(false);
      expect(off.textStylesChosen).toBe(false);
      expect(off.textStylesDefaultChecked).toBe(true);
      // A second Refresh does not weigh it again.
      expect(
        uiReducer(off, { type: "APPLY_TEXT_STYLES_DEFAULT", value: true })
          .includeTextStyles
      ).toBe(false);
    });

    it("never overrides a stored no", () => {
      const stored = uiReducer(initialUIState, {
        type: "LOAD_TEXT_STYLES_CHOICE",
        value: false,
      });
      const state = uiReducer(stored, {
        type: "APPLY_TEXT_STYLES_DEFAULT",
        value: true,
      });
      expect(state.includeTextStyles).toBe(false);
    });

    it("never overrides a choice made in this session", () => {
      const unticked = uiReducer(
        uiReducer(initialUIState, {
          type: "SET_INCLUDE_TEXT_STYLES",
          value: true,
        }),
        { type: "SET_INCLUDE_TEXT_STYLES", value: false }
      );
      const state = uiReducer(unticked, {
        type: "APPLY_TEXT_STYLES_DEFAULT",
        value: true,
      });
      expect(state.includeTextStyles).toBe(false);
    });
  });
});
