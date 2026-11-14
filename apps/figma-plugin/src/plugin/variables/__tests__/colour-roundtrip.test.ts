import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { convertColorToFigmaRgb } from "../importer";
import { rgbToOklch } from "../processor";

// A Pull puts the repo's OKLCH colours into Figma as RGB; a Push turns them
// back into OKLCH. Before this test the two directions used different maths,
// so every round trip moved 120+ palette colours by up to ~2 degrees of hue and
// the shift grew each time (the repo's palette crept with every Figma push).
//
// The palette is the generated io/processed/primitive.json: plain OKLCH strings
// in either sync layout. Tests run from apps/figma-plugin.
const processed = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "../../packages/tokens/io/processed/primitive.json"),
    "utf8"
  )
) as Record<string, { $type: string; $value: unknown }>;

const palette = Object.entries(processed)
  .filter(([, token]) => token.$type === "color")
  .map(([name, token]) => [name, String(token.$value)] as const);

/** One Pull then Push for one colour. Figma stores colours as 32-bit floats. */
function roundTrip(oklch: string): string {
  const rgb = convertColorToFigmaRgb(oklch);
  if (!rgb) throw new Error(`The importer could not read ${oklch}`);
  return rgbToOklch({
    r: Math.fround(rgb.r),
    g: Math.fround(rgb.g),
    b: Math.fround(rgb.b),
  });
}

const hueOf = (oklch: string) => parseFloat(oklch.split(" ")[2]);

describe("colour round trip (Pull then Push)", () => {
  it("has a real palette to test", () => {
    expect(palette.length).toBeGreaterThan(100);
  });

  it("moves no colour by more than a rounding step, however many times it repeats", () => {
    let current = palette.map(([, value]) => value);
    for (let trip = 1; trip <= 5; trip++) {
      const next = current.map(roundTrip);
      next.forEach((value, i) => {
        // Rounding to 3 decimals (L, C) and 2 (H) is the only allowed change.
        expect(Math.abs(hueOf(value) - hueOf(current[i]))).toBeLessThanOrEqual(
          0.05
        );
      });
      current = next;
    }
  });

  it("settles: after a few trips a Push writes the palette back unchanged", () => {
    let current = palette.map(([, value]) => value);
    for (let trip = 1; trip <= 3; trip++) current = current.map(roundTrip);

    const again = current.map(roundTrip);

    const moved = palette
      .map(([name], i) => (again[i] === current[i] ? null : name))
      .filter(Boolean);
    expect(moved).toEqual([]);
  });

  it("keeps the colours it was given, within rounding, after one trip", () => {
    const first = palette.map(([, value]) => roundTrip(value));
    first.forEach((value, i) => {
      const original = palette[i][1];
      const [l0, c0] = original.slice(6, -1).split(" ").map(Number);
      const [l1, c1] = value.slice(6, -1).split(" ").map(Number);
      expect(Math.abs(l1 - l0)).toBeLessThanOrEqual(0.002);
      expect(Math.abs(c1 - c0)).toBeLessThanOrEqual(0.002);
    });
  });
});
