import { describe, it, expect } from "vitest";
import {
  buildPullSummaryFromDiff,
  buildSyncDiff,
  conflictsForRows,
  describeScopes,
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

describe("buildSyncDiff: picker scopes (plan 202)", () => {
  const typed = (type: string, $value: unknown = 1): ProcessedToken => ({
    $type: type,
    $value,
  });
  const tokens = [
    col("primitive", {
      "typography.font-size.sm": typed("number", 14),
      "typography.font-size.md": typed("number", 16),
      "typography.font-weight.bold": typed("number", 700),
      "color.blue.600": typed("color", "#0000ff"),
    }),
  ];
  const ALL = ["ALL_SCOPES"];
  const stale = {
    primitive: {
      "typography.font-size.sm": ALL,
      "typography.font-size.md": ALL,
      "typography.font-weight.bold": ALL,
      "color.blue.600": ALL,
    },
  };
  const diff = (
    localScopes: Record<string, Record<string, string[]>>,
    direction: "pull" | "overview" | "push" = "pull"
  ) =>
    buildSyncDiff({
      direction,
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
      localScopes,
    });

  it("reports scope changes although every token matches, grouped by transition", () => {
    const d = diff(stale);
    expect(d.rows).toEqual([]);
    expect(d.settingsCount).toBe(4);
    expect(d.settings.map((g) => [g.from, g.to, g.changes.length])).toEqual([
      [ALL, ["FONT_SIZE"], 2],
      [ALL, [], 1],
      [ALL, ["FONT_WEIGHT"], 1],
    ]);
    expect(d.settings[0].changes.map((c) => c.tokenPath)).toEqual([
      "typography.font-size.md",
      "typography.font-size.sm",
    ]);
  });

  it("ignores the order of scopes, and treats hidden as []", () => {
    const d = diff({
      primitive: {
        "typography.font-size.sm": ["FONT_SIZE"],
        "typography.font-size.md": ["FONT_SIZE"],
        "typography.font-weight.bold": ["FONT_WEIGHT"],
        "color.blue.600": [],
      },
    });
    expect(d.settings).toEqual([]);
    const colours = [
      col("c", { "color.background.x": typed("color", "#fff") }),
    ];
    const reordered = buildSyncDiff({
      direction: "pull",
      baseline: null,
      localTokens: colours,
      remoteTokens: colours,
      localScopes: {
        c: { "color.background.x": ["SHAPE_FILL", "FRAME_FILL"] },
      },
    });
    expect(reordered.settingsCount).toBe(0);
  });

  it("tells [] from ALL_SCOPES", () => {
    const d = diff({
      primitive: { ...stale.primitive, "color.blue.600": [] },
    });
    expect(
      d.settings.flatMap((g) => g.changes.map((c) => c.tokenPath))
    ).not.toContain("color.blue.600");
    const hidden = diff({
      primitive: { ...stale.primitive, "typography.font-size.sm": [] },
    });
    expect(hidden.settings.some((g) => g.from.length === 0)).toBe(true);
  });

  it("leaves variables Figma lacks to the token rows", () => {
    const d = diff({ primitive: {} });
    expect(d.settings).toEqual([]);
  });

  it("lets a token row win over a scope row for the same token", () => {
    const changed = [
      col("primitive", {
        ...(tokens[0].primitive.variables as Record<string, ProcessedToken>),
        "typography.font-size.sm": typed("number", 15),
      }),
    ];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: changed,
      localScopes: stale,
    });
    expect(d.rows.map((r) => r.toName)).toEqual(["typography.font-size.sm"]);
    expect(
      d.settings.flatMap((g) => g.changes.map((c) => c.tokenPath))
    ).not.toContain("typography.font-size.sm");
  });

  it("reports nothing for Push, and nothing without current scopes", () => {
    expect(diff(stale, "push").settings).toEqual([]);
    const none = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
    });
    expect(none.settings).toEqual([]);
    expect(none.settingsCount).toBe(0);
  });

  it("includes scopes in the overview", () => {
    expect(diff(stale, "overview").settingsCount).toBe(4);
  });

  it("describes scope sets in words", () => {
    expect(describeScopes([])).toBe("hidden from pickers");
    expect(describeScopes(["ALL_SCOPES"])).toBe("all pickers");
    expect(describeScopes(["TEXT_FILL", "SHAPE_FILL"])).toBe(
      "shape fill, text fill"
    );
  });
});

