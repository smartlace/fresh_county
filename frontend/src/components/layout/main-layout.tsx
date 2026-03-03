"use client"

import React from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { useCart } from '@/contexts/CartContext'
import { SkipLink } from '@/components/accessibility/FocusManager'
import { ErrorBoundary, ChunkErrorBoundary } from '@/components/error'
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { itemCount } = useCart()
  
  // Enable performance monitoring
  usePerformanceMonitor()
  return (
    <ChunkErrorBoundary>
      <ErrorBoundary>
        <div className="min-h-screen flex flex-col">
          {/* Skip Links for Keyboard Navigation */}
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <SkipLink href="#navigation">Skip to navigation</SkipLink>
          
          <ErrorBoundary
            fallback={
              <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                  <div className="text-red-600">Header temporarily unavailable</div>
                </div>
              </header>
            }
          >
            <Header cartItemsCount={itemCount} />
          </ErrorBoundary>
          
          <main id="main-content" className="flex-1" role="main">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
          
          <ErrorBoundary
            fallback={
              <footer className="bg-gray-900 text-white py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                  <p className="text-gray-400">Footer temporarily unavailable</p>
                </div>
              </footer>
            }
          >
            <Footer />
          </ErrorBoundary>
        </div>
      </ErrorBoundary>
    </ChunkErrorBoundary>
  )
}