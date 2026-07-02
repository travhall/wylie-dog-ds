import { describe, it, expect } from "vitest";
import { ConflictDetector } from "../conflict-detector";
import { ConflictResolver } from "../conflict-resolver";
import type { ExportData, ProcessedToken } from "../../variables/processor";
import type { ConflictResolution } from "../types";

function collection(
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData {
  return { [name]: { variables } };
}

const token = ($type: string, $value: any): ProcessedToken => ({
  $type,
  $value,
});

function findToken(
  result: ExportData[],
  coll: string,
  name: string
): ProcessedToken | undefined {
  for (const data of result) {
    const t = data[coll]?.variables?.[name];
    if (t) return t;
  }
  return undefined;
}

const detector = new ConflictDetector();
const resolver = new ConflictResolver();

/** detect conflicts, then resolve them all with a single strategy */
function resolveAll(
  local: ExportData[],
  remote: ExportData[],
  strategy: "take-local" | "take-remote"
): ExportData[] {
  const { conflicts } = detector.detectConflicts(local, remote);
  const resolutions = resolver.createBatchResolutions(conflicts, strategy);
  return resolver.resolveConflicts(local, remote, resolutions);
}

describe("ConflictResolver", () => {
  describe("value-change conflicts", () => {
    const local = () => [
      collection("colors", { primary: token("color", "#ff0000") }),
    ];
    const remote = () => [
      collection("colors", { primary: token("color", "#00ff00") }),
    ];

    it("take-remote replaces the local value with the remote value", () => {
      const merged = resolveAll(local(), remote(), "take-remote");
      expect(findToken(merged, "colors", "primary")?.$value).toBe("#00ff00");
    });

    it("take-local keeps the local value", () => {
      const merged = resolveAll(local(), remote(), "take-local");
      expect(findToken(merged, "colors", "primary")?.$value).toBe("#ff0000");
    });

    it("manual applies the supplied value", () => {
      const { conflicts } = detector.detectConflicts(local(), remote());
      const resolutions: ConflictResolution[] = conflicts.map((c) => ({
        conflictId: c.conflictId,
        resolution: "manual",
        manualValue: "#0000ff",
      }));
      const merged = resolver.resolveConflicts(local(), remote(), resolutions);
      expect(findToken(merged, "colors", "primary")?.$value).toBe("#0000ff");
    });
  });

  describe("addition conflicts", () => {
    const local = () => [
      collection("colors", { a: token("color", "#111111") }),
    ];
    const remote = () => [
      collection("colors", {
        a: token("color", "#111111"),
        b: token("color", "#222222"),
      }),
    ];

    it("take-remote adds the new remote token", () => {
      const merged = resolveAll(local(), remote(), "take-remote");
      expect(findToken(merged, "colors", "b")?.$value).toBe("#222222");
    });

    it("take-local does not add the remote token", () => {
      const merged = resolveAll(local(), remote(), "take-local");
      expect(findToken(merged, "colors", "b")).toBeUndefined();
    });
  });

  describe("deletion conflicts", () => {
    const local = () => [
      collection("colors", {
        a: token("color", "#111111"),
        b: token("color", "#222222"),
      }),
    ];
    const remote = () => [
      collection("colors", { a: token("color", "#111111") }),
    ];

    it("take-remote removes the locally-deleted token", () => {
      const merged = resolveAll(local(), remote(), "take-remote");
      expect(findToken(merged, "colors", "b")).toBeUndefined();
    });

    it("take-local keeps the token", () => {
      const merged = resolveAll(local(), remote(), "take-local");
      expect(findToken(merged, "colors", "b")?.$value).toBe("#222222");
    });
  });

  describe("generateAutoResolutions", () => {
    it("auto-resolves an addition by taking remote", () => {
      const local = [collection("colors", { a: token("color", "#111111") })];
      const remote = [
        collection("colors", {
          a: token("color", "#111111"),
          b: token("color", "#222222"),
        }),
      ];

      const { conflicts } = detector.detectConflicts(local, remote);
      const autos = resolver.generateAutoResolutions(conflicts);

      expect(autos).toHaveLength(1);
      expect(autos[0].resolution).toBe("take-remote");

      const merged = resolver.resolveConflicts(local, remote, autos);
      expect(findToken(merged, "colors", "b")?.$value).toBe("#222222");
    });

    it("skips non-auto-resolvable conflicts (deletions)", () => {
      const local = [
        collection("colors", {
          a: token("color", "#111111"),
          b: token("color", "#222222"),
        }),
      ];
      const remote = [collection("colors", { a: token("color", "#111111") })];

      const { conflicts } = detector.detectConflicts(local, remote);
      // The deletion is not auto-resolvable, so nothing is generated.
      expect(resolver.generateAutoResolutions(conflicts)).toHaveLength(0);
    });
  });

  describe("integrity", () => {
    it("preserves unconflicted tokens through a resolution pass", () => {
      const local = [
        collection("colors", {
          keep: token("color", "#abcabc"),
          primary: token("color", "#ff0000"),
        }),
      ];
      const remote = [
        collection("colors", {
          keep: token("color", "#abcabc"),
          primary: token("color", "#00ff00"),
        }),
      ];

      const merged = resolveAll(local, remote, "take-remote");
      // Untouched token survives; conflicted token takes the remote value.
      expect(findToken(merged, "colors", "keep")?.$value).toBe("#abcabc");
      expect(findToken(merged, "colors", "primary")?.$value).toBe("#00ff00");
    });
  });
});
