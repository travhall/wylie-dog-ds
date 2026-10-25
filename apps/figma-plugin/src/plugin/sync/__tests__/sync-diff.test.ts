import { describe, it, expect } from "vitest";
import {
  buildPullSummaryFromDiff,
  buildSyncDiff,
  conflictsForRows,
  viewText,
} from "../sync-diff";
import { buildBaseline, hashTokens } from "../sync-baseline";
import type { ExportData, ProcessedToken } from "../../variables/processor";

const tok = (
  $value: unknown,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type: "number", $value, ...extra });

const col = (
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData => ({ [name]: { variables } });

const agreed = (tokens: ExportData[]) =>
  buildBaseline(hashTokens(tokens), hashTokens(tokens));

const synced = [col("primitive", { a: tok(1), b: tok(2) })];

describe("buildSyncDiff: Push direction (Figma to GitHub)", () => {
  it("shows a Figma edit as GitHub's old value to Figma's new value, not blocking", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(synced),
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.rows).toHaveLength(1);
    expect(d.rows[0]).toMatchObject({
      kind: "changed",
      side: "local",
      fromName: "a",
      toName: "a",
      from: { value: "1" },
      to: { value: "9" },
      blocksPush: false,
    });
    expect(d.blocking).toEqual([]);
  });

  it("blocks on a GitHub-side change Figma lacks", () => {
    const remote = [col("primitive", { a: tok(1), b: tok(7) })];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(synced),
      localTokens: synced,
      remoteTokens: remote,
    });
    expect(d.blocking.map((r) => r.toName)).toEqual(["b"]);
  });

  it("blocks on a token changed on both sides to different values", () => {
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(synced),
      localTokens: [col("primitive", { a: tok(5), b: tok(2) })],
      remoteTokens: [col("primitive", { a: tok(6), b: tok(2) })],
    });
    expect(d.blocking).toHaveLength(1);
    expect(d.rows[0].side).toBe("both");
  });

  it("does not report a converged change", () => {
    const both = [col("primitive", { a: tok(5), b: tok(2) })];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(synced),
      localTokens: both,
      remoteTokens: both,
    });
    expect(d.rows).toEqual([]);
  });

  it("shows a token added in Figma as added, and one removed in Figma as removed", () => {
    const local = [col("primitive", { a: tok(1), c: tok(3) })];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(synced),
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.rows.map((r) => [r.toName, r.kind])).toEqual([
      ["b", "removed"],
      ["c", "added"],
    ]);
  });

  it("reports a rename once, with the old GitHub name to the new Figma name", () => {
    const remote = [
      col("primitive", { "z.1": tok(10) }),
      col("component", { menu: tok("{z.1}") }),
    ];
    const local = [
      col("primitive", { "z.01": tok(10) }),
      col("component", { menu: tok("{z.01}") }),
    ];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(remote),
      localTokens: local,
      remoteTokens: remote,
    });
    const rename = d.rows.find((r) => r.kind === "renamed");
    expect(rename).toMatchObject({ fromName: "z.1", toName: "z.01" });
    // The re-pointed alias is its own follow-on change.
    expect(d.rows.find((r) => r.toName === "menu")).toMatchObject({
      kind: "changed",
      from: { value: "{z.1}" },
      to: { value: "{z.01}" },
    });
    expect(d.blocking).toEqual([]);
  });

  it("only looks at the collections being pushed", () => {
    const remote = [
      col("primitive", { a: tok(1) }),
      col("semantic", { x: tok(3) }),
    ];
    const baseline = agreed(remote);
    // Push only "primitive": the semantic collection is not part of this push.
    const d = buildSyncDiff({
      direction: "push",
      baseline,
      localTokens: [col("primitive", { a: tok(1) })],
      remoteTokens: remote,
    });
    expect(d.rows).toEqual([]);
  });
});

