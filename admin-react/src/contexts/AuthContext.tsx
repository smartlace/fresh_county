'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import env from '@/config/env';

interface User {
  id: string;
  email: string;
  full_name: string;
  mobile?: string;
  role: string;
  email_verified?: boolean;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ requiresMFA?: boolean; mfaLoginToken?: string }>;
  loginWithMFA: (mfaToken: string, mfaLoginToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setupMFA: () => Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }>;
  confirmMFA: (token: string) => Promise<void>;
  disableMFA: (password: string, mfaToken: string) => Promise<void>;
  generateBackupCodes: (password: string, mfaToken: string) => Promise<string[]>;
  getMFAStatus: () => Promise<{ mfaEnabled: boolean }>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = env.API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []); // checkAuth is stable and doesn't need to be in dependencies

  const checkAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // The response structure should be { success: true, message: string, data: User }
        const user = data.data;
        
        if (data.success && user && ['admin', 'manager', 'staff'].includes(user.role)) {
          setUser(user);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin/manager/staff role
        if (data.data?.user && !['admin', 'manager', 'staff'].includes(data.data.user.role)) {
          throw new Error('Access denied. This dashboard is for administrators only.');
        }

        if (data.requiresMFA) {
          return {
            requiresMFA: true,
            mfaLoginToken: data.mfaLoginToken
          };
        } else {
          // Complete login
          setToken(data.data.token);
          setUser(data.data.user);
          toast.success('Login successful!');
          
          // Force a small delay to ensure cookie is set before potential redirects
          await new Promise(resolve => setTimeout(resolve, 100));
          // Let the login page handle the redirect
          return {};
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const loginWithMFA = async (mfaToken: string, mfaLoginToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ mfaToken, mfaLoginToken })
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user has admin/manager/staff role
        if (data.data?.user && !['admin', 'manager', 'staff'].includes(data.data.user.role)) {
          throw new Error('Access denied. This dashboard is for administrators only.');
        }

        setToken(data.data.token);
        setUser(data.data.user);
        toast.success('Login successful!');
        // Let the login page handle the redirect
      } else {
        throw new Error(data.message || 'MFA verification failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/enhanced-logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearAuthData(true);
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  const setupMFA = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/mfa/setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.message || 'MFA setup failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA setup failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const confirmMFA = async (token: string) => {
    try {
      const authToken = getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/mfa/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('MFA enabled successfully!');
      } else {
        throw new Error(data.message || 'MFA confirmation failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA confirmation failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const disableMFA = async (password: string, mfaToken: string) => {
    try {
      const authToken = getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/mfa/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password, mfaToken })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('MFA disabled successfully!');
      } else {
        throw new Error(data.message || 'MFA disable failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA disable failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const generateBackupCodes = async (password: string, mfaToken: string) => {
    try {
      const authToken = getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/mfa/backup-codes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password, mfaToken })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('New backup codes generated!');
        return data.data.backupCodes;
      } else {
        throw new Error(data.message || 'Backup code generation failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Backup code generation failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const getMFAStatus = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/mfa/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get MFA status');
      }
    } catch (error: unknown) {
      console.error('MFA status check failed:', error);
      return { mfaEnabled: false };
    }
  };

  // Helper functions
  const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
    }
    return null;
  };

  const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
      // Use localStorage for persistent sessions, sessionStorage for temporary
      localStorage.setItem('admin_token', token);
      
      // Also set as cookie for middleware to access
      // Remove 'secure' flag for development (localhost)
      const isProduction = window.location.protocol === 'https:';
      const secureFlag = isProduction ? '; secure' : '';
      document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}${secureFlag}; samesite=strict`;
    }
  };

  const clearAuthData = (triggerRedirect: boolean = false) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_user');
      
      // Clear cookies
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'fresh_county_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Only trigger redirect if explicitly requested (e.g., from logout, not from initial auth check)
      if (triggerRedirect && user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    loginWithMFA,
    logout,
    setupMFA,
    confirmMFA,
    disableMFA,
    generateBackupCodes,
    getMFAStatus,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}