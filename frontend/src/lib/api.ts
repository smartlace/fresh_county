// API service layer for backend communication
import { API_CONFIG } from './config'

const API_BASE_URL = API_CONFIG.BASE_URL

interface ValidationErrors {
  [field: string]: string[]
}

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: ValidationErrors
}

interface User {
  id: string
  email: string
  full_name: string
  mobile?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  role: string
  email_verified: boolean
  created_at: string
  updated_at: string
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

interface ForgotPasswordRequest {
  email: string
}

interface ResetPasswordRequest {
  token: string
  password: string
}

interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken')
    
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          errors: data.error?.data || data.errors
        }
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch {
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials)
    })

    const result = await this.handleResponse<LoginResponse>(response)
    
    // Store tokens if login successful
    if (result.success && result.data) {
      localStorage.setItem('authToken', result.data.token)
      localStorage.setItem('refreshToken', result.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(result.data.user))
    }

    return result
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    // Transform frontend data to match backend expectations
    const backendData = {
      email: userData.email,
      password: userData.password,
      full_name: `${userData.firstName} ${userData.lastName}`.trim(),
      mobile: userData.phone
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(backendData)
    })

    const result = await this.handleResponse<LoginResponse>(response)
    
    // Store tokens if registration successful
    if (result.success && result.data) {
      localStorage.setItem('authToken', result.data.token)
      localStorage.setItem('refreshToken', result.data.refreshToken)
      localStorage.setItem('user', JSON.stringify(result.data.user))
    }

    return result
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    // Clear local storage regardless of response
    localStorage.removeItem('authToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')

    return this.handleResponse(response)
  }

  async forgotPassword(email: ForgotPasswordRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(email)
    })

    return this.handleResponse(response)
  }

  async resetPassword(resetData: ResetPasswordRequest): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(resetData)
    })

    return this.handleResponse(response)
  }

  async getProfile(): Promise<ApiResponse<User>> {
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime()
    const response = await fetch(`${API_BASE_URL}/users/profile?_t=${timestamp}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    return this.handleResponse<User>(response)
  }

  // User profile management
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    })

    return this.handleResponse<User>(response)
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/users/password`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData)
    })

    return this.handleResponse(response)
  }

  // Order management
  async getUserOrders(page: number = 1, limit: number = 10): Promise<ApiResponse<unknown[]>> {
    const response = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async getOrderDetails(orderId: string): Promise<ApiResponse<unknown>> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse(response)
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (!refreshToken) {
      return {
        success: false,
        message: 'No refresh token available'
      }
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    const result = await this.handleResponse<{ token: string; refreshToken: string }>(response)
    
    // Update tokens if refresh successful
    if (result.success && result.data) {
      localStorage.setItem('authToken', result.data.token)
      localStorage.setItem('refreshToken', result.data.refreshToken)
    }

    return result
  }

  // Utility methods
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken')
    const user = this.getCurrentUser()
    return !!(token && user)
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken')
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: Record<string, unknown>): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    return this.handleResponse<T>(response)
  }
}

export const apiService = new ApiService()
export type { User, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ApiResponse }