describe("buildSyncDiff: Pull direction (GitHub to Figma)", () => {
  it("shows a GitHub edit as Figma's old value to GitHub's new value", () => {
    const remote = [col("primitive", { a: tok(1), b: tok(7) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(synced),
      localTokens: synced,
      remoteTokens: remote,
    });
    expect(d.rows[0]).toMatchObject({
      kind: "changed",
      side: "remote",
      from: { value: "2" },
      to: { value: "7" },
      overwritesFigma: false,
    });
    expect(d.overwrites).toEqual([]);
  });

  it("flags Figma-side edits that Pull would overwrite", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(synced),
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.rows[0]).toMatchObject({
      side: "local",
      from: { value: "9" },
      to: { value: "1" },
      overwritesFigma: true,
    });
    expect(d.overwrites).toHaveLength(1);
  });

  it("flags a token deleted on GitHub as a deletion in Figma", () => {
    const remote = [col("primitive", { a: tok(1) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(synced),
      localTokens: synced,
      remoteTokens: remote,
    });
    expect(d.deletions.map((r) => r.toName)).toEqual(["b"]);
    expect(d.deletions[0]).toMatchObject({
      kind: "removed",
      deletesInFigma: true,
    });
  });

  it("treats a Figma-only new variable as one Pull would delete", () => {
    const local = [col("primitive", { a: tok(1), b: tok(2), mine: tok(3) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(synced),
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.deletions.map((r) => r.toName)).toEqual(["mine"]);
    expect(d.deletions[0].overwritesFigma).toBe(true);
  });

  it("names a Figma-side rename from Figma's name to GitHub's", () => {
    const remote = [col("primitive", { "z.1": tok(10) })];
    const local = [col("primitive", { "z.01": tok(10) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(remote),
      localTokens: local,
      remoteTokens: remote,
    });
    expect(d.rows[0]).toMatchObject({
      kind: "renamed",
      fromName: "z.01",
      toName: "z.1",
    });
  });
});

describe("buildSyncDiff: row detail", () => {
  it("lists every mode of a multi-mode token", () => {
    const base = [
      col("semantic", {
        bg: tok("#fff", { valuesByMode: { Light: "#fff", Dark: "#000" } }),
      }),
    ];
    const edited = [
      col("semantic", {
        bg: tok("#fff", { valuesByMode: { Light: "#fff", Dark: "#111" } }),
      }),
    ];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(base),
      localTokens: edited,
      remoteTokens: base,
    });
    expect(d.rows[0].to?.modes).toEqual([
      { mode: "Light", value: "#fff" },
      { mode: "Dark", value: "#111" },
    ]);
    expect(viewText(d.rows[0].from)).toBe("Light: #fff · Dark: #000");
  });

  it("notes a type change and a description-only change", () => {
    const base = [col("p", { a: tok(1), b: tok(2) })];
    const edited = [
      col("p", {
        a: { $type: "string", $value: 5 },
        b: tok(2, { $description: "now documented" }),
      }),
    ];
    const d = buildSyncDiff({
      direction: "push",
      baseline: agreed(base),
      localTokens: edited,
      remoteTokens: base,
    });
    const byName = Object.fromEntries(d.rows.map((r) => [r.toName, r.notes]));
    expect(byName.a).toEqual(["type number → string"]);
    expect(byName.b).toEqual(["description changed"]);
  });
});

describe("buildSyncDiff: no baseline", () => {
  const local = [col("primitive", { a: tok(9), c: tok(3) })];

  it("lists the plain differences with unknown direction, all blocking a push", () => {
    const d = buildSyncDiff({
      direction: "push",
      baseline: null,
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.hasBaseline).toBe(false);
    expect(d.rows.every((r) => r.side === "unknown")).toBe(true);
    expect(d.rows.map((r) => [r.toName, r.kind])).toEqual([
      ["a", "changed"],
      ["b", "removed"],
      ["c", "added"],
    ]);
    expect(d.blocking).toHaveLength(3);
    expect(d.counts.differences).toBe(3);
  });

  it("flips added and removed for a pull", () => {
    const d = buildSyncDiff({
      direction: "pull",
      baseline: null,
      localTokens: local,
      remoteTokens: synced,
    });
    expect(d.rows.map((r) => [r.toName, r.kind])).toEqual([
      ["a", "changed"],
      ["b", "added"],
      ["c", "removed"],
    ]);
    expect(d.deletions.map((r) => r.toName)).toEqual(["c"]);
  });

  it("is empty when the sides match", () => {
    const d = buildSyncDiff({
      direction: "push",
      baseline: null,
      localTokens: synced,
      remoteTokens: synced,
    });
    expect(d.rows).toEqual([]);
  });
});

describe("conflictsForRows and the pull summary", () => {
  it("returns the detector's conflicts for the chosen rows, both paths of a rename", () => {
    const remote = [col("primitive", { "z.1": tok(10), keep: tok(1) })];
    const local = [col("primitive", { "z.01": tok(10), keep: tok(2) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(remote),
      localTokens: local,
      remoteTokens: remote,
    });
    const conflicts = conflictsForRows(d.rows, local, remote);
    expect(conflicts.map((c) => c.tokenName).sort()).toEqual([
      "primitive.keep",
      "primitive.z.01",
      "primitive.z.1",
    ]);
  });

  it("builds the post-pull summary from the rows", () => {
    const remote = [col("primitive", { a: tok(7) })];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(synced),
      localTokens: synced,
      remoteTokens: remote,
    });
    const summary = buildPullSummaryFromDiff(d);
    expect(summary.kept).toEqual([]);
    expect(summary.applied).toEqual([
      {
        collection: "primitive",
        token: "a",
        kind: "changed",
        from: "1",
        to: "7",
      },
      {
        collection: "primitive",
        token: "b",
        kind: "removed",
        from: "2",
        to: undefined,
      },
    ]);
  });
});
