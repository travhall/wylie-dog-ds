/**
 * Test Setup for the showcase app
 *
 * Loaded before all tests to set up the jsdom testing environment. Mirrors
 * packages/ui/src/test-setup.ts so both packages behave consistently, minus
 * the a11y-specific (jest-axe) additions that showcase's smoke tests don't
 * use yet.
 */

import { beforeAll, afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  // Let React know this environment expects act() support so user-event
  // interactions don't warn about missing act wrappers.
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  // Mock ResizeObserver (used by some Radix components)
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver (used by section-subnav.tsx)
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;

  // Mock matchMedia
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  });

  // Mock hasPointerCapture (needed for Radix Select in jsdom)
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function () {
      return false;
    };
  }

  // Mock setPointerCapture and releasePointerCapture
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function () {};
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function () {};
  }

  // Mock scrollIntoView (needed for Radix Select)
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function () {};
  }
});

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
