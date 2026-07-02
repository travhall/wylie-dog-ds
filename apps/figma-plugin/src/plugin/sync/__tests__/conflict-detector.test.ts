import { describe, it, expect } from "vitest";
import { ConflictDetector } from "../conflict-detector";
import type { ExportData, ProcessedToken } from "../../variables/processor";

/**
 * Build a single-collection ExportData wrapper (the shape detectConflicts
 * expects: an array of one-collection objects).
 */
function collection(
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData {
  return { [name]: { variables } };
}

const detect = (local: ExportData[], remote: ExportData[]) =>
  new ConflictDetector().detectConflicts(local, remote);

const token = (
  $type: string,
  $value: any,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type, $value, ...extra });

describe("ConflictDetector", () => {
  describe("no-op cases", () => {
    it("reports zero conflicts for identical token sets", () => {
      const local = [
        collection("colors", { primary: token("color", "#ff0000") }),
      ];
      const remote = [
        collection("colors", { primary: token("color", "#ff0000") }),
      ];

      const result = detect(local, remote);

      expect(result.conflicts).toHaveLength(0);
      expect(result.summary.total).toBe(0);
      expect(result.localTokenCount).toBe(1);
      expect(result.remoteTokenCount).toBe(1);
    });

    it("handles empty inputs", () => {
      const result = detect([], []);
      expect(result.conflicts).toHaveLength(0);
      expect(result.localTokenCount).toBe(0);
      expect(result.remoteTokenCount).toBe(0);
    });
  });

  describe("value changes", () => {
    it("flags a changed primitive value as a value-change conflict", () => {
      const local = [collection("space", { gap: token("dimension", "4px") })];
      const remote = [collection("space", { gap: token("dimension", "8px") })];

      const { conflicts } = detect(local, remote);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe("value-change");
      expect(conflicts[0].tokenName).toBe("space.gap");
    });

    it("does not flag a number vs its numeric-string equivalent", () => {
      const local = [collection("z", { index: token("number", 100) })];
      const remote = [collection("z", { index: token("number", "100") })];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });

    it("does not flag whitespace-only string differences", () => {
      const local = [
        collection("f", { family: token("fontFamily", " Inter ") }),
      ];
      const remote = [
        collection("f", { family: token("fontFamily", "Inter") }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });
  });

  describe("color-aware comparison", () => {
    it("exposes the documented perceptual tolerance", () => {
      expect(ConflictDetector.COLOR_TOLERANCE).toBe(0.002);
    });

    it("treats the same color in different formats as identical", () => {
      const local = [collection("colors", { red: token("color", "#ff0000") })];
      const remote = [
        collection("colors", { red: token("color", "rgb(255, 0, 0)") }),
      ];

      // Hashes differ (different strings) so the change gate opens, but the
      // perceptual comparison must recognize them as the same color.
      expect(detect(local, remote).conflicts).toHaveLength(0);
    });

    it("flags genuinely different colors", () => {
      const local = [collection("colors", { c: token("color", "#ff0000") })];
      const remote = [collection("colors", { c: token("color", "#00ff00") })];

      const { conflicts } = detect(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe("value-change");
    });

    it("suppresses color differences within tolerance", () => {
      // Euclidean diff ≈ 0.00192, just under the 0.002 threshold.
      const local = [
        collection("colors", { c: token("color", "oklch(0.5 0 0)") }),
      ];
      const remote = [
        collection("colors", { c: token("color", "oklch(0.501 0 0)") }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });

    it("flags color differences beyond tolerance", () => {
      // Euclidean diff ≈ 0.019, well beyond the threshold.
      const local = [
        collection("colors", { c: token("color", "oklch(0.5 0 0)") }),
      ];
      const remote = [
        collection("colors", { c: token("color", "oklch(0.51 0 0)") }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(1);
    });
  });

  describe("additions and deletions", () => {
    it("flags a remote-only token as an addition (low severity, auto-resolvable)", () => {
      const local = [collection("colors", { a: token("color", "#111111") })];
      const remote = [
        collection("colors", {
          a: token("color", "#111111"),
          b: token("color", "#222222"),
        }),
      ];

      const { conflicts } = detect(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        type: "addition",
        tokenName: "colors.b",
        severity: "low",
        autoResolvable: true,
        suggestedResolution: "take-remote",
      });
    });

    it("flags a local-only token as a deletion (medium severity, manual)", () => {
      const local = [
        collection("colors", {
          a: token("color", "#111111"),
          b: token("color", "#222222"),
        }),
      ];
      const remote = [collection("colors", { a: token("color", "#111111") })];

      const { conflicts } = detect(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        type: "deletion",
        tokenName: "colors.b",
        severity: "medium",
        autoResolvable: false,
        suggestedResolution: "manual",
      });
    });
  });

  describe("type changes", () => {
    it("flags a real type change as high severity and manual", () => {
      const local = [collection("t", { x: token("color", "#ff0000") })];
      const remote = [collection("t", { x: token("dimension", "8px") })];

      const { conflicts } = detect(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0]).toMatchObject({
        type: "type-change",
        severity: "high",
        autoResolvable: false,
        suggestedResolution: "manual",
      });
    });

    it("ignores a type change when the value is semantically identical", () => {
      // e.g. spacing→dimension normalization with an unchanged value.
      const local = [collection("t", { x: token("spacing", "4px") })];
      const remote = [collection("t", { x: token("dimension", "4px") })];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });
  });

  describe("mode values (light/dark)", () => {
    it("flags differing mode values as a conflict", () => {
      const local = [
        collection("colors", {
          bg: token("color", "#ffffff", {
            valuesByMode: { Light: "#ffffff", Dark: "#000000" },
          }),
        }),
      ];
      const remote = [
        collection("colors", {
          bg: token("color", "#ffffff", {
            valuesByMode: { Light: "#ffffff", Dark: "#111111" },
          }),
        }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(1);
    });

    it("applies color tolerance within mode values", () => {
      const local = [
        collection("colors", {
          bg: token("color", "#ff0000", {
            valuesByMode: { Light: "#ff0000" },
          }),
        }),
      ];
      const remote = [
        collection("colors", {
          bg: token("color", "#ff0000", {
            valuesByMode: { Light: "rgb(255, 0, 0)" },
          }),
        }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });
  });

  describe("description changes (font-source sync)", () => {
    // Regression: a token whose ONLY difference is $description was detected as
    // "changed" (the hash includes $description) but produced no conflict,
    // because compareTokens ignored $description. Result: font @fontSource()
    // descriptions never synced GitHub→Figma. See docs/DESCRIPTION_SYNC_BUG.md.
    it("flags a description-only change as a conflict", () => {
      const local = [
        collection("primitive", { "font.sans": token("fontFamily", "Inter") }),
      ];
      const remote = [
        collection("primitive", {
          "font.sans": token("fontFamily", "Inter", {
            $description:
              "@fontSource(provider:google,weights:400,subsets:latin)",
          }),
        }),
      ];

      const { conflicts } = detect(local, remote);
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe("value-change");
    });

    it("does not flag identical descriptions", () => {
      const desc = "@fontSource(provider:google)";
      const local = [
        collection("primitive", {
          "font.sans": token("fontFamily", "Inter", { $description: desc }),
        }),
      ];
      const remote = [
        collection("primitive", {
          "font.sans": token("fontFamily", "Inter", { $description: desc }),
        }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });
  });

  describe("collection scoping", () => {
    it("ignores remote collections that were not selected locally", () => {
      // Pushing only "colors" should not surface additions from an unrelated
      // "space" collection that exists remotely.
      const local = [collection("colors", { a: token("color", "#111111") })];
      const remote = [
        collection("colors", { a: token("color", "#111111") }),
        collection("space", { gap: token("dimension", "4px") }),
      ];

      expect(detect(local, remote).conflicts).toHaveLength(0);
    });
  });

  describe("summary aggregation", () => {
    it("aggregates totals, severity and resolvability", () => {
      const local = [
        collection("colors", {
          a: token("color", "#111111"), // deletion (local-only)
          shared: token("color", "#ff0000"), // value-change
        }),
      ];
      const remote = [
        collection("colors", {
          shared: token("color", "#00ff00"), // changed
          added: token("color", "#333333"), // addition
        }),
      ];

      const { conflicts, summary } = detect(local, remote);

      const types = conflicts.map((c) => c.type).sort();
      expect(types).toEqual(["addition", "deletion", "value-change"]);
      expect(summary.total).toBe(3);
      expect(summary.autoResolvable).toBe(
        conflicts.filter((c) => c.autoResolvable).length
      );
      expect(summary.requiresManualReview).toBe(
        conflicts.filter((c) => !c.autoResolvable).length
      );
      expect(summary.autoResolvable + summary.requiresManualReview).toBe(3);
    });
  });
});
