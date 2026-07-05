import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/preact";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock Figma API
const mockFigma = {
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
};

(global as unknown as { figma: typeof mockFigma }).figma = mockFigma;

// Mock parent.postMessage for UI tests
global.parent = {
  postMessage: vi.fn(),
} as unknown as Window;
