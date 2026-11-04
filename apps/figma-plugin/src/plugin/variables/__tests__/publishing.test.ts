import { describe, it, expect } from "vitest";
import {
  applyPublishing,
  shouldHideFromPublishing,
  HIDDEN_FROM_PUBLISHING,
} from "../publishing";

describe("publishing", () => {
  it("hides primitive and components, publishes semantic (Plan 217, I1)", () => {
    expect(HIDDEN_FROM_PUBLISHING).toEqual(["primitive", "components"]);
    expect(shouldHideFromPublishing("primitive")).toBe(true);
    expect(shouldHideFromPublishing("components")).toBe(true);
    expect(shouldHideFromPublishing("semantic")).toBe(false);
    expect(shouldHideFromPublishing("Primitive")).toBe(true);
    expect(shouldHideFromPublishing("anything else")).toBe(false);
  });

  it("sets the flag and reports a change only when it differs", () => {
    const primitive = { name: "primitive", hiddenFromPublishing: false };
    expect(applyPublishing(primitive)).toBe(true);
    expect(primitive.hiddenFromPublishing).toBe(true);
    expect(applyPublishing(primitive)).toBe(false);
  });

  it("re-publishes a semantic collection someone hid by hand", () => {
    const semantic = { name: "semantic", hiddenFromPublishing: true };
    expect(applyPublishing(semantic)).toBe(true);
    expect(semantic.hiddenFromPublishing).toBe(false);
  });

  it("never throws when the collection rejects the flag", () => {
    const stubborn = {
      name: "primitive",
      get hiddenFromPublishing() {
        return false;
      },
      set hiddenFromPublishing(_value: boolean) {
        throw new Error("read only");
      },
    };
    expect(applyPublishing(stubborn)).toBe(false);
  });
});
