import { describe, expect, it } from "vitest";
import {
  describeAlias,
  findCssVar,
  getAlias,
  getColorModes,
  parsePrimitiveRef,
  primitiveName,
  primitiveVar,
} from "../token-values";

describe("findCssVar", () => {
  it("returns the first declaration of a custom property", () => {
    const css = ":root { --a: 1; --a-b: 2; }\n.dark { --a: 3; }";
    expect(findCssVar(css, "--a")).toBe("1");
    expect(findCssVar(css, "--a-b")).toBe("2");
  });

  it("does not match a longer name that merely starts with the same text", () => {
    expect(
      findCssVar(
        "  --color-text-primary-hover: red;",
        "--color-foreground-default"
      )
    ).toBeNull();
  });

  it("returns null when the property is absent", () => {
    expect(findCssVar(":root { --a: 1; }", "--b")).toBeNull();
  });
});

describe("getColorModes", () => {
  it("reads light and dark values from the built token CSS", () => {
    const { light, dark } = getColorModes("--color-background-default");
    expect(light).toMatch(/^oklch\(/);
    expect(dark).toMatch(/^oklch\(/);
    expect(light).not.toBe(dark);
  });

  it("falls back to the light value when a token has no dark override", () => {
    // Primitive scales are static, so they have no dark override.
    const { light, dark } = getColorModes("--color-blue-600");
    expect(dark).toBe(light);
  });

  it("throws for a token that does not exist", () => {
    expect(() => getColorModes("--color-does-not-exist")).toThrow(/not found/);
  });
});

describe("parsePrimitiveRef", () => {
  it("reads a palette and step from a colour alias", () => {
    expect(parsePrimitiveRef("{color.fiery-coral.600}")).toEqual({
      palette: "fiery-coral",
      step: "600",
    });
  });

  it("returns null for anything that is not a plain colour alias", () => {
    expect(parsePrimitiveRef("{color.background.primary}")).toBeNull();
    expect(parsePrimitiveRef("oklch(0.5 0 0)")).toBeNull();
  });
});

describe("getAlias", () => {
  it("resolves a semantic colour to the primitive it points at", () => {
    const ref = getAlias("color.background.primary");
    expect(ref.step).toMatch(/^\d+$/);
    // The primitive it names exists in the built CSS.
    expect(() => getColorModes(primitiveVar(ref))).not.toThrow();
    expect(primitiveName(ref)).toBe(`${ref.palette}-${ref.step}`);
  });

  it("follows the Dark mode value, which can differ from Light", () => {
    const light = getAlias("color.foreground.default", "Light");
    const dark = getAlias("color.foreground.default", "Dark");
    expect(primitiveName(light)).not.toBe(primitiveName(dark));
    expect(describeAlias("color.foreground.default")).toBe(
      `${primitiveName(light)} in light, ${primitiveName(dark)} in dark`
    );
  });

  it("describes a token whose modes agree once", () => {
    expect(describeAlias("color.background.primary")).toMatch(
      /^[a-z-]+-\d+ in light and dark$/
    );
  });

  it("throws for a token that is missing", () => {
    expect(() => getAlias("color.background.does-not-exist")).toThrow(
      /not a plain colour alias/
    );
  });
});
