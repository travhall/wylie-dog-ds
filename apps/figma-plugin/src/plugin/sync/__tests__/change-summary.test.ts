import { describe, expect, it } from "vitest";
import { buildPullChangeSummary, describeToken } from "../change-summary";
import type { ConflictResolution, TokenConflict } from "../types";

function conflict(
  id: string,
  type: TokenConflict["type"],
  overrides: Partial<TokenConflict> = {}
): TokenConflict {
  return {
    type,
    severity: "low",
    tokenName: `token-${id}`,
    collectionName: "primitive",
    description: "",
    autoResolvable: false,
    suggestedResolution: "manual",
    conflictId: id,
    ...overrides,
  };
}

const take = (
  conflictId: string,
  resolution: ConflictResolution["resolution"],
  manualValue?: unknown
): ConflictResolution => ({ conflictId, resolution, manualValue });

describe("describeToken", () => {
  it("returns undefined for a missing token", () => {
    expect(describeToken(undefined)).toBeUndefined();
  });

  it("shows the value, stringifying non-strings", () => {
    expect(describeToken({ $type: "color", $value: "{color.gray.50}" })).toBe(
      "{color.gray.50}"
    );
    expect(describeToken({ $type: "number", $value: 150 })).toBe("150");
    expect(describeToken({ $type: "x", $value: { a: 1 } })).toBe('{"a":1}');
    expect(describeToken({ $type: "x", $value: undefined })).toBe("(no value)");
  });

  it("lists each mode when there are several", () => {
    expect(
      describeToken({
        $type: "color",
        $value: "{a}",
        valuesByMode: { Light: "{a}", Dark: "{b}" },
      })
    ).toBe("Light: {a} · Dark: {b}");
  });

  it("uses the plain value for a single mode", () => {
    expect(
      describeToken({
        $type: "color",
        $value: "{a}",
        valuesByMode: { Light: "{a}" },
      })
    ).toBe("{a}");
  });

  it("can prefix the type", () => {
    expect(describeToken({ $type: "number", $value: 1 }, true)).toBe(
      "(number) 1"
    );
  });
});

describe("buildPullChangeSummary", () => {
  const dim = (value: string) => ({ $type: "dimension", $value: value });

  it("applies the remote side to Figma", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "value-change", {
          tokenName: "space.025",
          localToken: dim("1px"),
          remoteToken: dim("2px"),
        }),
      ],
      [take("1", "take-remote")]
    );
    expect(summary.kept).toEqual([]);
    expect(summary.applied).toEqual([
      {
        collection: "primitive",
        token: "space.025",
        kind: "changed",
        from: "1px",
        to: "2px",
      },
    ]);
  });

  it("records kept differences separately and does not count them as applied", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "value-change", {
          localToken: dim("1px"),
          remoteToken: dim("2px"),
        }),
      ],
      [take("1", "take-local")]
    );
    expect(summary.applied).toEqual([]);
    expect(summary.kept).toHaveLength(1);
    expect(summary.kept[0]).toMatchObject({ from: "1px", to: "2px" });
  });

  it("describes additions and deletions", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "addition", {
          tokenName: "space.010",
          remoteToken: dim("1px"),
        }),
        conflict("2", "deletion", {
          tokenName: "old",
          localToken: dim("5px"),
        }),
      ],
      [take("1", "take-remote"), take("2", "take-remote")]
    );
    expect(summary.applied).toEqual([
      {
        collection: "primitive",
        token: "space.010",
        kind: "added",
        from: undefined,
        to: "1px",
      },
      {
        collection: "primitive",
        token: "old",
        kind: "removed",
        from: "5px",
        to: undefined,
      },
    ]);
  });

  it("treats name conflicts and type changes as changes, and shows both types", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "name-conflict", {
          localToken: dim("1px"),
          remoteToken: dim("2px"),
        }),
        conflict("2", "type-change", {
          localToken: { $type: "dimension", $value: "150%" },
          remoteToken: { $type: "number", $value: 150 },
        }),
      ],
      [take("1", "take-remote"), take("2", "take-remote")]
    );
    expect(summary.applied.map((i) => i.kind)).toEqual(["changed", "changed"]);
    expect(summary.applied[1]).toMatchObject({
      from: "(dimension) 150%",
      to: "(number) 150",
    });
  });

  it("applies a manual value", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "value-change", {
          localToken: dim("1px"),
          remoteToken: dim("2px"),
        }),
        conflict("2", "addition", { remoteToken: dim("3px") }),
      ],
      [take("1", "manual", "9px"), take("2", "manual", { a: 1 })]
    );
    expect(summary.applied).toMatchObject([
      { kind: "changed", from: "1px", to: "9px" },
      { kind: "added", to: '{"a":1}' },
    ]);
  });

  it("ignores conflicts that have no resolution", () => {
    const summary = buildPullChangeSummary(
      [
        conflict("1", "value-change", {
          localToken: dim("1px"),
          remoteToken: dim("2px"),
        }),
      ],
      []
    );
    expect(summary).toEqual({ applied: [], kept: [] });
  });
});
