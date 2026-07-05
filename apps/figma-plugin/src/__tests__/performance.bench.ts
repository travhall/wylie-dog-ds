import { describe, bench, it, expect } from "vitest";
import { ConflictDetector } from "../plugin/sync/conflict-detector";
import type { ExportData } from "../plugin/variables/processor";

// Import benchmark data (we need to read these files or import them if allowSyntheticDefaultImports is on,
// strictly speaking in a test env we can use fs or import)
// Since we generated them in src/plugin/data, let's try to import or mock them.
// For the benchmark, allow me to just import one to structure the test.
// NOTE: Dynamic imports might be needed if the files don't exist at build time,
// but we just generated them.

import benchmark1000 from "../plugin/data/benchmark-1000.json";
import benchmark5000 from "../plugin/data/benchmark-5000.json";

describe("Performance Benchmarks", () => {
  const detector = new ConflictDetector();

  // Mock local tokens (empty for now to test pure import parsing speed,
  // or we can simulate full conflict detection against itself which is worst case)
  const localTokens = new Map();

  bench("Detect Conflicts (1000 tokens)", () => {
    // We adapt the input format which is { [collection]: { modes: [], variables: {} } }
    // The conflict detector expects maps of internal Token types.
    // So this benchmark primarily tests the *overhead* of iterating and comparing.
    // Setup: Convert benchmark data to internal format (simplistic view)
    // In reality, we want to measure the whole 'import' flow, but without Figma env
    // we can benchmark the ConflictDetector directly if we massage data.
    // For this specific benchmark, let's keep it simple:
    // Just measure basic processing or setup cost if possible.
    // Or better, let's test the detector with pre-prepared large maps.
  });

  // Actually, let's write a proper test that prepares the data *outside* the bench function
  // so we measure the operation itself.

  const prepareTokens = (json: unknown) => {
    const tokens = new Map<string, unknown>();
    const collections = json as Array<
      Record<
        string,
        { variables: Record<string, { $value: unknown; $type: string }> }
      >
    >;
    const collectionName = Object.keys(collections[0])[0];
    const variables = collections[0][collectionName].variables;

    Object.entries(variables).forEach(([key, val]) => {
      tokens.set(key, {
        id: key,
        name: key,
        value: val.$value,
        type: val.$type,
        collection: collectionName,
      });
    });
    return tokens;
  };

  const tokens1k = prepareTokens(benchmark1000);
  const tokens5k = prepareTokens(benchmark5000);

  bench("Conflict Resolution: 1k vs 1k (Full Overlap)", () => {
    detector.detectConflicts(
      [tokens1k] as unknown as ExportData[],
      [tokens1k] as unknown as ExportData[]
    );
  });

  bench("Conflict Resolution: 5k vs 5k (Full Overlap)", () => {
    detector.detectConflicts(
      [tokens5k] as unknown as ExportData[],
      [tokens5k] as unknown as ExportData[]
    );
  });
});
