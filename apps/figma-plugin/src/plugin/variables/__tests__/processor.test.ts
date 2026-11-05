import { describe, expect, it, vi } from "vitest";
import {
  findUnsupportedVariables,
  processCollectionsForExport,
} from "../processor";

const modes = [{ modeId: "m1", name: "Light" }];

type Value = string | number | boolean | Record<string, unknown>;

function variable(
  id: string,
  name: string,
  resolvedType: string,
  value: Value
) {
  return {
    id,
    name,
    resolvedType,
    scopes: ["ALL_SCOPES"],
    description: "",
    valuesByMode: { m1: value },
  };
}

function collection(
  id: string,
  name: string,
  variables: ReturnType<typeof variable>[]
) {
  return { id, name, modes, variables } as unknown as Parameters<
    typeof processCollectionsForExport
  >[0][number];
}

const red = variable("c1", "color/red", "COLOR", { r: 1, g: 0, b: 0 });
const half = variable("f1", "opacity/50", "FLOAT", 0.5);
const easing = variable("e1", "transition/easing/out", "EASING", {
  type: "CUSTOM_CUBIC_BEZIER",
  easingFunctionCubicBezier: { x1: 0, y1: 0, x2: 0.20000000298, y2: 1 },
});
// A spring is a simulation, not a curve, so it cannot be written as a cubic-bezier
const spring = variable("e2", "transition/easing/bouncy", "EASING", {
  type: "BOUNCY",
});
const timing = variable(
  "t1",
  "transition/duration/fast",
  "TIMING",
  0.15000000596
);
const composed = variable("c2", "color/scrim", "COLOR", {
  color: { r: 0, g: 0, b: 0 },
  opacity: { type: "VARIABLE_ALIAS", id: "f1" },
});

async function exportTokens(
  collections: ReturnType<typeof collection>[],
  ids = collections.map((c) => c.id)
) {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const data = await processCollectionsForExport(collections, ids);
  return Object.assign({}, ...data) as Record<
    string,
    { variables: Record<string, { $type: string; $value?: unknown }> }
  >;
}

describe("unsupported variable guard", () => {
  it("exports supported variables normally", async () => {
    const out = await exportTokens([
      collection("k1", "Primitives", [red, half]),
    ]);
    const tokens = out.Primitives.variables;
    expect(Object.keys(tokens)).toEqual(["color.red", "opacity.50"]);
    expect(tokens["opacity.50"].$value).toBe(0.5);
  });

  it("exports TIMING as a duration and EASING as a cubic-bezier, rounding float32 noise", async () => {
    const out = await exportTokens([
      collection("k1", "Semantic", [red, easing, timing]),
    ]);
    const tokens = out.Semantic.variables;
    expect(Object.keys(tokens)).toEqual([
      "color.red",
      "transition.easing.out",
      "transition.duration.fast",
    ]);
    expect(tokens["transition.duration.fast"]).toMatchObject({
      $type: "duration",
      $value: "150ms",
    });
    expect(tokens["transition.easing.out"]).toMatchObject({
      $type: "cubicBezier",
      $value: "cubic-bezier(0, 0, 0.2, 1)",
    });
  });

  it("skips a spring easing instead of exporting a raw object", async () => {
    const out = await exportTokens([
      collection("k1", "Semantic", [red, spring]),
    ]);
    expect(Object.keys(out.Semantic.variables)).toEqual(["color.red"]);
  });

  it("skips composed colors instead of exporting a token with no value", async () => {
    const out = await exportTokens([
      collection("k1", "Semantic", [red, half, composed]),
    ]);
    const tokens = out.Semantic.variables;
    expect(tokens["color.scrim"]).toBeUndefined();
    for (const token of Object.values(tokens)) {
      expect(token.$value).not.toBeUndefined();
    }
  });

  it("skips a variable that aliases a skipped one, including through a chain", async () => {
    const aliasOfSpring = variable("f2", "easing/alias", "EASING", {
      type: "VARIABLE_ALIAS",
      id: "e2",
    });
    const aliasOfAlias = variable("f3", "easing/alias2", "EASING", {
      type: "VARIABLE_ALIAS",
      id: "f2",
    });
    const out = await exportTokens([
      collection("k1", "Semantic", [red, spring, aliasOfSpring, aliasOfAlias]),
    ]);
    expect(Object.keys(out.Semantic.variables)).toEqual(["color.red"]);
  });

  it("keeps aliases between supported variables", async () => {
    const alias = variable("f2", "state/disabled", "FLOAT", {
      type: "VARIABLE_ALIAS",
      id: "f1",
    });
    const out = await exportTokens([
      collection("k1", "Semantic", [half, alias]),
    ]);
    expect(out.Semantic.variables["state.disabled"].$value).toBe(
      "{opacity.50}"
    );
  });
});

describe("findUnsupportedVariables", () => {
  const otherSpring = variable("e3", "transition/easing/slow", "EASING", {
    type: "SLOW",
  });
  const collections = [
    collection("k1", "Semantic", [red, spring, easing, timing]),
    collection("k2", "Other", [otherSpring]),
  ];

  it("reports name, collection, type and reason for a spring, and nothing for TIMING or a bezier", () => {
    const found = findUnsupportedVariables(collections);
    expect(found.map((v) => v.name)).toEqual([
      "transition/easing/bouncy",
      "transition/easing/slow",
    ]);
    expect(found[0]).toMatchObject({
      collection: "Semantic",
      resolvedType: "EASING",
      reason: expect.stringContaining("spring"),
    });
  });

  it("limits results to the selected collections", () => {
    expect(
      findUnsupportedVariables(collections, ["k2"]).map((v) => v.id)
    ).toEqual(["e3"]);
  });

  it("reports nothing when everything is supported", () => {
    expect(
      findUnsupportedVariables([collection("k1", "Primitives", [red, half])])
    ).toEqual([]);
  });
});
