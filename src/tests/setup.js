import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Automatically unmount and clean up DOM after every test
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

// Ensure crypto.randomUUID exists in jsdom test environments
if (!globalThis.crypto) {
  globalThis.crypto = {}
}

if (typeof globalThis.crypto.randomUUID !== 'function') {
  let counter = 0
  globalThis.crypto.randomUUID = () => {
    counter += 1
    return `00000000-0000-4000-8000-${String(counter).padStart(12, '0')}`
  }
}
