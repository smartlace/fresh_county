'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  isChunkError: boolean
  isOnline: boolean
}

export class ChunkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      isChunkError: false,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true
    }
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Check if this is a chunk loading error
    const isChunkError = 
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError') ||
      error.name === 'ChunkLoadError'

    return { hasError: true, isChunkError }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ChunkErrorBoundary caught an error:', error, errorInfo)

    // If it's not a chunk error, re-throw to let parent error boundary handle it
    if (!this.state.isChunkError) {
      throw error
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }

  private handleOnline = () => {
    this.setState({ isOnline: true })
  }

  private handleOffline = () => {
    this.setState({ isOnline: false })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleRetry = () => {
    this.setState({ hasError: false, isChunkError: false })
    // Small delay to let any network issues resolve
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  public render() {
    if (this.state.hasError && this.state.isChunkError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-6">
                {this.state.isOnline ? (
                  <RefreshCw className="w-8 h-8 text-orange-600" />
                ) : (
                  <WifiOff className="w-8 h-8 text-orange-600" />
                )}
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {this.state.isOnline ? 'Update Available' : 'Connection Issue'}
              </h1>
              
              <p className="text-gray-600 mb-6">
                {this.state.isOnline 
                  ? "We've released an update. Please refresh to get the latest version."
                  : 'It looks like you&apos;re offline. Please check your internet connection and try again.'
                }
              </p>

              <div className="flex items-center justify-center gap-3 mb-6">
                {this.state.isOnline ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  this.state.isOnline ? 'text-green-600' : 'text-red-600'
                }`}>
                  {this.state.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={this.handleReload}
                  className="w-full bg-[#FE4501] hover:bg-[#E63E01] text-white"
                  disabled={!this.state.isOnline}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {this.state.isOnline ? 'Refresh Now' : 'Waiting for Connection...'}
                </Button>
                
                {!this.state.isOnline && (
                  <Button
                    onClick={this.handleRetry}
                    variant="outline"
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}