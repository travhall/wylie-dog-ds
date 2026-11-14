import { describe, expect, it } from "vitest";
import { uiReducer } from "../uiReducer";
import { initialUIState } from "../types";

describe("REQUEST_EDIT_SETUP", () => {
  it("goes to the Sync tab and counts the request", () => {
    const once = uiReducer(initialUIState, { type: "REQUEST_EDIT_SETUP" });
    expect(once.activeTab).toBe("sync");
    expect(once.editSetupRequests).toBe(1);
    const twice = uiReducer(once, { type: "REQUEST_EDIT_SETUP" });
    expect(twice.editSetupRequests).toBe(2);
  });
});
