declare module "jest-axe" {
  export interface AxeResults {
    violations: any[];
    passes: any[];
    incomplete: any[];
  }

  export function axe(
    element: HTMLElement | string,
    options?: any
  ): Promise<AxeResults>;

  export const toHaveNoViolations: any;
}

declare global {
  namespace Vi {
    interface Expect {
      toHaveNoViolations(): any;
    }

    interface Assertion<T = any> {
      toHaveNoViolations(): T;
    }
  }
}
