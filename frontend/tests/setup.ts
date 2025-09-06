import "@testing-library/jest-dom";
import { beforeEach, vi } from "vitest";

// Create a proper localStorage mock that actually stores data
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }),
  };
};

// Apply the mock to global
interface LocalStorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  readonly length: number;
  key: (index: number) => string | null;
}

globalThis.localStorage = createLocalStorageMock() as LocalStorageMock;

// Reset localStorage mock before each test
beforeEach(() => {
  // Create fresh localStorage mock for each test
  globalThis.localStorage = createLocalStorageMock() as LocalStorageMock;
  vi.clearAllMocks();
});
