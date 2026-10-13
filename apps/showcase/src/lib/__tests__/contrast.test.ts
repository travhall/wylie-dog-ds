import { describe, expect, it } from "vitest";
import { contrastRatio, parseOklch, wcagLevel } from "../contrast";

const white = "oklch(1 0 0)";
const black = "oklch(0 0 0)";

describe("contrastRatio", () => {
  it("is 21:1 for black on white and 1:1 for a color on itself", () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 1);
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });

  it("matches a known gray: oklch(0.5 0 0) is about sRGB #636363, about 6:1 on white", () => {
    const ratio = contrastRatio("oklch(0.5 0 0)", white);
    expect(ratio).toBeGreaterThan(5.8);
    expect(ratio).toBeLessThan(6.3);
  });

  it("orders the real blue ramp: darker steps contrast more with white", () => {
    const steps = [
      "oklch(0.97 0.014 254.77)",
      "oklch(0.809 0.096 251.83)",
      "oklch(0.546 0.215 262.9)",
      "oklch(0.379 0.138 265.54)",
    ].map((c) => contrastRatio(c, white));
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
  });
});

describe("wcagLevel", () => {
  it("maps ratios to the normal-text thresholds", () => {
    expect(wcagLevel(7)).toBe("AAA");
    expect(wcagLevel(4.5)).toBe("AA");
    expect(wcagLevel(4.49)).toBeNull();
  });
});

describe("parseOklch", () => {
  it("parses the token format and rejects others", () => {
    expect(parseOklch("oklch(0.546 0.215 262.9)")).toEqual([
      0.546, 0.215, 262.9,
    ]);
    expect(() => parseOklch("#fff")).toThrow();
  });
});
