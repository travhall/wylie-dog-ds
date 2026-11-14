import { describe, expect, it } from "vitest";
import { createImportOrder } from "../reference-resolver";
import { validateTokensForImport } from "../validation";
import type { ExportData } from "../processor";

// A collection is ordered by what its tokens reference, not by what it is
// called: no collection name means anything to the plugin.

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

const color = (value: string) => ({ $type: "color", $value: value });

describe("createImportOrder", () => {
  it("puts the collection that defines a token before the one that references it", () => {
    const order = createImportOrder([
      collection("aa-uses", { "brand.link": color("{ramp.blue}") }),
      collection("zz-defines", { "ramp.blue": color("#0000ff") }),
    ]);
    expect(order).toEqual(["zz-defines", "aa-uses"]);
  });

  it("is not misled by a collection whose name looks like the token's prefix", () => {
    // "color.accent" used to be assigned to a collection called "colors"
    const order = createImportOrder([
      collection("colors", { "tint.pale": color("{color.accent}") }),
      collection("brand", { "color.accent": color("#ff0000") }),
    ]);
    expect(order).toEqual(["brand", "colors"]);
  });

  it("needs no other collection for a token the collection defines itself", () => {
    const order = createImportOrder([
      collection("one", {
        "a.base": color("#111111"),
        "a.link": color("{a.base}"),
      }),
      collection("two", { "b.base": color("#222222") }),
    ]);
    expect(order).toEqual(["one", "two"]);
  });

  it("ignores a reference nothing defines", () => {
    const order = createImportOrder([
      collection("one", { "a.link": color("{missing.token}") }),
    ]);
    expect(order).toEqual(["one"]);
  });
});

describe("validation does not rule on collection names", () => {
  it("accepts a reference from a collection called primitive", () => {
    const report = validateTokensForImport([
      collection("primitive-colors", {
        "color.base": color("#ff0000"),
        "color.alias": color("{color.base}"),
      }),
    ]);
    expect(report.errors).toEqual([]);
    expect(report.valid).toBe(true);
  });
});
