"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { apiService, User, LoginRequest, RegisterRequest } from '@/lib/api'
import { UserStateManager } from '@/lib/storage'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiService.getProfile()
      
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Refresh user error:', error)
    }
  }, [])

  const clearAuthState = React.useCallback(async () => {
    setUser(null)
    setHasRefreshedUser(false) // Reset refresh flag
    // Use standardized logout handling
    UserStateManager.handleLogout(true)
  }, [])

  const initializeAuth = React.useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Ensure we're in the browser before accessing localStorage
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }
      
      // Add a small delay to ensure localStorage is available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Check if user data exists in localStorage
      const storedUser = apiService.getCurrentUser()
      const token = apiService.getAuthToken()
      
      
      // If we have a token, try to fetch fresh profile data
      if (token) {
        try {
          const response = await apiService.getProfile()
          
          if (response.success && response.data) {
            setUser(response.data)
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(response.data))
          } else if (storedUser) {
            // Profile fetch failed but we have stored user data - use it temporarily
                        setUser(storedUser)
          } else {
            // Token invalid and no stored user, clear auth state
                        await clearAuthState()
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError)
          // Network error or server down - use stored user if available
          if (storedUser) {
                        setUser(storedUser)
          } else {
            // Only clear auth if no stored user and it's not a network error
            const isNetworkError = profileError instanceof TypeError && 
                                  profileError.message.includes('fetch')
            if (!isNetworkError) {
                            await clearAuthState()
            }
          }
        }
      } else {
        // If there's a stored user but no token, something went wrong
        if (storedUser) {
          // Try to use stored user temporarily
          setUser(storedUser)
        } else {
          // For guest users (no token, no stored user), just set state without triggering logout
          // Only clear auth state if we haven't already initialized (prevents React Strict Mode issues)
          if (!hasInitialized) {
            setUser(null)
            setHasRefreshedUser(false)
            // Don't call clearAuthState() for guest users as it clears cart data
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      if (!hasInitialized) {
        setUser(null)
        setHasRefreshedUser(false)
        // Don't call clearAuthState() for initialization errors as it clears cart data
      }
    } finally {
      setIsLoading(false)
      setHasInitialized(true)
    }
  }, [hasInitialized, clearAuthState])

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])
  
  // Effect to fetch complete user data if user exists but is missing address fields
  // Only run once per user to avoid infinite loops
  const [hasRefreshedUser, setHasRefreshedUser] = useState(false)
  
  useEffect(() => {
    if (user && hasInitialized && !hasRefreshedUser && (!user.address && !user.city && !user.state && !user.country)) {
      setHasRefreshedUser(true)
      refreshUser()
    }
  }, [user, hasInitialized, refreshUser, hasRefreshedUser])

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      const response = await apiService.login(credentials)
      
      if (response.success && response.data) {
        
        // Ensure we have valid user data
        if (!response.data.user || !response.data.token) {
          console.error('Login response missing required data:', response.data)
          return {
            success: false,
            message: 'Invalid login response from server'
          }
        }

        setUser(response.data.user)
        
        // Use standardized login handling (tokens already stored by apiService)
        UserStateManager.handleLogin(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        )
        
        // Small delay to ensure state is updated
        await new Promise(resolve => setTimeout(resolve, 100))
        
        return { success: true }
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed' 
        }
      }
    } catch (error: unknown) {
      console.error('Login error:', error)
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred during login'
      const errorObj = error as { response?: { data?: { message?: string } }; message?: string; name?: string }
      if (errorObj?.response?.data?.message) {
        errorMessage = errorObj.response.data.message
      } else if (errorObj?.message) {
        errorMessage = errorObj.message
      } else if (errorObj?.name === 'TypeError' && errorObj?.message?.includes('fetch')) {
        errorMessage = 'Network error - please check your connection'
      }
      
      return { 
        success: false, 
        message: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true)
      const response = await apiService.register(userData)
      
      if (response.success && response.data) {
        setUser(response.data.user)
        // Use standardized login handling (tokens already stored by apiService)
        UserStateManager.handleLogin(
          response.data.token,
          response.data.refreshToken,
          response.data.user
        )
        return { success: true }
      } else {
        return { 
          success: false, 
          message: response.message || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        message: 'An error occurred during registration' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = React.useCallback(async () => {
    try {
      setIsLoading(true)
      await apiService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await clearAuthState()
      setIsLoading(false)
    }
  }, [clearAuthState])

  const forgotPassword = async (email: string) => {
    try {
      const response = await apiService.forgotPassword({ email })
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Password reset email sent' : 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return {
        success: false,
        message: 'An error occurred while processing your request'
      }
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await apiService.resetPassword({ token, password })
      
      return {
        success: response.success,
        message: response.message || (response.success ? 'Password reset successfully' : 'Failed to reset password')
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        message: 'An error occurred while resetting your password'
      }
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}