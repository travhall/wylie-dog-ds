import { describe, it, expect } from "vitest";
import {
  buildBaseline,
  classifyChanges,
  hashTokens,
  isSyncBaseline,
} from "../sync-baseline";
import type { ExportData, ProcessedToken } from "../../variables/processor";

const tok = (
  $value: unknown,
  extra: Partial<ProcessedToken> = {}
): ProcessedToken => ({ $type: "number", $value, ...extra });

const col = (
  name: string,
  variables: Record<string, ProcessedToken>
): ExportData => ({ [name]: { variables } });

/** Baseline taken when Figma and GitHub agreed on `tokens`. */
const agreed = (tokens: ExportData[]) =>
  buildBaseline(hashTokens(tokens), hashTokens(tokens));

const synced = [col("primitive", { a: tok(1), b: tok(2) })];

describe("classifyChanges: the three-way table", () => {
  it("is unchanged when neither side moved", () => {
    const r = classifyChanges(agreed(synced), synced, synced);
    expect(r).toMatchObject({
      hasBaseline: true,
      toPush: 0,
      toPull: 0,
      conflicts: 0,
      differences: 0,
    });
    expect(r.entries).toEqual([]);
  });

  it("counts a Figma-only edit as a push", () => {
    const local = [col("primitive", { a: tok(9), b: tok(2) })];
    const r = classifyChanges(agreed(synced), local, synced);
    expect(r).toMatchObject({ toPush: 1, toPull: 0, conflicts: 0 });
    expect(r.entries).toEqual([
      { collection: "primitive", token: "a", side: "local", kind: "modified" },
    ]);
  });

  it("counts a GitHub-only edit as a pull", () => {
    const remote = [col("primitive", { a: tok(1), b: tok(7) })];
    const r = classifyChanges(agreed(synced), synced, remote);
    expect(r).toMatchObject({ toPush: 0, toPull: 1, conflicts: 0 });
    expect(r.entries[0]).toMatchObject({ token: "b", side: "remote" });
  });

  it("flags both sides moving to different values as a conflict", () => {
    const local = [col("primitive", { a: tok(5), b: tok(2) })];
    const remote = [col("primitive", { a: tok(6), b: tok(2) })];
    const r = classifyChanges(agreed(synced), local, remote);
    expect(r).toMatchObject({ toPush: 0, toPull: 0, conflicts: 1 });
    expect(r.entries[0]).toMatchObject({ token: "a", side: "both" });
  });

  it("treats both sides moving to the same value as converged", () => {
    const both = [col("primitive", { a: tok(5), b: tok(2) })];
    const r = classifyChanges(agreed(synced), both, both);
    expect(r).toMatchObject({ toPush: 0, toPull: 0, conflicts: 0 });
    expect(r.entries).toEqual([]);
  });

  it("treats a token deleted on both sides as converged", () => {
    const both = [col("primitive", { b: tok(2) })];
    const r = classifyChanges(agreed(synced), both, both);
    expect(r.entries).toEqual([]);
  });
});

describe("classifyChanges: additions, deletions, content kinds", () => {
  it("reports a token added in Figma as a push", () => {
    const local = [col("primitive", { a: tok(1), b: tok(2), c: tok(3) })];
    const r = classifyChanges(agreed(synced), local, synced);
    expect(r.toPush).toBe(1);
    expect(r.entries[0]).toMatchObject({ token: "c", kind: "added" });
  });

  it("reports a token deleted on GitHub as a pull, not a Figma change", () => {
    const remote = [col("primitive", { a: tok(1) })];
    const r = classifyChanges(agreed(synced), synced, remote);
    expect(r).toMatchObject({ toPush: 0, toPull: 1 });
    expect(r.entries[0]).toMatchObject({
      token: "b",
      side: "remote",
      kind: "removed",
    });
  });

  it("detects a description-only change", () => {
    const local = [
      col("primitive", { a: tok(1, { $description: "new" }), b: tok(2) }),
    ];
    const r = classifyChanges(agreed(synced), local, synced);
    expect(r.toPush).toBe(1);
  });

  it("detects a valuesByMode change", () => {
    const modal = [
      col("semantic", {
        bg: tok("#fff", { valuesByMode: { Light: "#fff", Dark: "#000" } }),
      }),
    ];
    const edited = [
      col("semantic", {
        bg: tok("#fff", { valuesByMode: { Light: "#fff", Dark: "#111" } }),
      }),
    ];
    const r = classifyChanges(agreed(modal), edited, modal);
    expect(r.toPush).toBe(1);
  });

  it("ignores token order and collection order", () => {
    const two = [
      col("primitive", { a: tok(1), b: tok(2) }),
      col("semantic", { x: tok(3) }),
    ];
    const reordered = [
      col("semantic", { x: tok(3) }),
      col("primitive", { b: tok(2), a: tok(1) }),
    ];
    const r = classifyChanges(agreed(two), reordered, two);
    expect(r.entries).toEqual([]);
  });
});

