import { describe, expect, it } from "vitest";
import {
  durationToSeconds,
  formatCubicBezier,
  isSpringEasing,
  parseCubicBezier,
  secondsToDuration,
} from "../motion-values";

describe("duration tokens and TIMING variables", () => {
  it("reads milliseconds, seconds and a bare number (milliseconds) as seconds", () => {
    expect(durationToSeconds("150ms")).toBe(0.15);
    expect(durationToSeconds("0.3s")).toBe(0.3);
    expect(durationToSeconds("2s")).toBe(2);
    expect(durationToSeconds(250)).toBe(0.25);
    expect(durationToSeconds(" 400 ms ")).toBe(0.4);
    expect(durationToSeconds("0ms")).toBe(0);
  });

  it("rejects what is not a time", () => {
    expect(durationToSeconds("fast")).toBeNull();
    expect(durationToSeconds("{transition.duration.fast}")).toBeNull();
    expect(durationToSeconds(undefined)).toBeNull();
    expect(durationToSeconds(Number.NaN)).toBeNull();
  });

  it("writes whole milliseconds back, ignoring float32 noise", () => {
    // 0.15 comes back from Figma as 0.15000000596
    expect(secondsToDuration(0.15000000596)).toBe("150ms");
    expect(secondsToDuration(0.25)).toBe("250ms");
    expect(secondsToDuration(2)).toBe("2000ms");
    expect(secondsToDuration(0)).toBe("0ms");
    expect(secondsToDuration(0.075000003)).toBe("75ms");
  });

  it("round-trips every duration the repo uses", () => {
    for (const ms of [
      0, 75, 100, 150, 200, 250, 300, 400, 500, 700, 1000, 2000,
    ]) {
      const seconds = Math.fround(durationToSeconds(`${ms}ms`) as number);
      expect(secondsToDuration(seconds)).toBe(`${ms}ms`);
    }
  });
});

describe("cubic-bezier tokens and EASING variables", () => {
  it("reads a cubic-bezier string as a custom bezier", () => {
    expect(parseCubicBezier("cubic-bezier(0.4, 0, 0.2, 1)")).toEqual({
      type: "CUSTOM_CUBIC_BEZIER",
      easingFunctionCubicBezier: { x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
    });
    expect(parseCubicBezier("cubic-bezier(0,0,1,1)")).toEqual({
      type: "CUSTOM_CUBIC_BEZIER",
      easingFunctionCubicBezier: { x1: 0, y1: 0, x2: 1, y2: 1 },
    });
  });

  it("rejects what is not a cubic-bezier", () => {
    expect(parseCubicBezier("ease-in-out")).toBeNull();
    expect(parseCubicBezier("cubic-bezier(0.4, 0, 0.2)")).toBeNull();
    expect(parseCubicBezier("{transition.easing.out}")).toBeNull();
    expect(parseCubicBezier(undefined)).toBeNull();
  });

  it("writes the repo's format back, ignoring float32 noise", () => {
    expect(
      formatCubicBezier({
        type: "CUSTOM_CUBIC_BEZIER",
        easingFunctionCubicBezier: {
          x1: 0,
          y1: 0,
          x2: 0.20000000298,
          y2: 1,
        },
      })
    ).toBe("cubic-bezier(0, 0, 0.2, 1)");
    expect(
      formatCubicBezier({
        type: "CUSTOM_CUBIC_BEZIER",
        easingFunctionCubicBezier: { x1: 0.4, y1: 0, x2: 0.2, y2: 1 },
      })
    ).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
  });

  it("writes a named easing as its curve (Figma stores the equivalent bezier)", () => {
    expect(
      formatCubicBezier({
        type: "EASE_OUT",
        easingFunctionCubicBezier: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
      })
    ).toBe("cubic-bezier(0, 0, 0.58, 1)");
  });

  it("round-trips every easing the repo uses", () => {
    for (const curve of [
      "cubic-bezier(0.4, 0, 0.2, 1)",
      "cubic-bezier(0.4, 0, 1, 1)",
      "cubic-bezier(0, 0, 0.2, 1)",
      "cubic-bezier(0, 0, 1, 1)",
    ]) {
      const figma = parseCubicBezier(curve)!;
      const c = figma.easingFunctionCubicBezier!;
      // what Figma hands back after storing float32
      const stored = {
        ...figma,
        easingFunctionCubicBezier: {
          x1: Math.fround(c.x1),
          y1: Math.fround(c.y1),
          x2: Math.fround(c.x2),
          y2: Math.fround(c.y2),
        },
      };
      expect(formatCubicBezier(stored)).toBe(curve);
    }
  });

  it("does not export a spring as a curve", () => {
    for (const type of ["GENTLE", "QUICK", "BOUNCY", "SLOW", "CUSTOM_SPRING"]) {
      expect(isSpringEasing({ type })).toBe(true);
      expect(formatCubicBezier({ type })).toBeNull();
    }
    expect(isSpringEasing({ type: "CUSTOM_CUBIC_BEZIER" })).toBe(false);
    expect(formatCubicBezier({ type: "LINEAR" })).toBeNull();
  });
});
