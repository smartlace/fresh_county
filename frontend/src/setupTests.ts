// setupTests.ts - Jest setup for React Testing Library
import '@testing-library/jest-dom'

// Extend Jest matchers with DOM specific matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toBeDisabled(): R
      toHaveClass(className: string): R
    }
  }
}