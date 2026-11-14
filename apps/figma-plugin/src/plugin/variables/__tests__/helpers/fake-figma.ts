// A small stateful stand-in for the parts of the Figma variables API that Token
// Bridge's import and export use. It keeps real collections, modes and variables,
// so a test can import tokens, then export what Figma now holds.
import { vi } from "vitest";
import type { processCollectionsForExport } from "../../processor";

interface FakeMode {
  modeId: string;
  name: string;
}

export interface FakeVariable {
  id: string;
  name: string;
  resolvedType: string;
  scopes: string[];
  description: string;
  codeSyntax: Record<string, string>;
  valuesByMode: Record<string, unknown>;
  variableCollectionId: string;
  setValueForMode(modeId: string, value: unknown): void;
  setVariableCodeSyntax(platform: string, value: string): void;
  setPluginData(key: string, value: string): void;
  getPluginData(key: string): string;
  remove(): void;
}

export interface FakeCollection {
  id: string;
  name: string;
  modes: FakeMode[];
  defaultModeId: string;
  variableIds: string[];
  hiddenFromPublishing: boolean;
  addMode(name: string): string;
  removeMode(modeId: string): void;
  renameMode(modeId: string, name: string): void;
}

export interface FakeFigma {
  collections: FakeCollection[];
  variables: FakeVariable[];
}

/** Replaces the global `figma` with a fresh fake. Pair with vi.unstubAllGlobals(). */
export function installFakeFigma(): FakeFigma {
  const state: FakeFigma = { collections: [], variables: [] };
  let next = 1;

  vi.stubGlobal("figma", {
    variables: {
      getLocalVariableCollectionsAsync: async () => [...state.collections],
      getLocalVariablesAsync: async () => [...state.variables],
      getVariableByIdAsync: async (id: string) =>
        state.variables.find((v) => v.id === id) ?? null,
      createVariableCollection(name: string): FakeCollection {
        const first: FakeMode = { modeId: `m${next++}`, name: "Mode 1" };
        const collection: FakeCollection = {
          id: `c${next++}`,
          name,
          modes: [first],
          defaultModeId: first.modeId,
          variableIds: [],
          hiddenFromPublishing: false,
          addMode(modeName) {
            const mode = { modeId: `m${next++}`, name: modeName };
            collection.modes.push(mode);
            return mode.modeId;
          },
          removeMode(modeId) {
            collection.modes = collection.modes.filter(
              (m) => m.modeId !== modeId
            );
            for (const id of collection.variableIds) {
              const v = state.variables.find((x) => x.id === id);
              if (v) delete v.valuesByMode[modeId];
            }
          },
          renameMode(modeId, modeName) {
            const mode = collection.modes.find((m) => m.modeId === modeId);
            if (mode) mode.name = modeName;
          },
        };
        state.collections.push(collection);
        return collection;
      },
      createVariable(
        name: string,
        collection: FakeCollection,
        type: string
      ): FakeVariable {
        const plugin: Record<string, string> = {};
        const variable: FakeVariable = {
          id: `VariableID:${next++}`,
          name,
          resolvedType: type,
          // Figma creates variables unrestricted
          scopes: ["ALL_SCOPES"],
          description: "",
          codeSyntax: {},
          valuesByMode: {},
          variableCollectionId: collection.id,
          setValueForMode(modeId, value) {
            variable.valuesByMode[modeId] = value;
          },
          setVariableCodeSyntax(platform, value) {
            variable.codeSyntax[platform] = value;
          },
          setPluginData(key, value) {
            plugin[key] = value;
          },
          getPluginData: (key) => plugin[key] ?? "",
          remove() {
            state.variables.splice(state.variables.indexOf(variable), 1);
            collection.variableIds = collection.variableIds.filter(
              (id) => id !== variable.id
            );
          },
        };
        // A new variable has a value in every mode, as in Figma
        for (const mode of collection.modes) {
          variable.valuesByMode[mode.modeId] =
            type === "COLOR" ? { r: 0, g: 0, b: 0, a: 1 } : 0;
        }
        state.variables.push(variable);
        collection.variableIds.push(variable.id);
        return variable;
      },
    },
    ui: { postMessage: vi.fn() },
    notify: vi.fn(),
  });
  return state;
}

/** The collections as the export handler hands them to the processor. */
export function collectionsForExport(state: FakeFigma) {
  const collections = state.collections.map((c) => ({
    id: c.id,
    name: c.name,
    modes: c.modes,
    variables: c.variableIds
      .map((id) => state.variables.find((v) => v.id === id))
      .filter((v): v is FakeVariable => v !== undefined),
  }));
  // The fake keeps values as plain data, the processor reads them as Figma's types
  return collections as unknown as Parameters<
    typeof processCollectionsForExport
  >[0];
}
