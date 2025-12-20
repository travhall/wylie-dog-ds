/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare module "jest-axe" {
  export const axe: any;
  export const toHaveNoViolations: any;
}
