import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { apcaContrast, contrastRatio } from "@wyliedog/tokens/color";
import { brandImage } from "./brand-image";
import { chromeBrand, chromeExtras, chromePalette } from "./chrome-palette";
import type { Mode } from "./chrome-palette";

const modes: Mode[] = ["light", "dark"];

describe.each(modes)("manager palette, %s", (mode) => {
  const p = chromePalette(mode);
  const ratio = (fg: string, bg: string) => contrastRatio(fg, bg);

  it("gives every key a valid hex color", () => {
    for (const value of Object.values(p))
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("keeps body and muted text at 4.5:1 on every surface it sits on", () => {
    for (const bg of [p.appBg, p.appContentBg, p.appPreviewBg]) {
      expect(ratio(p.textColor, bg)).toBeGreaterThanOrEqual(4.5);
      expect(ratio(p.textMutedColor, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps toolbar text and the selected label at 4.5:1 on the bar", () => {
    expect(ratio(p.barTextColor, p.barBg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(p.barSelectedColor, p.barBg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(p.barHoverColor, p.barBg)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps an input's text at 4.5:1 and its boundary at 3:1", () => {
    expect(ratio(p.inputTextColor, p.inputBg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(p.inputBorder, p.inputBg)).toBeGreaterThanOrEqual(3);
  });

  it("puts light text on the primary fill, readable by both measures", () => {
    expect(ratio(p.textInverseColor, p.colorPrimary)).toBeGreaterThanOrEqual(
      4.5
    );
    expect(
      apcaContrast(p.textInverseColor, p.colorPrimary)
    ).toBeGreaterThanOrEqual(60);
  });

  it("keeps the secondary color, which Storybook draws as text, at 4.5:1 on the bar and the content", () => {
    for (const bg of [p.barBg, p.appContentBg, p.appBg]) {
      expect(ratio(p.colorSecondary, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("reads the selected sidebar item's text on its tint, and its bar against the tint and the sidebar", () => {
    const { selectedBg, selectedText, selectedBar } = chromeExtras(mode);
    expect(ratio(selectedText, selectedBg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(selectedBar, selectedBg)).toBeGreaterThanOrEqual(3);
    expect(ratio(selectedBar, p.appBg)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the brand wordmark at 4.5:1 and the tile at 3:1 on the sidebar, and builds both from those colors", () => {
    const { tile, ink } = chromeBrand(mode);
    expect(ratio(ink, p.appBg)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(tile, p.appBg)).toBeGreaterThanOrEqual(3);
    const image = decodeURIComponent(brandImage(mode));
    expect(image).toContain(`fill="${tile}"`);
    expect(image).toContain(`fill="${ink}"`);
    expect(image).toMatch(/^data:image\/svg\+xml;utf8,<svg /);
  });

  it("keeps the checked-control accent at 3:1 against the content surface", () => {
    expect(
      ratio(chromeExtras(mode).control, p.appContentBg)
    ).toBeGreaterThanOrEqual(3);
  });
});

describe("manager theme source", () => {
  it("names no color: every value comes from a token", () => {
    for (const file of ["chrome-palette.ts", "theme.ts", "manager.ts"]) {
      const source = readFileSync(
        new URL(`./${file}`, import.meta.url),
        "utf8"
      );
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });

  it("makes Dark surfaces darker than Light ones", () => {
    expect(
      contrastRatio(
        chromePalette("dark").appContentBg,
        chromePalette("light").appContentBg
      )
    ).toBeGreaterThan(10);
  });
});
