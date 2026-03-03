/**
 * Focus Management Component for Enhanced Accessibility
 * Handles keyboard navigation, focus trapping, and screen reader announcements
 */

'use client'

import React, { useEffect, useRef, ReactNode } from 'react'

interface FocusManagerProps {
  children: ReactNode
  trapFocus?: boolean
  autoFocus?: boolean
  onEscape?: () => void
  className?: string
}

export function FocusManager({ 
  children, 
  trapFocus = false, 
  autoFocus = false, 
  onEscape, 
  className 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLElement | null>(null)
  const lastFocusableRef = useRef<HTMLElement | null>(null)

  // Get all focusable elements within the container
  const getFocusableElements = React.useCallback(() => {
    if (!containerRef.current) return []
    
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(containerRef.current.querySelectorAll(focusableSelectors)) as HTMLElement[]
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    if (!trapFocus) return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Handle Escape key
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault()
      onEscape()
      return
    }

    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab: move to previous element
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }
  }, [trapFocus, onEscape, getFocusableElements])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const focusableElements = getFocusableElements()
    
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0]
      lastFocusableRef.current = focusableElements[focusableElements.length - 1]

      // Auto-focus first element if requested
      if (autoFocus) {
        firstFocusableRef.current.focus()
      }
    }

    // Add event listeners for focus trapping
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown)
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [trapFocus, autoFocus, onEscape, handleKeyDown, getFocusableElements])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

/**
 * Screen Reader Only Text Component
 * For providing additional context to screen readers
 */
export function ScreenReaderOnly({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

/**
 * Live Region Component for Dynamic Content Announcements
 * Announces changes to screen readers
 */
interface LiveRegionProps {
  children: ReactNode
  politeness?: 'polite' | 'assertive'
  atomic?: boolean
}

export function LiveRegion({ 
  children, 
  politeness = 'polite', 
  atomic = false 
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  )
}

/**
 * Skip Link Component for Keyboard Navigation
 * Allows users to skip to main content
 */
interface SkipLinkProps {
  href: string
  children: ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="absolute left-0 top-0 bg-[#FE4501] text-white px-4 py-2 rounded-br-md z-50 transform -translate-y-full focus:translate-y-0 transition-transform duration-200"
      tabIndex={0}
    >
      {children}
    </a>
  )
}

/**
 * Keyboard Navigation Helper Hook
 * Provides keyboard navigation utilities
 */
export function useKeyboardNavigation(
  onArrowUp?: () => void,
  onArrowDown?: () => void,
  onArrowLeft?: () => void,
  onArrowRight?: () => void,
  onEnter?: () => void,
  onEscape?: () => void
) {
  const handleKeyDown = React.useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault()
          onArrowUp()
        }
        break
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault()
          onArrowDown()
        }
        break
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault()
          onArrowLeft()
        }
        break
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault()
          onArrowRight()
        }
        break
      case 'Enter':
        if (onEnter) {
          event.preventDefault()
          onEnter()
        }
        break
      case 'Escape':
        if (onEscape) {
          event.preventDefault()
          onEscape()
        }
        break
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}