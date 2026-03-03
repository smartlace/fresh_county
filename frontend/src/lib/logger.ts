/**
 * Production-safe logging utility
 * Prevents sensitive information from being logged in production
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogContext {
  component?: string
  action?: string
  userId?: string
  metadata?: Record<string, unknown>
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  
  /**
   * Log error messages (always logged)
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const logData = this.formatLogData('ERROR', message, context)
    
    if (this.isProduction) {
      // In production, log to external service (implement as needed)
      this.logToService('error', logData)
    } else {
      console.error(logData, error)
    }
  }

  /**
   * Log warning messages (logged in development and staging)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isProduction) return
    
    const logData = this.formatLogData('WARN', message, context)
      }

  /**
   * Log info messages (logged in development only)
   */
  info(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return
    
    const logData = this.formatLogData('INFO', message, context)
      }

  /**
   * Log debug messages (logged in development only)
   */
  debug(message: string, context?: LogContext): void {
    if (!this.isDevelopment) return
    
    const logData = this.formatLogData('DEBUG', message, context)
      }

  /**
   * Log security events (always logged with special handling)
   */
  security(message: string, context?: LogContext): void {
    const logData = this.formatLogData('SECURITY', message, context)
    
    if (this.isProduction) {
      // In production, send to security monitoring
      this.logToService('security', logData)
    } else {
          }
  }

  /**
   * Log user actions for analytics (production-safe)
   */
  analytics(event: string, context?: LogContext): void {
    const logData = this.formatLogData('ANALYTICS', event, context)
    
    // Remove sensitive data for analytics
    const safeContext = this.sanitizeForAnalytics(context)
    
    if (this.isProduction) {
      // Send to analytics service
      this.logToService('analytics', { ...logData, context: safeContext })
    } else {
          }
  }

  private formatLogData(level: string, message: string, context?: LogContext) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context)
    }
  }

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return undefined

    const sanitized = { ...context }
    
    // Remove sensitive data in production
    if (this.isProduction) {
      delete sanitized.userId
      if (sanitized.metadata) {
        // Remove potential sensitive keys
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth']
        Object.keys(sanitized.metadata).forEach(key => {
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            delete sanitized.metadata![key]
          }
        })
      }
    }

    return sanitized
  }

  private sanitizeForAnalytics(context?: LogContext): LogContext | undefined {
    if (!context) return undefined

    return {
      component: context.component,
      action: context.action,
      // Never include userId or sensitive metadata in analytics
      metadata: context.metadata ? {
        // Only include safe, non-sensitive analytics data
        page: context.metadata.page,
        category: context.metadata.category,
        source: context.metadata.source
      } : undefined
    }
  }

  private logToService(type: string, data: Record<string, unknown>): void {
    // TODO: Implement external logging service integration
    // For now, just ensure errors are still captured in production
    if (type === 'error' && typeof window !== 'undefined') {
      // Could integrate with services like Sentry, LogRocket, etc.
      console.error('[PROD ERROR]', data)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Convenience functions
export const logError = (message: string, error?: Error | unknown, context?: LogContext) => 
  logger.error(message, error, context)

export const logWarn = (message: string, context?: LogContext) => 
  logger.warn(message, context)

export const logInfo = (message: string, context?: LogContext) => 
  logger.info(message, context)

export const logDebug = (message: string, context?: LogContext) => 
  logger.debug(message, context)

export const logSecurity = (message: string, context?: LogContext) => 
  logger.security(message, context)

export const logAnalytics = (event: string, context?: LogContext) => 
  logger.analytics(event, context)