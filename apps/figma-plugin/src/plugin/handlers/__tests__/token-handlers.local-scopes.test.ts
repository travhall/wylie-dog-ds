import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashTokens } from "../../sync/sync-baseline";

vi.mock("../../storage/file-storage", () => ({
  fileConfigStorage: { getGitHubConfig: async () => undefined },
}));

vi.mock("../../storage/sync-state-storage", () => ({
  syncStateStorage: { loadBaseline: () => null },
}));

import { exportLocalTokens, handleGetLocalTokens } from "../token-handlers";

/**
 * Plan 202: the export that feeds the sync status and the Pull review also
 * reports each variable's current Figma scopes, beside the tokens and never
 * inside them, so token hashes and the baseline do not move.
 */

const variables: Record<string, unknown> = {
  v1: {
    id: "v1",
    name: "Typography/Font-Size/SM",
    description: "",
    resolvedType: "FLOAT",
    scopes: ["ALL_SCOPES"],
    valuesByMode: { m1: 14 },
    remote: false,
    key: "k1",
    getPluginData: () => "number",
  },
  v2: {
    id: "v2",
    name: "color/blue/600",
    description: "",
    resolvedType: "COLOR",
    scopes: [],
    valuesByMode: { m1: { r: 0, g: 0, b: 1, a: 1 } },
    remote: false,
    key: "k2",
    getPluginData: () => "color",
  },
};

describe("get-local-tokens scopes", () => {
  let posted: Array<Record<string, unknown>>;

  beforeEach(() => {
    posted = [];
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.stubGlobal("figma", {
      ui: { postMessage: (m: Record<string, unknown>) => posted.push(m) },
      variables: {
        getLocalVariableCollectionsAsync: async () => [
          {
            id: "c1",
            name: "primitive",
            modes: [{ modeId: "m1", name: "Default" }],
            variableIds: ["v1", "v2"],
          },
        ],
        getVariableByIdAsync: async (id: string) => variables[id] ?? null,
      },
    });
  });

  it("posts current scopes keyed by collection and token name, beside the tokens", async () => {
    await handleGetLocalTokens({ type: "get-local-tokens" });

    const exported = posted.find((m) => m.type === "local-tokens-exported");
    expect(exported?.localScopes).toEqual({
      primitive: {
        "typography.font-size.sm": ["ALL_SCOPES"],
        "color.blue.600": [],
      },
    });
    // The keys match the exported token names, so the UI can join them
    const tokenNames = Object.keys(
      (exported?.localTokens as Array<Record<string, { variables: object }>>)[0]
        .primitive.variables
    );
    expect(tokenNames.sort()).toEqual([
      "color.blue.600",
      "typography.font-size.sm",
    ]);
  });

  it("keeps scopes out of the token objects, so hashes ignore them", async () => {
    const before = hashTokens(await exportLocalTokens());
    (variables.v1 as { scopes: string[] }).scopes = ["FONT_SIZE"];
    const after = hashTokens(await exportLocalTokens());
    (variables.v1 as { scopes: string[] }).scopes = ["ALL_SCOPES"];
    expect(after).toEqual(before);
  });
});
