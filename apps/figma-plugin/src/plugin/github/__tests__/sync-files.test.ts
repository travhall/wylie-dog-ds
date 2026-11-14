import { describe, expect, it } from "vitest";
import {
  collectionsOfFiles,
  commitMessageFor,
  sameContent,
  skippedTokenItems,
} from "../sync-files";
import type { ExportData } from "../../variables/processor";

describe("sameContent", () => {
  it("is true for the same text", () => {
    expect(sameContent('{"a":1}', '{"a":1}')).toBe(true);
  });

  it("ignores formatting, indentation and a trailing newline", () => {
    const compact = '{"a":{"b":[1,2]},"c":"x"}';
    const spread =
      '{\n    "a": {\n        "b": [\n            1,\n            2\n        ]\n    },\n    "c": "x"\n}\n';
    expect(sameContent(compact, spread)).toBe(true);
  });

  it("ignores key order in objects but not order in arrays", () => {
    expect(sameContent('{"a":1,"b":2}', '{"b":2,"a":1}')).toBe(true);
    expect(sameContent('{"a":[1,2]}', '{"a":[2,1]}')).toBe(false);
  });

  it("is false when a value, a key or a type differs", () => {
    expect(sameContent('{"a":1}', '{"a":2}')).toBe(false);
    expect(sameContent('{"a":1}', '{"a":1,"b":null}')).toBe(false);
    expect(sameContent('{"a":1}', '{"a":"1"}')).toBe(false);
    expect(sameContent('{"a":{}}', '{"a":[]}')).toBe(false);
  });

  it("is false when either side is not JSON", () => {
    expect(sameContent("{", "{")).toBe(true); // identical text
    expect(sameContent("{", '{"a":1}')).toBe(false);
    expect(sameContent("", '{"a":1}')).toBe(false);
  });
});

const data = (...names: string[]) =>
  names.map((name) => ({
    [name]: { modes: [], variables: {} },
  })) as ExportData[];

describe("collectionsOfFiles", () => {
  it("maps token files, per-mode files and the native layout back to collections", () => {
    const collections = data("palette", "theme", "Brand Colors");
    expect(
      collectionsOfFiles(collections, [
        "theme.night.json",
        "brand-colors.json",
        "tokens.resolver.json",
      ])
    ).toEqual(["theme", "Brand Colors"]);
  });

  it("gives no collection for the resolver alone", () => {
    expect(
      collectionsOfFiles(data("palette"), ["tokens.resolver.json"])
    ).toEqual([]);
  });
});

describe("commitMessageFor", () => {
  const now = new Date("2026-11-14T12:00:00Z");

  it("names one collection, several, or the resolver", () => {
    expect(commitMessageFor(["theme"], now)).toBe(
      "chore: update theme tokens\n\nSynced at 2026-11-14 12:00:00 UTC"
    );
    expect(commitMessageFor(["a", "b"], now)).toContain(
      "2 collections (a, b) tokens"
    );
    expect(commitMessageFor([], now)).toContain("token resolver");
  });
});

describe("skippedTokenItems", () => {
  it("turns skipped tokens into entries for the skipped list", () => {
    expect(
      skippedTokenItems([
        { collection: "primitive", token: "color.bad", reason: "no type" },
      ])
    ).toEqual([
      {
        id: "repo-format:primitive:color.bad",
        name: "color.bad",
        collection: "primitive",
        resolvedType: "",
        reason: "no type",
        origin: "repo-format",
      },
    ]);
  });
});
