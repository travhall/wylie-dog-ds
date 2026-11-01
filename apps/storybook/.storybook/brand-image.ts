import { dogArt, wordmark } from "./brand-art";
import { chromeBrand } from "./chrome-palette";
import type { Mode } from "./chrome-palette";

const TILE = 28;
const GAP = 8;
const HEIGHT = 32;

/*
 * The brand lockup from the showcase header: the dog on an accent tile, then the
 * "Wylie Dog" wordmark. The tile and the wordmark take their colors from the
 * tokens for the mode, so a token change reaches the sidebar, and the dog
 * (fixed artwork) sits on the tile, so it stays readable in Dark. The manager
 * loads the brand as an image, which cannot load fonts, hence the outlines.
 */
export function brandImage(mode: Mode): string {
  const { tile, ink } = chromeBrand(mode);
  const width = TILE + GAP + wordmark.width;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}">` +
    `<rect y="2" width="${TILE}" height="${TILE}" rx="6" fill="${tile}"/>` +
    `<g transform="translate(${(TILE - 18) / 2} 0)">${dogArt}</g>` +
    `<path transform="translate(${TILE + GAP} 22)" fill="${ink}" d="${wordmark.path}"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
