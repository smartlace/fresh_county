// Auth utilities for Fresh County Admin React
// Extracted from AuthContext for reusability across components

/**
 * Get the authentication token from localStorage or sessionStorage
 * @returns The token string or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  }
  return null;
};

/**
 * Set the authentication token in localStorage and as a cookie
 * @param token The JWT token to store
 */
export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Use localStorage for persistent sessions
    localStorage.setItem('admin_token', token);
    
    // Also set as cookie for middleware to access
    // Remove 'secure' flag for development (localhost)
    const isProduction = window.location.protocol === 'https:';
    const secureFlag = isProduction ? '; secure' : '';
    document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}${secureFlag}; samesite=strict`;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    sessionStorage.removeItem('admin_user');
    
    // Clear cookies
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'fresh_county_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
};

/**
 * Check if user is authenticated (has a valid token)
 * @returns boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  [key: string]: unknown;
}

/**
 * Get user data from localStorage
 * @returns User object or null if not found
 */
export const getUserData = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Set user data in localStorage
 * @param user The user object to store
 */
export const setUserData = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }
};