import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { conventionsFor } from "../conventions";
import { importMultipleCollections } from "../variables/importer";
import type { ExportData } from "../variables/processor";
import { installFakeFigma } from "../variables/__tests__/helpers/fake-figma";

describe("conventionsFor", () => {
  it("follows the Wylie Dog token folder, with or without slashes", () => {
    for (const tokenPath of [
      "packages/tokens/io/sync",
      "packages/tokens/io/sync/",
      "/packages/tokens/io/sync/",
    ]) {
      expect(conventionsFor({ tokenPath })).toBe("wylie-dog");
    }
  });

  it("gives another folder, and no config, no conventions", () => {
    expect(conventionsFor({ tokenPath: "tokens" })).toBe("none");
    expect(conventionsFor(null)).toBe("none");
    expect(conventionsFor(undefined)).toBe("none");
  });

  it("lets an explicit flag decide either way", () => {
    expect(
      conventionsFor({ tokenPath: "tokens", isWylieDogProject: true })
    ).toBe("wylie-dog");
    expect(
      conventionsFor({
        tokenPath: "packages/tokens/io/sync",
        isWylieDogProject: false,
      })
    ).toBe("none");
  });
});

describe("importing without Wylie Dog's conventions", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const data = [
    {
      primitive: {
        modes: [{ modeId: "m", name: "Default" }],
        variables: {
          "color.blue.600": { $type: "color", $value: "#2563eb" },
          "opacity.50": { $type: "number", $value: 0.5 },
        },
      },
    },
  ] as unknown as ExportData[];
  const options = {
    mergeStrategy: "replace" as const,
    createMissingModes: true,
    preserveExistingVariables: false,
  };

  it("leaves a palette color in every picker and hides no collection", async () => {
    const figma = installFakeFigma();
    const result = await importMultipleCollections(data, options);
    const byName = Object.fromEntries(
      figma.variables.map((v) => [v.name, v.scopes])
    );
    expect(byName["color/blue/600"]).toEqual(["ALL_SCOPES"]);
    expect(byName["opacity/50"]).toEqual(["ALL_SCOPES"]);
    expect(figma.collections[0].hiddenFromPublishing).toBe(false);
    expect(result.collectionsPublishingChanged ?? 0).toBe(0);
  });

  it("keeps a scope a designer set when the same tokens are pulled again", async () => {
    const figma = installFakeFigma();
    await importMultipleCollections(data, options);
    const blue = figma.variables.find((v) => v.name === "color/blue/600");
    if (!blue) throw new Error("variable missing");
    blue.scopes = ["FRAME_FILL"];
    figma.collections[0].hiddenFromPublishing = true;

    await importMultipleCollections(data, options);

    expect(blue.scopes).toEqual(["FRAME_FILL"]);
    expect(figma.collections[0].hiddenFromPublishing).toBe(true);
  });

  it("applies the name-based rules when Wylie Dog's conventions are asked for", async () => {
    const figma = installFakeFigma();
    await importMultipleCollections(data, {
      ...options,
      conventions: "wylie-dog",
    });
    const byName = Object.fromEntries(
      figma.variables.map((v) => [v.name, v.scopes])
    );
    expect(byName["color/blue/600"]).toEqual([]);
    expect(byName["opacity/50"]).toEqual([]);
    expect(figma.collections[0].hiddenFromPublishing).toBe(true);
  });
});
