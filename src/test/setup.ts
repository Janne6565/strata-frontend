// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.) with Vitest.
import "@testing-library/jest-dom/vitest"

// Node 25 ships an experimental global `localStorage` that shadows jsdom's and
// throws without a backing file. Install a plain in-memory Storage so code under
// test (lib/auth) and the tests themselves get a working localStorage.
class MemoryStorage implements Storage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  clear(): void {
    this.store.clear()
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
})
