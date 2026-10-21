import { describe, expect, it } from "vitest";
import { findCssVar, getColorModes } from "../token-values";

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
