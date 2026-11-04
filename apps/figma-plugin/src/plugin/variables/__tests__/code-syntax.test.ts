import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyCodeSyntax,
  describeCodeSyntaxResult,
  parseCodeSyntax,
  tokenPathOf,
} from "../code-syntax";

describe("parseCodeSyntax", () => {
  it("reads the WEB map and drops non-string values", () => {
    expect(
      parseCodeSyntax({
        platform: "WEB",
        syntax: { "a.b": "var(--a-b)", bad: 3, empty: "" },
      })
    ).toEqual({ "a.b": "var(--a-b)" });
  });

  it("rejects anything that is not a WEB code syntax file", () => {
    expect(parseCodeSyntax(null)).toBeNull();
    expect(parseCodeSyntax({ syntax: {} })).toBeNull();
    expect(parseCodeSyntax({ platform: "ANDROID", syntax: {} })).toBeNull();
    expect(parseCodeSyntax({ platform: "WEB" })).toBeNull();
  });
});

describe("tokenPathOf", () => {
  it("turns a variable name into a token path", () => {
    expect(tokenPathOf("button/padding-x/md")).toBe("button.padding-x.md");
  });
});

type FakeVariable = {
  name: string;
  codeSyntax: { WEB?: string };
  setVariableCodeSyntax: ReturnType<typeof vi.fn>;
};
const variable = (name: string, web?: string, fail = false): FakeVariable => {
  const v: FakeVariable = {
    name,
    codeSyntax: web ? { WEB: web } : {},
    setVariableCodeSyntax: vi.fn((_platform: string, value: string) => {
      if (fail) throw new Error("no");
      v.codeSyntax.WEB = value;
    }),
  };
  return v;
};

describe("applyCodeSyntax", () => {
  beforeEach(() => {
    vi.stubGlobal("figma", {
      variables: { getLocalVariablesAsync: vi.fn() },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  const give = (vars: FakeVariable[]) =>
    (
      figma.variables.getLocalVariablesAsync as ReturnType<typeof vi.fn>
    ).mockResolvedValue(vars);

  it("sets missing and changed syntax, leaves a correct one, ignores variables not in the map", async () => {
    const fresh = variable("a/b");
    const stale = variable("c/d", "var(--old)");
    const same = variable("e/f", "var(--e-f)");
    const other = variable("not/in/map");
    give([fresh, stale, same, other]);
    const result = await applyCodeSyntax({
      "a.b": "var(--a-b)",
      "c.d": "var(--c-d)",
      "e.f": "var(--e-f)",
      "gone.token": "var(--gone-token)",
    });
    expect(result).toEqual({ set: 2, unchanged: 1, missing: 1, failed: 0 });
    expect(fresh.setVariableCodeSyntax).toHaveBeenCalledWith(
      "WEB",
      "var(--a-b)"
    );
    expect(stale.setVariableCodeSyntax).toHaveBeenCalledWith(
      "WEB",
      "var(--c-d)"
    );
    expect(same.setVariableCodeSyntax).not.toHaveBeenCalled();
    expect(other.setVariableCodeSyntax).not.toHaveBeenCalled();
  });

  it("counts a variable it cannot write to instead of throwing", async () => {
    give([variable("a/b", undefined, true)]);
    expect(await applyCodeSyntax({ "a.b": "var(--a-b)" })).toEqual({
      set: 0,
      unchanged: 0,
      missing: 0,
      failed: 1,
    });
  });
});

describe("describeCodeSyntaxResult", () => {
  it("says nothing when nothing changed", () => {
    expect(
      describeCodeSyntaxResult({ set: 0, unchanged: 5, missing: 0, failed: 0 })
    ).toBeNull();
  });
  it("counts what was set and what failed", () => {
    expect(
      describeCodeSyntaxResult({ set: 1, unchanged: 0, missing: 0, failed: 0 })
    ).toBe("Code syntax set on 1 variable");
    expect(
      describeCodeSyntaxResult({ set: 3, unchanged: 0, missing: 0, failed: 2 })
    ).toBe("Code syntax set on 3 variables; 2 could not be written");
  });
});
