/**
 * showcase-metadata.ts
 *
 * Single source of truth for all counts shown across the Showcase app.
 * Counts are derived at request-time from actual source files — never hardcoded.
 *
 * USAGE: Import only in Server Components or server-side utilities.
 * Do NOT import in Client Components (files with "use client").
 *
 * Token counts → read from packages/tokens/io/sync/*.json (Figma Variables sync)
 * Component count → walk packages/ui/src/*.tsx (exclude pattern-level files)
 * Pattern counts → walk apps/storybook/stories/patterns/**\/*.stories.tsx
 */

import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
// Next.js sets process.cwd() to the app root (apps/showcase/), regardless of
// how webpack compiles the server bundle. We navigate from there to reach
// sibling packages in the monorepo. __dirname is NOT reliable here because
// webpack may resolve it to the .next/ output directory at runtime.

const MONOREPO_ROOT = path.resolve(process.cwd(), "../..");
const TOKENS_SYNC_DIR = path.join(MONOREPO_ROOT, "packages/tokens/io/sync");
const UI_SRC_DIR = path.join(MONOREPO_ROOT, "packages/ui/src");
const STORIES_COMPONENTS_DIR = path.join(
  MONOREPO_ROOT,
  "apps/storybook/stories/Components"
);
const PATTERNS_DIR = path.join(
  MONOREPO_ROOT,
  "apps/storybook/stories/Patterns"
);

// ---------------------------------------------------------------------------
// Token metadata
// ---------------------------------------------------------------------------

/**
 * Pattern-level compositions in packages/ui/src — these ship as UI primitives
 * but their Storybook stories live under `stories/patterns/`, so they are
 * excluded from the component count.
 */
const PATTERN_LEVEL_COMPONENTS = new Set(["card-grid.tsx", "feature-grid.tsx"]);

interface SyncCollection {
  variables: Record<string, unknown>;
}

function loadSync(filename: string): SyncCollection {
  const raw = fs.readFileSync(path.join(TOKENS_SYNC_DIR, filename), "utf-8");
  const parsed = JSON.parse(raw) as Array<Record<string, SyncCollection>>;
  // Each file is an array with one object whose only key is the collection name
  const collection = Object.values(parsed[0])[0];
  return collection;
}

function countTokensInFile(filename: string): number {
  const collection = loadSync(filename);
  return Object.keys(collection.variables).length;
}

/** Count variables whose key starts with the given prefix (before first dot). */
function countByPrefix(
  collection: SyncCollection,
  prefix: string
): number {
  return Object.keys(collection.variables).filter(
    (k) => k.split(".")[0] === prefix
  ).length;
}

export interface TokenMeta {
  /** Tokens in primitive.json (color scales, spacing steps, …) */
  primitive: number;
  /** Tokens in semantic.json (bg-primary, text-muted, …) */
  semantic: number;
  /** Tokens in components.json (per-component design decisions) */
  component: number;
  /** Sum of all three tiers */
  total: number;
}

export function getTokenMeta(): TokenMeta {
  const primitive = countTokensInFile("primitive.json");
  const semantic = countTokensInFile("semantic.json");
  const component = countTokensInFile("components.json");
  return {
    primitive,
    semantic,
    component,
    total: primitive + semantic + component,
  };
}

// ---------------------------------------------------------------------------
// Token subcategory metadata
// ---------------------------------------------------------------------------

export interface TokenSubcategoryMeta {
  /** color.* vars across primitive + semantic */
  colors: number;
  /** space.* vars in primitive */
  spacing: number;
  /** typography.* vars in primitive */
  typography: number;
  /** shadow.* vars across primitive + semantic */
  shadows: number;
  /** border-radius.* vars in primitive */
  radii: number;
  /** duration.* vars in primitive */
  motion: number;
  /** border-width.* vars in primitive */
  borders: number;
  /** opacity.* vars across primitive + semantic */
  opacity: number;
}

export function getTokenSubcategoryMeta(): TokenSubcategoryMeta {
  const primitive = loadSync("primitive.json");
  const semantic = loadSync("semantic.json");

  return {
    colors:
      countByPrefix(primitive, "color") + countByPrefix(semantic, "color"),
    spacing: countByPrefix(primitive, "space"),
    typography: countByPrefix(primitive, "typography"),
    shadows:
      countByPrefix(primitive, "shadow") + countByPrefix(semantic, "shadow"),
    radii: countByPrefix(primitive, "border-radius"),
    motion: countByPrefix(primitive, "duration"),
    borders: countByPrefix(primitive, "border-width"),
    opacity:
      countByPrefix(primitive, "opacity") + countByPrefix(semantic, "opacity"),
  };
}

// ---------------------------------------------------------------------------
// Component metadata
// ---------------------------------------------------------------------------

export interface ComponentMeta {
  /** Number of component source files (pattern-level compositions excluded) */
  count: number;
  /** Number of Storybook story categories for components */
  categories: number;
}

/**
 * Counts tsx files in packages/ui/src, excluding pattern-level compositions.
 * Category count is derived from the number of subdirectories in
 * apps/storybook/stories/Components/.
 */
