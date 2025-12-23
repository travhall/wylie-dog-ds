declare module "culori" {
  export interface CuloriColor {
    mode?: string;
    [channel: string]: any;
  }

  export type ColorConverter<T = CuloriColor | string | null> = (
    value: T
  ) => CuloriColor | { r: number; g: number; b: number } | null;

  export function converter(mode: string): ColorConverter;
  export function parse(value: string): CuloriColor | null;
}