describe("classifyChanges: renames", () => {
  const remote = [
    col("primitive", { "z-index.1": tok(10), "z-index.2": tok(20) }),
    col("component", { "menu.z": tok("{z-index.1}") }),
  ];
  // The owner's case: rename in Figma, Figma re-points the one alias.
  const local = [
    col("component", { "menu.z": tok("{z-index.01}") }),
    col("primitive", { "z-index.01": tok(10), "z-index.2": tok(20) }),
  ];

  it("shows the z-index rename as local changes and no remote ones", () => {
    const r = classifyChanges(agreed(remote), local, remote);
    expect(r).toMatchObject({
      hasBaseline: true,
      toPush: 2,
      toPull: 0,
      conflicts: 0,
      renamedLocal: 1,
    });
    expect(r.entries).toEqual([
      {
        collection: "component",
        token: "menu.z",
        side: "local",
        kind: "modified",
      },
      {
        collection: "primitive",
        token: "z-index.1",
        side: "local",
        kind: "renamed",
        renamedTo: "z-index.01",
      },
    ]);
  });

  it("detects a rename made on GitHub as a remote rename", () => {
    // Baseline: both sides had the "01" names; GitHub then went back to "1".
    const r = classifyChanges(agreed(local), local, remote);
    expect(r).toMatchObject({ toPush: 0, toPull: 2, renamedRemote: 1 });
  });

  it("leaves ambiguous matches as an addition plus a removal", () => {
    const base = [col("primitive", { a: tok(1), b: tok(1) })];
    const edited = [col("primitive", { c: tok(1), d: tok(1) })];
    const r = classifyChanges(agreed(base), edited, base);
    expect(r.renamedLocal).toBe(0);
    expect(r.entries.map((e) => e.kind).sort()).toEqual([
      "added",
      "added",
      "removed",
      "removed",
    ]);
  });

  it("does not pair across collections", () => {
    const base = [col("one", { a: tok(1) }), col("two", {})];
    const edited = [col("one", {}), col("two", { a: tok(1) })];
    const r = classifyChanges(agreed(base), edited, base);
    expect(r.renamedLocal).toBe(0);
    expect(r.toPush).toBe(2);
  });
});

describe("classifyChanges: no baseline", () => {
  it("falls back to the plain two-way count, with no direction", () => {
    const local = [col("primitive", { a: tok(9), c: tok(3) })];
    const r = classifyChanges(null, local, synced);
    expect(r).toMatchObject({
      hasBaseline: false,
      toPush: 0,
      toPull: 0,
      conflicts: 0,
    });
    // a changed, b missing locally, c added locally
    expect(r.differences).toBe(3);
    expect(r.entries).toEqual([]);
  });

  it("reports zero differences when the sides already match", () => {
    expect(classifyChanges(undefined, synced, synced).differences).toBe(0);
  });

  it("treats an empty baseline like a first sync of everything", () => {
    const empty = buildBaseline({}, {});
    const r = classifyChanges(empty, synced, synced);
    // Both sides "added" identical tokens: converged, nothing to do.
    expect(r).toMatchObject({ hasBaseline: true, toPush: 0, toPull: 0 });
  });
});

describe("baseline helpers", () => {
  it("records both pipelines' hashes per token and tolerates one-sided tokens", () => {
    const b = buildBaseline(
      { primitive: { a: "L" } },
      { primitive: { a: "R", b: "R2" } },
      "2026-10-25T00:00:00.000Z"
    );
    expect(b.collections.primitive).toEqual({
      a: ["L", "R"],
      b: [null, "R2"],
    });
    expect(isSyncBaseline(b)).toBe(true);
  });

  it("rejects malformed stored data", () => {
    expect(isSyncBaseline(null)).toBe(false);
    expect(
      isSyncBaseline({ schema: 99, recordedAt: "x", collections: {} })
    ).toBe(false);
    expect(isSyncBaseline({ schema: 1, collections: {} })).toBe(false);
  });
});
