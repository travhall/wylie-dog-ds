declare module "culori" {
  export interface CuloriColor {
    mode?: string;
    [channel: string]: any;
  }

  export type ColorConverter<T = CuloriColor | string | null> = (
    value: T
  ) => CuloriColor | { r: number; g: number; b: number } | null;

  export type DifferenceFn = (a: CuloriColor, b: CuloriColor) => number;

  export function converter(mode: string): ColorConverter;
  export function parse(value: string): CuloriColor | null;

  export function formatHex(color: CuloriColor | null | undefined): string;
  export function formatHex8(color: CuloriColor | null | undefined): string;
  export function formatCss(color: CuloriColor | null | undefined): string;
  export function formatHsl(color: CuloriColor | null | undefined): string;
  export function formatRgb(color: CuloriColor | null | undefined): string;

  export function differenceEuclidean(mode?: string): DifferenceFn;
  export function differenceCie76(): DifferenceFn;
  export function differenceCie94(): DifferenceFn;
  export function differenceCiede2000(): DifferenceFn;
  export function differenceHyab(): DifferenceFn;
}
