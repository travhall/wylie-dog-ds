/**
 * Test Setup for Wylie Dog Design System
 * 
 * This file is automatically loaded before all tests to set up the testing environment
 */

import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, expect } from 'vitest'
import { cleanup } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'

// Extend Vitest's expect with jest-dom matchers
expect.extend(toHaveNoViolations)

// Clean up after each test
afterEach(() => {
  cleanup()
})

// Global test setup
beforeAll(() => {
  // Mock ResizeObserver (used by some Radix components)
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
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
  })

  // Suppress console warnings for tests (can be removed if you want to see them)
  const originalConsoleWarn = console.warn
  console.warn = (...args) => {
    // Filter out specific warnings that are expected in tests
    const message = args[0]?.toString() || ''
    if (
      message.includes('ReactDOM.render is deprecated') ||
      message.includes('Warning: validateDOMNesting')
    ) {
      return
    }
    originalConsoleWarn.apply(console, args)
  }
})

// Global test utilities
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toHaveNoViolations(): T
    }
  }
}
