import { describe, it, expect, vi } from "vitest";
import { setValueIfChanged, variableValuesEqual } from "../variable-values";

describe("variableValuesEqual", () => {
  it("compares numbers with the float32 tolerance Figma reads back", () => {
    expect(variableValuesEqual(0.15000000596, 0.15)).toBe(true);
    expect(variableValuesEqual(0.15, 0.16)).toBe(false);
    expect(variableValuesEqual(16, 16)).toBe(true);
  });

  it("compares colours per channel, a missing alpha meaning opaque", () => {
    expect(
      variableValuesEqual({ r: 1, g: 0.5, b: 0, a: 1 }, { r: 1, g: 0.5, b: 0 })
    ).toBe(true);
    expect(
      variableValuesEqual(
        { r: 1, g: 0.5, b: 0, a: 1 },
        { r: 1, g: 0.5, b: 0, a: 0.5 }
      )
    ).toBe(false);
  });

  it("compares aliases by the variable they point at", () => {
    const alias = (id: string) => ({ type: "VARIABLE_ALIAS", id });
    expect(variableValuesEqual(alias("v1"), alias("v1"))).toBe(true);
    expect(variableValuesEqual(alias("v1"), alias("v2"))).toBe(false);
    expect(variableValuesEqual({ r: 0, g: 0, b: 0 }, alias("v1"))).toBe(false);
  });

  it("counts a missing or different kind of value as changed", () => {
    expect(variableValuesEqual(undefined, 1)).toBe(false);
    expect(variableValuesEqual("a", "a")).toBe(true);
    expect(variableValuesEqual("a", "b")).toBe(false);
  });
});

describe("setValueIfChanged", () => {
  const variable = (value?: unknown) =>
    ({
      valuesByMode: value === undefined ? {} : { m1: value },
      setValueForMode: vi.fn(),
    }) as unknown as Variable;

  it("writes a new value and skips an unchanged one", () => {
    const fresh = variable();
    expect(setValueIfChanged(fresh, "m1", 8)).toBe(true);
    expect(fresh.setValueForMode).toHaveBeenCalledWith("m1", 8);

    const same = variable(8);
    expect(setValueIfChanged(same, "m1", 8)).toBe(false);
    expect(same.setValueForMode).not.toHaveBeenCalled();
  });

  it("still writes when the variable reports no values (a test double)", () => {
    const bare = { setValueForMode: vi.fn() } as unknown as Variable;
    expect(setValueIfChanged(bare, "m1", 8)).toBe(true);
  });
});
