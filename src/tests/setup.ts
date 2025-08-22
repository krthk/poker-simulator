import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Make vi and beforeEach globally available
declare global {
  var vi: typeof import('vitest')['vi']
  var beforeEach: typeof import('vitest')['beforeEach']
}

(globalThis as any).vi = vi;
(globalThis as any).beforeEach = beforeEach;

// Mock matchMedia for tests that might use it (in case of responsive design)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
