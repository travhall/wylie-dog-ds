import "vitest";

declare module "vitest" {
  interface Assertion<T = void> {
    toHaveNoViolations(): T;
  }

  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}
