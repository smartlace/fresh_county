import { useEffect } from 'react'

interface PerformanceMetrics {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export const usePerformanceMonitor = (enableReporting = process.env.NODE_ENV === 'production') => {
  useEffect(() => {
    if (!enableReporting || typeof window === 'undefined') return

    // Web Vitals monitoring
    const reportWebVitals = () => {
      const metrics: PerformanceMetrics[] = []

      // Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            const lcp = entry.startTime
            metrics.push({
              name: 'LCP',
              value: lcp,
              rating: lcp < 2500 ? 'good' : lcp < 4000 ? 'needs-improvement' : 'poor'
            })
          }

          if (entry.entryType === 'first-input') {
            const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime
            metrics.push({
              name: 'FID',
              value: fid,
              rating: fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor'
            })
          }

          if (entry.entryType === 'layout-shift' && !(entry as PerformanceEntry & {hadRecentInput: boolean}).hadRecentInput) {
            const cls = (entry as PerformanceEntry & {value: number}).value
            metrics.push({
              name: 'CLS',
              value: cls,
              rating: cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor'
            })
          }
        }
      })

      // Observe Web Vitals
      if ('PerformanceObserver' in window) {
        try {
          observer.observe({ entryTypes: ['largest-contentful-paint'] })
          observer.observe({ entryTypes: ['first-input'] })
          observer.observe({ entryTypes: ['layout-shift'] })
        } catch (error) {
                  }
      }

      // Navigation Timing
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navTiming) {
          const ttfb = navTiming.responseStart - navTiming.requestStart
          const loadTime = navTiming.loadEventEnd - navTiming.fetchStart

          metrics.push(
            {
              name: 'TTFB',
              value: ttfb,
              rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
            },
            {
              name: 'Load',
              value: loadTime,
              rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor'
            }
          )
        }

        // Send metrics to analytics (you would replace this with your analytics service)
        if (metrics.length > 0) {
                    
          // Example: Send to analytics service
          // analytics.track('performance_metrics', {
          //   metrics,
          //   userAgent: navigator.userAgent,
          //   timestamp: Date.now()
          // })
        }
      }, 3000) // Wait for page to stabilize

      // Cleanup
      return () => {
        observer.disconnect()
      }
    }

    // Memory monitoring (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as Performance & {memory: {usedJSHeapSize: number, totalJSHeapSize: number, jsHeapSizeLimit: number}}).memory
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576 * 100) / 100, // MB
          total: Math.round(memory.totalJSHeapSize / 1048576 * 100) / 100, // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576 * 100) / 100 // MB
        }

        // Warn if memory usage is high
        if (memoryUsage.used / memoryUsage.limit > 0.8) {
                  }

        return memoryUsage
      }
      return null
    }

    // Error tracking
    const trackErrors = () => {
      const originalConsoleError = console.error
      console.error = (...args: unknown[]) => {
        // Track console errors
        originalConsoleError.apply(console, args)
        
        // You would send this to your error tracking service
        // errorTracking.captureMessage('Console Error', {
        //   level: 'error',
        //   extra: { args }
        // })
      }

      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason)
        
        // errorTracking.captureException(event.reason, {
        //   tags: { type: 'unhandled_promise_rejection' }
        // })
      })

      // Restore original console.error on cleanup
      return () => {
        console.error = originalConsoleError
      }
    }

    // Initialize monitoring
    const cleanupWebVitals = reportWebVitals()
    const cleanupErrors = trackErrors()
    const memoryCheckInterval = setInterval(() => {
      const memory = monitorMemory()
      if (memory && process.env.NODE_ENV === 'development') {
              }
    }, 30000) // Check every 30 seconds

    // Cleanup function
    return () => {
      if (cleanupWebVitals) cleanupWebVitals()
      if (cleanupErrors) cleanupErrors()
      clearInterval(memoryCheckInterval)
    }
  }, [enableReporting])

  // Return helper functions for manual performance tracking
  return {
    measurePerformance: (name: string, fn: () => void) => {
      const start = performance.now()
      fn()
      const end = performance.now()
            return end - start
    },
    
    markStart: (name: string) => {
      performance.mark(`${name}-start`)
    },
    
    markEnd: (name: string) => {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
      const measure = performance.getEntriesByName(name, 'measure')[0]
            return measure?.duration
    }
  }
}