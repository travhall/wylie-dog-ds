/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare module "jest-axe" {
  import type { RunOptions, AxeResults } from "axe-core";

  export function axe(
    html: Element | Document | string,
    options?: RunOptions
  ): Promise<AxeResults>;
  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): {
      pass: boolean;
      message(): string;
    };
  };
}
