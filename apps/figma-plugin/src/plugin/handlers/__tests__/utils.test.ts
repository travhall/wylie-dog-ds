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

  it("names a single skipped variable", () => {
    notifyUnsupportedVariables([skip("easing/default")]);
    const message = notify.mock.calls[0][0] as string;
    expect(message).toContain("Skipped 1 variable ");
    expect(message).toContain("easing/default");
  });

  it("summarizes many skipped variables", () => {
    notifyUnsupportedVariables(["a", "b", "c", "d", "e"].map(skip));
    const message = notify.mock.calls[0][0] as string;
    expect(message).toContain("Skipped 5 variables");
    expect(message).toContain("a, b, c and 2 more");
  });
});
