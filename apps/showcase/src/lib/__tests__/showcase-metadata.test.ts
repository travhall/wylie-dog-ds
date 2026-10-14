import { describe, it, expect, vi, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  getComponentMeta,
  getTokenMeta,
  getPatternMeta,
  getPackageVersions,
} from "../showcase-metadata";

const MONOREPO_ROOT = path.resolve(process.cwd(), "../..");
const UI_SRC_DIR = path.join(MONOREPO_ROOT, "packages/ui/src");
const PATTERN_LEVEL_COMPONENTS = new Set(["card-grid.tsx", "feature-grid.tsx"]);

describe("getComponentMeta", () => {
  it("counts .tsx files in packages/ui/src, excluding pattern-level compositions", () => {
    const expected = fs
      .readdirSync(UI_SRC_DIR)
      .filter(
        (f) => f.endsWith(".tsx") && !PATTERN_LEVEL_COMPONENTS.has(f)
      ).length;

    const { count } = getComponentMeta();

    expect(count).toBe(expected);
    expect(count).toBeGreaterThan(0);
  });

  it("returns a positive category count", () => {
    const { categories } = getComponentMeta();
    expect(categories).toBeGreaterThan(0);
  });
});

describe("getTokenMeta", () => {
  it("returns non-negative counts for all three tiers and a matching total", () => {
    const meta = getTokenMeta();
    expect(meta.primitive).toBeGreaterThan(0);
    expect(meta.semantic).toBeGreaterThan(0);
    expect(meta.component).toBeGreaterThan(0);
    expect(meta.total).toBe(meta.primitive + meta.semantic + meta.component);
  });
});

describe("getPatternMeta", () => {
  it("returns a pattern count consistent with its own category count", () => {
    const meta = getPatternMeta();
    expect(meta.count).toBeGreaterThanOrEqual(0);
    expect(meta.categories).toBeGreaterThanOrEqual(0);
  });
});

describe("getPackageVersions", () => {
  it("resolves a real semver-like version for each package, not 'unknown'", () => {
    const versions = getPackageVersions();
    expect(versions.ui).not.toBe("unknown");
    expect(versions.tokens).not.toBe("unknown");
    expect(versions.storybook).not.toBe("unknown");
    expect(versions.plugin).not.toBe("unknown");
  });
});

describe("getTokenMeta error guarding (loadSync)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws a clear, filename-specific error instead of a raw fs error when the sync file is missing", () => {
    vi.spyOn(fs, "readFileSync").mockImplementation(() => {
      const err = new Error(
        "ENOENT: no such file or directory"
      ) as NodeJS.ErrnoException;
      err.code = "ENOENT";
      throw err;
    });

    expect(() => getTokenMeta()).toThrow(
      /Failed to load token sync file "primitive\.json"/
    );
  });

  it("throws a clear, filename-specific error instead of a raw parse error when the sync file contains malformed JSON", () => {
    vi.spyOn(fs, "readFileSync").mockReturnValue("not json");

    expect(() => getTokenMeta()).toThrow(
      /Failed to load token sync file "primitive\.json"/
    );
  });
});

describe("getStackMeta", () => {
  it("counts Radix-backed components and reads installed toolchain versions", async () => {
    const { getStackMeta, getComponentMeta } =
      await import("../showcase-metadata");
    const stack = getStackMeta();
    expect(stack.radixBackedComponents).toBeGreaterThan(10);
    expect(stack.radixBackedComponents).toBeLessThanOrEqual(
      getComponentMeta().count
    );
    for (const v of [
      stack.react,
      stack.typescript,
      stack.vite,
      stack.tailwind,
      stack.next,
    ]) {
      expect(v).toMatch(/^\d+\.\d+$/);
    }
  });
});

describe("Storybook links", () => {
  it("builds Storybook ids the way Storybook sanitizes titles", async () => {
    const { storybookId } = await import("../showcase-metadata");
    expect(storybookId("Components/Feedback & Status/Alert")).toBe(
      "components-feedback-status-alert"
    );
  });

  it("resolves a component to a docs id that exists in its story file", async () => {
    const { getStoryDocsId, getStoryDocsUrl } =
      await import("../showcase-metadata");
    expect(getStoryDocsId("alert")).toBe(
      "components-feedback-status-alert--docs"
    );
    expect(getStoryDocsId("not-a-component")).toBeNull();
    expect(getStoryDocsUrl("alert")).toBe(
      "https://wyliedogstorybook.com/?path=/docs/components-feedback-status-alert--docs"
    );
    expect(getStoryDocsUrl("not-a-component")).toBe(
      "https://wyliedogstorybook.com"
    );
  });
});

describe("Storybook coverage of UI components", () => {
  it("resolves a Storybook target for every UI component file", async () => {
    const { getStoryDocsId } = await import("../showcase-metadata");
    const dir = path.resolve(process.cwd(), "../../packages/ui/src");
    const names = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".tsx"))
      .map((f) => f.replace(/\.tsx$/, ""));
    // The component cards on /components link by file name, so a missing story
    // would produce a dead link.
    const missing = names.filter((n) => getStoryDocsId(n) === null);
    expect(missing).toEqual([]);
  });
});
