/** Colour maths shared across the repo. See color.js for the details. */
export function parseOklch(css: string): [number, number, number];
export function toLinearRgb(css: string): [number, number, number];
export function toRgb(css: string): [number, number, number];
export function toHex(css: string): string;
export function relativeLuminance(css: string): number;
export function contrastRatio(a: string, b: string): number;
export function apcaContrast(textCss: string, backgroundCss: string): number;
export function findCssVar(css: string, name: string): string | null;
