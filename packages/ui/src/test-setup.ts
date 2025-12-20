/**
 * Test Setup for Wylie Dog Design System
 *
 * This file is automatically loaded before all tests to set up the testing environment
 */

import { beforeAll, afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import { toHaveNoViolations } from "jest-axe";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);
expect.extend(toHaveNoViolations);

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Global test setup
beforeAll(() => {
  // Mock ResizeObserver (used by some Radix components)
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock IntersectionObserver
  (global as any).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

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

  // Suppress console warnings for tests (can be removed if you want to see them)
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    // Filter out specific warnings that are expected in tests
    const message = args[0]?.toString() || "";
    if (
      message.includes("ReactDOM.render is deprecated") ||
      message.includes("Warning: validateDOMNesting")
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
});

// Global test utilities
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveNoViolations(): T;
    }
  }
}
