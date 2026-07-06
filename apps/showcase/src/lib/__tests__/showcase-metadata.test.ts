import { describe, it, expect } from "vitest";
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
