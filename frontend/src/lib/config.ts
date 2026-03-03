/**
 * Centralized configuration management for Fresh County frontend
 * All environment variables and configuration should be accessed through this file
 */

// Validate required environment variables
function validateEnvVar(name: string, value: string | undefined, required: boolean = false): string {
  if (required && !value) {
    throw new Error(`Required environment variable ${name} is not set`)
  }
  return value || ''
}

// API Configuration
export const API_CONFIG = {
  // Backend API URL - Force production URLs when not in development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://freshcounty.com/api' 
      : 'http://localhost:3001/api'),
  
  // Backend base URL (without /api)
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://freshcounty.com' 
      : 'http://localhost:3001'),
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

// App Configuration
export const APP_CONFIG = {
  // App URL - Force production URL when not on localhost
  URL: process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? 'https://freshcounty.com' 
      : 'http://localhost:3000'),
  
  // App name
  NAME: validateEnvVar('NEXT_PUBLIC_APP_NAME', process.env.NEXT_PUBLIC_APP_NAME) || 'Fresh County',
  
  // Environment
  ENV: process.env.NODE_ENV || 'development',
  
  // Version (from package.json)
  VERSION: process.env.npm_package_version || '1.0.0',
} as const

// Feature Flags
export const FEATURES = {
  // Analytics
  ANALYTICS: validateEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', process.env.NEXT_PUBLIC_ENABLE_ANALYTICS) === 'true',
  
  // Error tracking
  SENTRY: validateEnvVar('NEXT_PUBLIC_ENABLE_SENTRY', process.env.NEXT_PUBLIC_ENABLE_SENTRY) === 'true',
  
  // Development features
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true',
  
  // Security features
  CSP_NONCE: validateEnvVar('NEXT_PUBLIC_CSP_NONCE_ENABLED', process.env.NEXT_PUBLIC_CSP_NONCE_ENABLED) === 'true',
} as const

// Security Configuration
export const SECURITY_CONFIG = {
  // HTTPS enforcement (production only)
  FORCE_HTTPS: APP_CONFIG.ENV === 'production',
  
  // Session timeout (in milliseconds)
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  
  // Token refresh threshold (in milliseconds)
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  
  // Maximum file upload size
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
} as const

// Development Configuration
export const DEV_CONFIG = {
  // Enable debug logging
  DEBUG: APP_CONFIG.ENV === 'development',
  
  // Enable React strict mode
  STRICT_MODE: true,
  
  // Enable source maps
  SOURCE_MAPS: APP_CONFIG.ENV !== 'production',
} as const

/**
 * Get API endpoint URL
 * @param endpoint - API endpoint path
 * @returns Full API URL
 */
export function getApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`
}

/**
 * Get backend asset URL (for uploads, images, etc.)
 * @param path - Asset path
 * @returns Full asset URL
 */
export function getAssetUrl(path: string): string {
  if (!path) return ''
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${API_CONFIG.BACKEND_URL}${cleanPath}`
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return APP_CONFIG.ENV === 'production'
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return APP_CONFIG.ENV === 'development'
}

/**
 * Get full page URL
 * @param path - Page path
 * @returns Full page URL
 */
export function getPageUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${APP_CONFIG.URL}${cleanPath}`
}

// Export all configurations
export const CONFIG = {
  API: API_CONFIG,
  APP: APP_CONFIG,
  FEATURES,
  SECURITY: SECURITY_CONFIG,
  DEV: DEV_CONFIG,
} as const

// Type exports for TypeScript
export type ApiConfig = typeof API_CONFIG
export type AppConfig = typeof APP_CONFIG
export type Features = typeof FEATURES
export type SecurityConfig = typeof SECURITY_CONFIG
export type DevConfig = typeof DEV_CONFIG