export function getComponentMeta(): ComponentMeta {
  const files = fs
    .readdirSync(UI_SRC_DIR)
    .filter((f) => f.endsWith(".tsx") && !PATTERN_LEVEL_COMPONENTS.has(f));

  let categories = 6; // fallback
  try {
    const entries = fs.readdirSync(STORIES_COMPONENTS_DIR, {
      withFileTypes: true,
    });
    categories = entries.filter((e) => e.isDirectory()).length;
  } catch {
    // if dir doesn't exist, keep default
  }

  return { count: files.length, categories };
}

// ---------------------------------------------------------------------------
// Component category counts
// ---------------------------------------------------------------------------

const COMPONENT_CATEGORY_LABELS: Record<string, string> = {
  "Content Display": "Content Display",
  "Feedback-Status": "Feedback & Status",
  "Inputs-Controls": "Inputs & Controls",
  "Layout-Structure": "Layout & Structure",
  Navigation: "Navigation",
  "Overlays-Popovers": "Overlays & Popovers",
};

export interface ComponentCategoryCount {
  dirName: string;
  label: string;
  count: number;
}

export function getComponentCategoryCounts(): ComponentCategoryCount[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(STORIES_COMPONENTS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dirPath = path.join(STORIES_COMPONENTS_DIR, e.name);
      let count = 0;
      try {
        count = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith(".stories.tsx")).length;
      } catch {
        // empty
      }
      return {
        dirName: e.name,
        label: COMPONENT_CATEGORY_LABELS[e.name] ?? e.name,
        count,
      };
    });
}

// ---------------------------------------------------------------------------
// Pattern metadata
// ---------------------------------------------------------------------------

export interface PatternMeta {
  /** Total number of pattern story files */
  count: number;
  /** Number of pattern category directories (Overview excluded) */
  categories: number;
}

/**
 * Walks apps/storybook/stories/patterns/ for *.stories.tsx files.
 * The Overview directory contains no story files and is excluded from
 * the category count.
 */
export function getPatternMeta(): PatternMeta {
  const EXCLUDED_DIRS = new Set(["Overview"]);

  const entries = fs.readdirSync(PATTERNS_DIR, { withFileTypes: true });
  const categoryDirs = entries
    .filter((e) => e.isDirectory() && !EXCLUDED_DIRS.has(e.name))
    .map((e) => path.join(PATTERNS_DIR, e.name));

  let storyCount = 0;
  for (const dir of categoryDirs) {
    const stories = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".stories.tsx"));
    storyCount += stories.length;
  }

  return { count: storyCount, categories: categoryDirs.length };
}

// ---------------------------------------------------------------------------
// Pattern category counts
// ---------------------------------------------------------------------------

export interface PatternCategoryCount {
  dirName: string;
  label: string;
  count: number;
}

export function getPatternCategoryCounts(): PatternCategoryCount[] {
  const EXCLUDED_DIRS = new Set(["Overview"]);
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(PATTERNS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((e) => e.isDirectory() && !EXCLUDED_DIRS.has(e.name))
    .map((e) => {
      const dirPath = path.join(PATTERNS_DIR, e.name);
      let count = 0;
      try {
        count = fs
          .readdirSync(dirPath)
          .filter((f) => f.endsWith(".stories.tsx")).length;
      } catch {
        // empty
      }
      return {
        dirName: e.name,
        label: e.name,
        count,
      };
    });
}

// ---------------------------------------------------------------------------
// Package versions
// ---------------------------------------------------------------------------

export interface PackageVersions {
  ui: string;
  tokens: string;
  storybook: string;
  plugin: string;
}

function readPackageVersion(pkgPath: string): string {
  try {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as {
      version?: string;
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function readStorybookVersion(pkgPath: string): string {
  try {
    const raw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(raw) as {
      devDependencies?: Record<string, string>;
      dependencies?: Record<string, string>;
    };
    const deps = { ...pkg.devDependencies, ...pkg.dependencies };
    const sbKey = Object.keys(deps).find((k) => k === "@storybook/react-vite");
    if (sbKey) {
      // Strip leading ^ or ~ from semver range
      return deps[sbKey].replace(/^[\^~]/, "");
    }
    return "unknown";
  } catch {
    return "unknown";
  }
}

export function getPackageVersions(): PackageVersions {
  return {
    ui: readPackageVersion(
      path.join(MONOREPO_ROOT, "packages/ui/package.json")
    ),
    tokens: readPackageVersion(
      path.join(MONOREPO_ROOT, "packages/tokens/package.json")
    ),
    storybook: readStorybookVersion(
      path.join(MONOREPO_ROOT, "apps/storybook/package.json")
    ),
    plugin: readPackageVersion(
      path.join(MONOREPO_ROOT, "apps/figma-plugin/package.json")
    ),
  };
}

// ---------------------------------------------------------------------------
// Convenience: all metadata in one call
// ---------------------------------------------------------------------------

export interface ShowcaseMeta {
  tokens: TokenMeta;
  tokenSubcategories: TokenSubcategoryMeta;
  components: ComponentMeta;
  componentCategories: ComponentCategoryCount[];
  patterns: PatternMeta;
  patternCategories: PatternCategoryCount[];
  versions: PackageVersions;
}

export function getShowcaseMeta(): ShowcaseMeta {
  return {
    tokens: getTokenMeta(),
    tokenSubcategories: getTokenSubcategoryMeta(),
    components: getComponentMeta(),
    componentCategories: getComponentCategoryCounts(),
    patterns: getPatternMeta(),
    patternCategories: getPatternCategoryCounts(),
    versions: getPackageVersions(),
  };
}
