import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { importMultipleCollections } from "../importer";
import type { ExportData } from "../processor";

// The importer must hand an empty scope list straight to variable.scopes:
// [] hides a variable from every picker and must not become ALL_SCOPES.

type FakeVariable = {
  id: string;
  name: string;
  resolvedType: string;
  scopes: string[];
  description: string;
  remove: ReturnType<typeof vi.fn>;
  setValueForMode: ReturnType<typeof vi.fn>;
  setPluginData: ReturnType<typeof vi.fn>;
};

describe("importer applies scopes", () => {
  const variables: FakeVariable[] = [];

  beforeEach(() => {
    variables.length = 0;
    const collection = {
      id: "c1",
      name: "primitive",
      modes: [{ modeId: "m1", name: "Value" }],
      defaultModeId: "m1",
      variableIds: [] as string[],
      addMode: vi.fn(),
      removeMode: vi.fn(),
      hiddenFromPublishing: false,
    };
    vi.stubGlobal("figma", {
      variables: {
        getLocalVariableCollectionsAsync: async () => [collection],
        createVariableCollection: () => collection,
        getVariableByIdAsync: async (id: string) =>
          variables.find((v) => v.id === id) ?? null,
        createVariable: (name: string, _collection: unknown, type: string) => {
          const v: FakeVariable = {
            id: `v${variables.length}`,
            name,
            resolvedType: type,
            // Figma creates variables unrestricted
            scopes: ["ALL_SCOPES"],
            description: "",
            remove: vi.fn(() => {
              variables.splice(variables.indexOf(v), 1);
            }),
            setValueForMode: vi.fn(),
            setPluginData: vi.fn(),
          };
          variables.push(v);
          collection.variableIds.push(v.id);
          return v;
        },
      },
      ui: { postMessage: vi.fn() },
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("hides the primitive collection from publishing and says so", async () => {
    const data = [
      {
        primitive: {
          modes: [{ modeId: "m1", name: "Value" }],
          variables: { "opacity.50": { $type: "number", $value: 0.5 } },
        },
      },
    ] as unknown as ExportData[];
    const result = await importMultipleCollections(data, {
      mergeStrategy: "replace",
      createMissingModes: true,
      preserveExistingVariables: false,
    });
    expect(result.collectionsPublishingChanged).toBe(1);
    expect(result.message).toContain("hidden from publishing");
    const collection = (
      await (
        figma as unknown as {
          variables: {
            getLocalVariableCollectionsAsync: () => Promise<
              Array<{ hiddenFromPublishing: boolean }>
            >;
          };
        }
      ).variables.getLocalVariableCollectionsAsync()
    )[0];
    expect(collection.hiddenFromPublishing).toBe(true);
  });

  it("sets [] for line height and primitive colors, never ALL_SCOPES", async () => {
    const data = [
      {
        primitive: {
          modes: [{ modeId: "m1", name: "Value" }],
          variables: {
            "typography.line-height.tight": { $type: "number", $value: 125 },
            "z-index.10": { $type: "number", $value: 10 },
            "opacity.50": { $type: "number", $value: 0.5 },
            "typography.font-size.base": { $type: "number", $value: 16 },
            "color.blue.600": {
              $type: "color",
              $value: "#2563eb",
            },
          },
        },
      },
    ] as unknown as ExportData[];

    const result = await importMultipleCollections(data);
    expect(result.errors).toEqual([]);

    const scopes = Object.fromEntries(variables.map((v) => [v.name, v.scopes]));
    expect(scopes).toEqual({
      "typography/line-height/tight": [],
      "z-index/10": [],
      "opacity/50": [],
      "typography/font-size/base": ["FONT_SIZE"],
      "color/blue/600": [],
    });
  });

  it("re-applies an empty scope list to a variable that already exists", async () => {
    const data = [
      {
        primitive: {
          modes: [{ modeId: "m1", name: "Value" }],
          variables: {
            "typography.line-height.tight": { $type: "number", $value: 125 },
          },
        },
      },
    ] as unknown as ExportData[];

    await importMultipleCollections(data);
    variables[0].scopes = ["ALL_SCOPES"]; // as left by an earlier import
    await importMultipleCollections(data);

    expect(variables).toHaveLength(1);
    expect(variables[0].scopes).toEqual([]);
  });

  it("replace deletes a variable the token files no longer have, and keeps the Figma-only helpers", async () => {
    const fig = figma as unknown as {
      variables: {
        createVariable: (n: string, c: unknown, t: string) => FakeVariable;
        getLocalVariableCollectionsAsync: () => Promise<unknown[]>;
      };
    };
    const [collection] = await fig.variables.getLocalVariableCollectionsAsync();
    const removed = fig.variables.createVariable(
      "color.removed",
      collection,
      "COLOR"
    );
    const helper = fig.variables.createVariable(
      "_figma/shadow/sm",
      collection,
      "COLOR"
    );
    const data = [
      {
        primitive: {
          modes: [{ modeId: "m1", name: "Value" }],
          variables: { "opacity.50": { $type: "number", $value: 0.5 } },
        },
      },
    ] as unknown as ExportData[];
    await importMultipleCollections(data, {
      mergeStrategy: "replace",
      createMissingModes: true,
      preserveExistingVariables: false,
    });
    expect(removed.remove).toHaveBeenCalled();
    expect(helper.remove).not.toHaveBeenCalled();
  });

  describe("native motion variables (Plan 137)", () => {
    const motion = (tokens: Record<string, unknown>) =>
      [
        {
          primitive: {
            modes: [{ modeId: "m1", name: "Value" }],
            variables: tokens,
          },
        },
      ] as unknown as ExportData[];

    it("creates a duration as TIMING in seconds and an easing as EASING, without setting scopes", async () => {
      await importMultipleCollections(
        motion({
          "transition.duration.fast": { $type: "duration", $value: "150ms" },
          "transition.easing.out": {
            $type: "cubicBezier",
            $value: "cubic-bezier(0, 0, 0.2, 1)",
          },
        })
      );
      const byName = Object.fromEntries(variables.map((v) => [v.name, v]));
      const fast = byName["transition/duration/fast"];
      const out = byName["transition/easing/out"];
      expect(fast.resolvedType).toBe("TIMING");
      expect(fast.setValueForMode).toHaveBeenCalledWith("m1", 0.15);
      expect(out.resolvedType).toBe("EASING");
      expect(out.setValueForMode).toHaveBeenCalledWith("m1", {
        type: "CUSTOM_CUBIC_BEZIER",
        easingFunctionCubicBezier: { x1: 0, y1: 0, x2: 0.2, y2: 1 },
      });
      // Figma refuses scopes on these types, so the default is left alone
      expect(fast.scopes).toEqual(["ALL_SCOPES"]);
      expect(out.scopes).toEqual(["ALL_SCOPES"]);
    });

    it("replaces a duration an earlier import left as a STRING", async () => {
      await importMultipleCollections(
        motion({ "transition.duration.fast": { $type: "string", $value: "x" } })
      );
      expect(variables[0].resolvedType).toBe("STRING");
      const old = variables[0];
      await importMultipleCollections(
        motion({
          "transition.duration.fast": { $type: "duration", $value: "150ms" },
        })
      );
      expect(old.remove).toHaveBeenCalled();
      expect(variables).toHaveLength(1);
      expect(variables[0].resolvedType).toBe("TIMING");
    });
  });
});
