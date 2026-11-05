import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  durationToSeconds,
  formatCubicBezier,
  parseCubicBezier,
  secondsToDuration,
} from "../motion-values";

// The real token files: every duration and easing must survive repo -> Figma -> repo
// unchanged (Figma stores float32), and every alias must stay within its own type,
// because Figma will not alias a TIMING variable to a number or an EASING to a string.

const SYNC_DIR = resolve(process.cwd(), "../../packages/tokens/io/sync");

type Token = { $type: string; $value: unknown };
const tokens: Record<string, Token> = {};
for (const collection of ["primitive", "semantic", "components"]) {
  const file = JSON.parse(
    readFileSync(resolve(SYNC_DIR, `${collection}.json`), "utf8")
  ) as Array<Record<string, { variables: Record<string, Token> }>>;
  for (const [name, token] of Object.entries(file[0][collection].variables)) {
    tokens[name] = token;
  }
}

const isAlias = (v: unknown): v is string =>
  typeof v === "string" && /^\{[^}]+\}$/.test(v);
const target = (v: string) => tokens[v.slice(1, -1)];

const durations = Object.entries(tokens).filter(
  ([, t]) => t.$type === "duration"
);
const easings = Object.entries(tokens).filter(
  ([, t]) => t.$type === "cubicBezier"
);

describe("the repo's real motion tokens", () => {
  it("has durations and easings to check", () => {
    expect(durations.length).toBeGreaterThanOrEqual(30);
    expect(easings.length).toBeGreaterThanOrEqual(15);
  });

  it("round-trips every literal duration through Figma's float32 seconds", () => {
    const literal = durations.filter(([, t]) => !isAlias(t.$value));
    expect(literal.length).toBeGreaterThan(10);
    for (const [name, token] of literal) {
      const seconds = durationToSeconds(token.$value);
      expect(seconds, name).not.toBeNull();
      expect(secondsToDuration(Math.fround(seconds as number)), name).toBe(
        token.$value
      );
    }
  });

  it("round-trips every literal easing through Figma's float32 bezier", () => {
    const literal = easings.filter(([, t]) => !isAlias(t.$value));
    expect(literal.length).toBeGreaterThan(3);
    for (const [name, token] of literal) {
      const figma = parseCubicBezier(token.$value);
      expect(figma, name).not.toBeNull();
      const c = figma!.easingFunctionCubicBezier!;
      const stored = {
        ...figma!,
        easingFunctionCubicBezier: {
          x1: Math.fround(c.x1),
          y1: Math.fround(c.y1),
          x2: Math.fround(c.x2),
          y2: Math.fround(c.y2),
        },
      };
      expect(formatCubicBezier(stored), name).toBe(token.$value);
    }
  });

  it("only aliases a duration to a duration and an easing to an easing", () => {
    for (const [name, token] of [...durations, ...easings]) {
      if (!isAlias(token.$value)) continue;
      const aliased = target(token.$value);
      expect(aliased, `${name} -> ${token.$value}`).toBeDefined();
      expect(aliased.$type, `${name} -> ${token.$value}`).toBe(token.$type);
    }
  });

  it("gives no other type an alias to a duration or an easing", () => {
    for (const [name, token] of Object.entries(tokens)) {
      if (token.$type === "duration" || token.$type === "cubicBezier") continue;
      if (!isAlias(token.$value)) continue;
      const aliased = target(token.$value);
      if (!aliased) continue;
      expect(
        ["duration", "cubicBezier"].includes(aliased.$type),
        `${name} aliases ${token.$value}`
      ).toBe(false);
    }
  });
});
