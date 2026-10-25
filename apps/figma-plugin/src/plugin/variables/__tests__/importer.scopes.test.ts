import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { importMultipleCollections } from "../importer";
import type { ExportData } from "../processor";

// The importer must hand an empty scope list straight to variable.scopes:
// [] hides a variable from every picker and must not become ALL_SCOPES.

type FakeVariable = {
  id: string;
  name: string;
  scopes: string[];
  description: string;
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
    };
    vi.stubGlobal("figma", {
      variables: {
        getLocalVariableCollectionsAsync: async () => [collection],
        createVariableCollection: () => collection,
        getVariableByIdAsync: async (id: string) =>
          variables.find((v) => v.id === id) ?? null,
        createVariable: (name: string) => {
          const v: FakeVariable = {
            id: `v${variables.length}`,
            name,
            // Figma creates variables unrestricted
            scopes: ["ALL_SCOPES"],
            description: "",
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

  it("sets [] for line height and primitive colours, never ALL_SCOPES", async () => {
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
      "opacity/50": ["OPACITY"],
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
});
