import { beforeEach, describe, expect, it, vi } from "vitest";
import { notifyUnsupportedVariables } from "../utils";
import type { UnsupportedVariable } from "../../variables/processor";

const skip = (name: string): UnsupportedVariable => ({
  id: name,
  name,
  collection: "Semantic",
  resolvedType: "EASING",
  reason: "native EASING variables are not exported yet",
});

describe("notifyUnsupportedVariables", () => {
  const notify = vi.fn();

  beforeEach(() => {
    notify.mockReset();
    vi.stubGlobal("figma", { notify });
  });

  it("stays silent when nothing was skipped", () => {
    notifyUnsupportedVariables([]);
    expect(notify).not.toHaveBeenCalled();
  });

  it("counts a single skipped variable", () => {
    notifyUnsupportedVariables([skip("easing/default")]);
    expect(notify.mock.calls[0][0]).toBe(
      "1 variable skipped. See the list in the plugin."
    );
  });

  it("counts many skipped variables", () => {
    notifyUnsupportedVariables(["a", "b", "c", "d", "e"].map(skip));
    expect(notify.mock.calls[0][0]).toBe(
      "5 variables skipped. See the list in the plugin."
    );
  });
});
