import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashTokens } from "../../sync/sync-baseline";

vi.mock("../../storage/file-storage", () => ({
  fileConfigStorage: { getGitHubConfig: async () => undefined },
}));

vi.mock("../../storage/sync-state-storage", () => ({
  syncStateStorage: { loadBaseline: () => null },
}));

vi.mock("../utils", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../utils")>()),
  setLoading: vi.fn(),
}));

const importMultipleCollections = vi.fn();
vi.mock("../../variables/importer", () => ({
  importMultipleCollections: (...args: unknown[]) =>
    importMultipleCollections(...args),
  parseTokenFile: async () => ({ data: [{ primitive: { variables: {} } }] }),
  validateTokenStructure: () => ({ valid: true, errors: [] }),
  validateTokenReferences: () => ({ missingReferences: [] }),
}));

import {
  exportLocalTokens,
  handleGetLocalTokens,
  handleImportTokens,
} from "../token-handlers";

/**
 * Plan 205: the export that feeds the sync status and the Pull review also
 * lists the local text styles with their token links, beside the tokens; a
 * Pull applies the reviewed style changes after the import has landed.
 */

const textStyle = (id: string, shared: Record<string, string> = {}) => ({
  id,
  name: `style-${id}`,
  type: "TEXT",
  fontName: { family: "Manrope", style: "Medium" },
  lineHeight: { unit: "AUTO" },
  letterSpacing: { unit: "PERCENT", value: 0 },
  getSharedPluginData: (ns: string, key: string) =>
    ns === "wylie-dog" ? (shared[key] ?? "") : "",
});

const variables: Record<string, unknown> = {
  v1: {
    id: "v1",
    name: "Typography/Line-Height/None",
    description: "",
    resolvedType: "FLOAT",
    scopes: [],
    valuesByMode: { m1: 100 },
    remote: false,
    key: "k1",
    getPluginData: () => "number",
  },
};

describe("text styles in the export and the import", () => {
  let posted: Array<Record<string, unknown>>;
  let styles: Record<string, ReturnType<typeof textStyle>>;
  let readFails: boolean;

  beforeEach(() => {
    posted = [];
    readFails = false;
    styles = {
      "S:1": textStyle("S:1", { lineHeightToken: "button.line-height" }),
      "S:2": textStyle("S:2"),
    };
    importMultipleCollections.mockReset().mockResolvedValue({
      success: true,
      message: "ok",
    });
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("figma", {
      ui: { postMessage: (m: Record<string, unknown>) => posted.push(m) },
      variables: {
        getLocalVariableCollectionsAsync: async () => [
          {
            id: "c1",
            name: "primitive",
            modes: [{ modeId: "m1", name: "Default" }],
            variableIds: ["v1"],
          },
        ],
        getVariableByIdAsync: async (id: string) => variables[id] ?? null,
      },
      getLocalTextStylesAsync: async () => {
        if (readFails) throw new Error("styles unavailable");
        return Object.values(styles);
      },
      getStyleByIdAsync: async (id: string) => styles[id] ?? null,
      loadFontAsync: async () => {},
    });
  });

  it("posts the text styles with their links beside the tokens", async () => {
    await handleGetLocalTokens({ type: "get-local-tokens" });
    const exported = posted.find((m) => m.type === "local-tokens-exported");
    expect(exported?.textStyles).toEqual([
      {
        id: "S:1",
        name: "style-S:1",
        lineHeight: { unit: "AUTO" },
        letterSpacing: { unit: "PERCENT", value: 0 },
        lineHeightToken: "button.line-height",
        letterSpacingToken: undefined,
      },
      {
        id: "S:2",
        name: "style-S:2",
        lineHeight: { unit: "AUTO" },
        letterSpacing: { unit: "PERCENT", value: 0 },
        lineHeightToken: undefined,
        letterSpacingToken: undefined,
      },
    ]);
  });

  it("keeps text styles out of the token objects, so hashes ignore them", async () => {
    const before = hashTokens(await exportLocalTokens());
    styles["S:1"] = textStyle("S:1", { lineHeightToken: "other.token" });
    const after = hashTokens(await exportLocalTokens());
    expect(after).toEqual(before);
  });

  it("still exports the tokens when the text styles cannot be read", async () => {
    readFails = true;
    await handleGetLocalTokens({ type: "get-local-tokens" });
    const exported = posted.find((m) => m.type === "local-tokens-exported");
    expect(exported).toBeDefined();
    expect(exported?.textStyles).toBeUndefined();
    expect(posted.some((m) => m.type === "local-tokens-error")).toBe(false);
  });

  const importMessage = (textStyleChanges?: unknown) =>
    ({
      type: "import-tokens",
      files: [{ filename: "remote-tokens.json", content: "[]" }],
      mergeStrategy: "replace",
      textStyleChanges,
    }) as never;

  const change = {
    id: "S:1",
    name: "style-S:1",
    lineHeight: { from: { unit: "AUTO" }, to: 125 },
  };

  it("applies the reviewed text style changes after a successful import", async () => {
    await handleImportTokens(importMessage([change]));
    expect(styles["S:1"].lineHeight).toEqual({ unit: "PERCENT", value: 125 });
    const done = posted.find((m) => m.type === "tokens-imported");
    expect(done?.textStyleResult).toEqual({ applied: 1, skipped: [] });
  });

  it("applies nothing, and reports nothing, when the Pull carries no text style changes", async () => {
    await handleImportTokens(importMessage(undefined));
    expect(styles["S:1"].lineHeight).toEqual({ unit: "AUTO" });
    const done = posted.find((m) => m.type === "tokens-imported");
    expect(done?.textStyleResult).toBeUndefined();
  });

  it("leaves the styles alone when the import itself failed", async () => {
    importMultipleCollections.mockResolvedValue({
      success: false,
      message: "nope",
    });
    await handleImportTokens(importMessage([change]));
    expect(styles["S:1"].lineHeight).toEqual({ unit: "AUTO" });
    const done = posted.find((m) => m.type === "tokens-imported");
    expect(done?.textStyleResult).toBeUndefined();
  });

  it("reports a style that vanished instead of failing the import", async () => {
    delete styles["S:1"];
    await handleImportTokens(importMessage([change]));
    const done = posted.find((m) => m.type === "tokens-imported");
    expect(done?.textStyleResult).toEqual({
      applied: 0,
      skipped: [{ name: "style-S:1", reason: "missing-style" }],
    });
    expect(posted.some((m) => m.type === "import-error")).toBe(false);
  });
});
