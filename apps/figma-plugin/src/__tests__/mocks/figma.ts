/**
 * Figma API Mocks for Testing
 *
 * Provides mock implementations of Figma plugin API for unit testing.
 * Includes mocks for variables, collections, clientStorage, and UI messaging.
 */

import { vi } from "vitest";

// Mock Variable Collection
export interface MockVariableCollection {
  id: string;
  name: string;
  modes: Array<{ modeId: string; name: string }>;
  variableIds: string[];
}

// Mock Variable
export interface MockVariable {
  id: string;
  name: string;
  resolvedType: "COLOR" | "FLOAT" | "STRING" | "BOOLEAN";
  valuesByMode: Record<string, any>;
  description?: string;
  scopes?: string[];
}

// Mock storage
const mockStorage = new Map<string, any>();

// Mock collections
const mockCollections = new Map<string, MockVariableCollection>();

// Mock variables
const mockVariables = new Map<string, MockVariable>();

/**
 * Create a mock Figma global object
 */
export function createMockFigma(): any {
  const figma = {
    // Variables API
    variables: {
      getLocalVariableCollections: vi.fn(() =>
        Array.from(mockCollections.values())
      ),
      getLocalVariables: vi.fn(() => Array.from(mockVariables.values())),
      getVariableById: vi.fn((id: string) => mockVariables.get(id) || null),
      getVariableCollectionById: vi.fn(
        (id: string) => mockCollections.get(id) || null
      ),
      createVariableCollection: vi.fn((name: string) => {
        const collection: MockVariableCollection = {
          id: `collection-${Date.now()}-${Math.random()}`,
          name,
          modes: [{ modeId: "mode-1", name: "Mode 1" }],
          variableIds: [],
        };
        mockCollections.set(collection.id, collection);
        return collection;
      }),
      createVariable: vi.fn(
        (
          name: string,
          collectionId: string,
          resolvedType: MockVariable["resolvedType"]
        ) => {
          const variable: MockVariable = {
            id: `var-${Date.now()}-${Math.random()}`,
            name,
            resolvedType,
            valuesByMode: {},
          };
          mockVariables.set(variable.id, variable);

          const collection = mockCollections.get(collectionId);
          if (collection) {
            collection.variableIds.push(variable.id);
          }

          return variable;
        }
      ),
    },

    // Client storage API
    clientStorage: {
      getAsync: vi.fn((key: string) =>
        Promise.resolve(mockStorage.get(key) || null)
      ),
      setAsync: vi.fn((key: string, value: any) => {
        mockStorage.set(key, value);
        return Promise.resolve();
      }),
      deleteAsync: vi.fn((key: string) => {
        mockStorage.delete(key);
        return Promise.resolve();
      }),
      keysAsync: vi.fn(() => Promise.resolve(Array.from(mockStorage.keys()))),
    },

    // UI API
    ui: {
      postMessage: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      resize: vi.fn(),
      close: vi.fn(),
    },

    // Utility methods
    showUI: vi.fn(),
    closePlugin: vi.fn(),
    notify: vi.fn(),
    on: vi.fn(),

    // Current page/selection
    currentPage: {
      selection: [],
    },

    // Root node
    root: {
      children: [],
    },
  };

  return figma;
}

/**
 * Reset all mocks and clear storage
 */
export function resetMockFigma() {
  mockStorage.clear();
  mockCollections.clear();
  mockVariables.clear();
  vi.clearAllMocks();
}

/**
 * Add a mock collection for testing
 */
export function addMockCollection(
  collection: Partial<MockVariableCollection> & { name: string }
): MockVariableCollection {
  const fullCollection: MockVariableCollection = {
    id: collection.id || `collection-${Date.now()}`,
    name: collection.name,
    modes: collection.modes || [{ modeId: "mode-1", name: "Mode 1" }],
    variableIds: collection.variableIds || [],
  };

  mockCollections.set(fullCollection.id, fullCollection);
  return fullCollection;
}

/**
 * Add a mock variable for testing
 */
export function addMockVariable(
  variable: Partial<MockVariable> & {
    name: string;
    resolvedType: MockVariable["resolvedType"];
  }
): MockVariable {
  const fullVariable: MockVariable = {
    id: variable.id || `var-${Date.now()}`,
    name: variable.name,
    resolvedType: variable.resolvedType,
    valuesByMode: variable.valuesByMode || {},
    description: variable.description,
    scopes: variable.scopes,
  };

  mockVariables.set(fullVariable.id, fullVariable);
  return fullVariable;
}

/**
 * Get all mock collections
 */
export function getMockCollections(): MockVariableCollection[] {
  return Array.from(mockCollections.values());
}

/**
 * Get all mock variables
 */
export function getMockVariables(): MockVariable[] {
  return Array.from(mockVariables.values());
}

/**
 * Mock parent.postMessage for UI thread testing
 */
export function createMockParentPostMessage() {
  const listeners: Array<(event: MessageEvent) => void> = [];

  const postMessage = vi.fn((message: any) => {
    // Simulate async message delivery
    setTimeout(() => {
      listeners.forEach((listener) => {
        listener(new MessageEvent("message", { data: message }));
      });
    }, 0);
  });

  const addEventListener = vi.fn((type: string, listener: any) => {
    if (type === "message") {
      listeners.push(listener);
    }
  });

  const removeEventListener = vi.fn((type: string, listener: any) => {
    if (type === "message") {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  });

  return {
    postMessage,
    addEventListener,
    removeEventListener,
    listeners,
  };
}
