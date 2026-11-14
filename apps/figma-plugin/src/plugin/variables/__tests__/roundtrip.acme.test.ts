import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { dtcgToNative } from "@wyliedog/tokens/dtcg-convert";
import type { ResolverFile } from "@wyliedog/tokens/dtcg-convert";
import { importMultipleCollections } from "../importer";
import { processCollectionsForExport } from "../processor";
import type { ExportData } from "../processor";
import { prepareSyncFiles } from "../../github/sync-files";
import { collectionsForExport, installFakeFigma } from "./helpers/fake-figma";

// Phase 2 of plan 224: a token set that is not the Wylie Dog three-tier layout
// must round-trip repository, Figma, repository with no data loss. The fixture is
// a made-up "Acme" system: two plain sets, two modifiers, collection names that
// say nothing about tiers.

const dir = path.join(process.cwd(), "src/plugin/__fixtures__/acme");
const read = (name: string) => fs.readFileSync(path.join(dir, name), "utf8");
const readJson = (name: string) => JSON.parse(read(name));

const resolver = readJson("tokens.resolver.json") as ResolverFile;
const fileNames = fs
  .readdirSync(dir)
  .filter((f) => f !== "tokens.resolver.json" && f.endsWith(".json"));

/** What Pull does: read the resolver and its files, convert to collections. */
function pull(): ExportData[] {
  const files: Record<string, unknown> = {};
  for (const f of fileNames) files[f] = readJson(f);
  return Object.values(dtcgToNative(resolver, files)).flat() as ExportData[];
}

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const importOptions = {
  mergeStrategy: "replace" as const,
  createMissingModes: true,
  preserveExistingVariables: false,
};

/** Import collections into a fresh fake Figma, then export them as Push would. */
async function roundTrip(collections: ExportData[], existingResolver: string) {
  const figma = installFakeFigma();
  const imported = await importMultipleCollections(collections, importOptions);
  const forExport = collectionsForExport(figma);
  const exported = await processCollectionsForExport(
    forExport,
    forExport.map((c) => c.id)
  );
  const prepared = await prepareSyncFiles(exported, async (name) =>
    name === "tokens.resolver.json" ? existingResolver : null
  );
  const written = Object.fromEntries(
    prepared.files.map((f) => [f.filename, JSON.parse(f.content)])
  );
  return { imported, exported, prepared, written };
}

describe("Acme fixture round trip", () => {
  it("imports every token and resolves every reference", async () => {
    const { imported, prepared } = await roundTrip(
      pull(),
      read("tokens.resolver.json")
    );
    expect(imported.errors).toEqual([]);
    expect(imported.unresolvedReferences).toEqual([]);
    expect(prepared.layout).toBe("dtcg");
    expect(prepared.skipped).toEqual([]);
  });

  it("writes the same token files back, byte for byte after parsing", async () => {
    const { written } = await roundTrip(pull(), read("tokens.resolver.json"));
    for (const name of fileNames) {
      expect(written[name], name).toEqual(readJson(name));
    }
    expect(Object.keys(written).sort()).toEqual(
      [...fileNames, "tokens.resolver.json"].sort()
    );
  });

  it("keeps everything the repository's resolver already said", async () => {
    const { written } = await roundTrip(pull(), read("tokens.resolver.json"));
    // Added metadata is allowed; nothing that was there may change or go
    const out = written["tokens.resolver.json"] as ResolverFile & {
      resolutionOrder: unknown[];
    };
    expect(out).toMatchObject({
      version: resolver.version,
      sets: resolver.sets,
      modifiers: resolver.modifiers,
    });
    expect(out.resolutionOrder).toEqual(
      expect.arrayContaining(resolver.resolutionOrder as unknown[])
    );
  });

  // Known gap (plan 224, phase 2 step 2). A generated modifier is matched to an
  // existing one by a name the converter derives from the first collection that
  // uses it ("theme"), not by the files it lists, so a repository whose modifier
  // is called "appearance" gets a second modifier holding the same files.
  it.fails(
    "adds no modifier or resolution step the resolver already has",
    async () => {
      const { written } = await roundTrip(pull(), read("tokens.resolver.json"));
      const out = written["tokens.resolver.json"] as {
        modifiers: Record<string, unknown>;
        resolutionOrder: unknown[];
      };
      expect(Object.keys(out.modifiers).sort()).toEqual(
        Object.keys(resolver.modifiers as object).sort()
      );
      expect(out.resolutionOrder).toEqual(resolver.resolutionOrder);
    }
  );

  it.fails("pulls back to the collections it started from", async () => {
    const first = await roundTrip(pull(), read("tokens.resolver.json"));
    const files: Record<string, unknown> = {};
    for (const name of fileNames) files[name] = first.written[name];
    const again = Object.values(
      dtcgToNative(first.written["tokens.resolver.json"] as ResolverFile, files)
    ).flat();
    expect(again).toEqual(pull());
  });

  it("is stable: a second pass writes exactly what the first did", async () => {
    const first = await roundTrip(pull(), read("tokens.resolver.json"));
    const resolverText = JSON.stringify(first.written["tokens.resolver.json"]);
    const second = await roundTrip(first.exported, resolverText);
    expect(second.written).toEqual(first.written);
  });
});

describe("structures the tier names used to decide", () => {
  const collection = (
    name: string,
    variables: Record<string, unknown>
  ): ExportData =>
    ({
      [name]: {
        modes: [{ modeId: `mode:${name}:default`, name: "Default" }],
        variables,
      },
    }) as unknown as ExportData;

  const color = (hex: string) => ({ $type: "color", $value: hex });

  // Known gap (plan 224, phase 2 step 2). The importer registers variables by
  // token name alone, across collections, and the last one wins. Two collections
  // that use the same token name silently alias each other's variables: a
  // reference in the first collection lands on the second collection's variable.
  async function referenceStaysInOwnCollection(owner: string) {
    const other = owner === "brand-a" ? "brand-b" : "brand-a";
    const data = [
      collection("brand-a", { "color.base": color("#ff0000") }),
      collection("brand-b", { "color.base": color("#0000ff") }),
    ];
    const holder = data.find((d) => owner in d) as unknown as Record<
      string,
      { variables: Record<string, unknown> }
    >;
    holder[owner].variables["color.link"] = {
      $type: "color",
      $value: "{color.base}",
    };
    const figma = installFakeFigma();
    await importMultipleCollections(data, importOptions);
    const find = (name: string, collectionName: string) =>
      figma.variables.find(
        (v) =>
          v.name === name &&
          figma.collections.find((c) => c.id === v.variableCollectionId)
            ?.name === collectionName
      );
    const value = Object.values(
      find("color/link", owner)?.valuesByMode ?? {}
    )[0] as {
      id: string;
    };
    expect(value.id).toBe(find("color/base", owner)?.id);
    expect(value.id).not.toBe(find("color/base", other)?.id);
  }

  it("keeps a reference in the last collection on its own variable", () =>
    referenceStaysInOwnCollection("brand-b"));

  it.fails(
    "keeps a reference in an earlier collection on its own variable",
    () => referenceStaysInOwnCollection("brand-a")
  );

  it("orders a collection after the one it references when neither is named for a tier", async () => {
    const data = [
      collection("zz-semantic-looking", {
        "color.link": { $type: "color", $value: "{palette-x.blue}" },
      }),
      collection("aa-base", { "palette-x.blue": color("#0000ff") }),
    ];
    const figma = installFakeFigma();
    const result = await importMultipleCollections(data, importOptions);
    expect(result.unresolvedReferences).toEqual([]);
    expect(figma.variables).toHaveLength(2);
  });
});
