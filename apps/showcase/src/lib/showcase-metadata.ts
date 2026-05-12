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
 * Category count is fixed at 6 (matches Storybook's stories/components/ dirs).
 */
export function getComponentMeta(): ComponentMeta {
  const files = fs
    .readdirSync(UI_SRC_DIR)
    .filter((f) => f.endsWith(".tsx") && !PATTERN_LEVEL_COMPONENTS.has(f));
  return { count: files.length, categories: 6 };
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
// Convenience: all metadata in one call
// ---------------------------------------------------------------------------

export interface ShowcaseMeta {
  tokens: TokenMeta;
  components: ComponentMeta;
  patterns: PatternMeta;
}

export function getShowcaseMeta(): ShowcaseMeta {
  return {
    tokens: getTokenMeta(),
    components: getComponentMeta(),
    patterns: getPatternMeta(),
  };
}