describe("buildSyncDiff: text styles (plan 205)", () => {
  const tokens = [
    col("primitive", {
      "typography.line-height.none": tok(125),
      "typography.tracking.tight": {
        $type: "dimension",
        $value: "-0.025em",
      },
    }),
    col("components", {
      "button.line-height": tok("{typography.line-height.none}"),
      "card.title.letter-spacing": {
        $type: "dimension",
        $value: "{typography.tracking.tight}",
      },
    }),
  ];
  const styles = [
    {
      id: "S:1",
      name: "button/label/sm",
      lineHeight: { unit: "PERCENT" as const, value: 100 },
      letterSpacing: { unit: "PERCENT" as const, value: 0 },
      lineHeightToken: "button.line-height",
    },
    {
      id: "S:2",
      name: "card/title",
      lineHeight: { unit: "AUTO" as const },
      letterSpacing: { unit: "PERCENT" as const, value: 0 },
      letterSpacingToken: "card.title.letter-spacing",
    },
    {
      id: "S:3",
      name: "designer/hero",
      lineHeight: { unit: "AUTO" as const },
      letterSpacing: { unit: "PERCENT" as const, value: 0 },
    },
  ];
  const diff = (
    direction: "pull" | "overview" | "push",
    localTextStyles = styles
  ) =>
    buildSyncDiff({
      direction,
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
      localTextStyles,
    });

  it("reports linked styles that lag their tokens although every token matches", () => {
    const d = diff("pull");
    expect(d.rows).toEqual([]);
    expect(d.textStyleCount).toBe(2);
    expect(d.textStyles.changes.map((c) => c.name)).toEqual([
      "button/label/sm",
      "card/title",
    ]);
    expect(d.textStyles.changes[0].lineHeight).toEqual({
      from: { unit: "PERCENT", value: 100 },
      to: 125,
    });
    expect(d.textStyles.changes[1].letterSpacing?.to).toBe(-2.5);
  });

  it("lists styles without a link as unlinked and never as changes", () => {
    const d = diff("pull");
    expect(d.textStyles.unlinked).toEqual([
      { id: "S:3", name: "designer/hero" },
    ]);
    expect(d.textStyles.changes.some((c) => c.id === "S:3")).toBe(false);
  });

  it("resolves from the incoming tokens, not from Figma's variables", () => {
    const remote = [
      col("primitive", { "typography.line-height.none": tok(110) }),
      tokens[1],
    ];
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: remote,
      localTextStyles: [styles[0]],
    });
    expect(d.textStyles.changes[0].lineHeight?.to).toBe(110);
  });

  it("includes text styles in the overview", () => {
    expect(diff("overview").textStyleCount).toBe(2);
  });

  it("reports nothing for Push, and nothing without text styles", () => {
    expect(diff("push").textStyleCount).toBe(0);
    expect(diff("push").textStyles.unlinked).toEqual([]);
    const d = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
    });
    expect(d.textStyleCount).toBe(0);
    expect(d.textStyles).toEqual({ changes: [], problems: [], unlinked: [] });
  });

  it("does not touch the token rows, counts or hashes", () => {
    const without = buildSyncDiff({
      direction: "pull",
      baseline: agreed(tokens),
      localTokens: tokens,
      remoteTokens: tokens,
    });
    const withStyles = diff("pull");
    expect(withStyles.rows).toEqual(without.rows);
    expect(withStyles.counts).toEqual(without.counts);
    expect(hashTokens(tokens)).toEqual(hashTokens(tokens));
  });
});
