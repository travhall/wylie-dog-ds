import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock Figma API
(global as any).figma = {
  clientStorage: {
    getAsync: vi.fn(),
    setAsync: vi.fn(),
    deleteAsync: vi.fn(),
  },
  ui: {
    postMessage: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    resize: vi.fn(),
  },
  currentPage: {
    selection: [],
  },
  variables: {
    getLocalVariablesAsync: vi.fn().mockResolvedValue([]),
    getLocalVariableCollections: vi.fn().mockReturnValue([]),
  },
} as any;

// Mock parent.postMessage for UI tests
global.parent = {
  postMessage: vi.fn(),
} as any;
