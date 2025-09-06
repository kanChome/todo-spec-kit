export {};

declare global {
  // Node.js の vitest 環境では globalThis に localStorage は存在しないので型を追加する
  var localStorage: LocalStorageMock;
}

interface LocalStorageMock {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
  readonly length: number;
  key: (index: number) => string | null;
}
