import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from '../ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>Working component</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Working component')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
  })

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test error' }),
      expect.objectContaining({ componentStack: expect.any(String) })
    )
  })

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument()
  })

  it('shows error details in development mode', () => {
    // Mock NODE_ENV for this test
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      configurable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development Only):')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true
    })
  })

  it('handles try again button click', async () => {
    const user = userEvent.setup()

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    await user.click(tryAgainButton)

    // After clicking try again, it should attempt to render children again
    // In a real scenario, the error state might be resolved
    expect(tryAgainButton).toBeInTheDocument()
  })

  it('handles reload page button click', async () => {
    const user = userEvent.setup()
    const reloadMock = jest.fn()
    
    // Mock window.location.reload
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    })

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const reloadButton = screen.getByRole('button', { name: /reload page/i })
    await user.click(reloadButton)

    expect(reloadMock).toHaveBeenCalledTimes(1)
  })
})