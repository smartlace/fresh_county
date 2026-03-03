/**
 * Authentication utility functions with security validations
 */

/**
 * SECURITY: Allowed redirect paths to prevent open redirect attacks
 * Only allow redirects to internal application pages
 */
const ALLOWED_REDIRECT_PATHS = [
  '/',
  '/profile',
  '/categories',
  '/cart',
  '/checkout',
  '/about',
  '/catering',
  '/fidelity',
  '/maas',
  '/detox',
  '/blog',
  '/orders',
  '/account',
  '/settings'
]

/**
 * Validate redirect URL to prevent open redirect attacks
 * @param redirectUrl - The URL to validate
 * @returns Safe redirect URL or null if invalid
 */
export function validateRedirectUrl(redirectUrl: string | null): string | null {
  if (!redirectUrl) {
    return null
  }

  try {
    // Remove any leading/trailing whitespace
    const cleanUrl = redirectUrl.trim()
    
    // Must start with / (relative path) - block absolute URLs
    if (!cleanUrl.startsWith('/')) {
            return null
    }
    
    // Block URLs with protocol or domain (e.g., //evil.com, http://, https://)
    if (cleanUrl.startsWith('//') || cleanUrl.includes('://')) {
            return null
    }
    
    // Block javascript: and data: schemes
    if (cleanUrl.toLowerCase().startsWith('javascript:') || cleanUrl.toLowerCase().startsWith('data:')) {
            return null
    }
    
    // Extract path without query params and hash
    const url = new URL(cleanUrl, 'http://localhost') // Use dummy base for parsing
    const pathname = url.pathname
    
    // Check if path is in allowlist
    const isAllowed = ALLOWED_REDIRECT_PATHS.some(allowedPath => {
      // Exact match or starts with allowed path
      return pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
    })
    
    if (!isAllowed) {
            return null
    }
    
    // Return the original clean URL (with query params and hash if present)
    return cleanUrl
    
  } catch (error) {
        return null
  }
}

/**
 * Get safe redirect URL from URL parameters
 * @returns Safe redirect URL or default fallback
 */
export function getSafeRedirectUrl(defaultPath: string = '/'): string {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return defaultPath
    }
    
    const urlParams = new URLSearchParams(window.location.search)
    const redirectParam = urlParams.get('redirect') || urlParams.get('returnUrl') || urlParams.get('return_to')
    
    const safeRedirect = validateRedirectUrl(redirectParam)
    return safeRedirect || defaultPath
    
  } catch (error) {
        return defaultPath
  }
}

/**
 * Create a login URL with safe redirect parameter
 * @param redirectPath - Path to redirect to after login
 * @returns Login URL with validated redirect parameter
 */
export function createLoginUrl(redirectPath?: string): string {
  const baseUrl = '/auth/signin'
  
  if (!redirectPath) {
    return baseUrl
  }
  
  const safeRedirect = validateRedirectUrl(redirectPath)
  if (!safeRedirect) {
    return baseUrl
  }
  
  return `${baseUrl}?redirect=${encodeURIComponent(safeRedirect)}`
}

/**
 * Sanitize and validate authentication input
 * @param input - User input to sanitize
 * @returns Sanitized input
 */
export function sanitizeAuthInput(input: string): string {
  return input.trim().slice(0, 500) // Limit length and trim whitespace
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254 // RFC 5321 limit
}

/**
 * Validate password strength (basic requirements)
 * @param password - Password to validate
 * @returns Validation result with details
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}