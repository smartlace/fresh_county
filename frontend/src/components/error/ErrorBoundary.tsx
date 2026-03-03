'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and external service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)

    // Log to external error tracking service
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Here you would integrate with Sentry, Bugsnag, or similar
      // Example: Sentry.captureException(error, { extra: errorInfo })
    }

    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We&apos;re sorry, but something unexpected happened. Please try refreshing the page or go back to the homepage.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">Error Details (Development Only):</p>
                  <code className="text-xs text-red-700 block whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack && (
                      <>
                        <br /><br />
                        Component Stack:
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </code>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full bg-[#FE4501] hover:bg-[#E63E01] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  asChild
                  variant="ghost"
                  className="w-full"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}