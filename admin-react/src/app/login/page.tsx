'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
// Remove unused env import
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithMFA, isAuthenticated, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [mfaLoginToken, setMfaLoginToken] = useState('');
  const [showMFA, setShowMFA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.requiresMFA) {
        setMfaLoginToken(result.mfaLoginToken || '');
        setShowMFA(true);
        toast.success('Please enter your MFA code');
      } else {
        // Login successful, will redirect via useEffect
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMFALogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mfaToken || mfaToken.length !== 6) {
      toast.error('Please enter a valid 6-digit MFA code');
      return;
    }

    try {
      setLoading(true);
      await loginWithMFA(mfaToken, mfaLoginToken);
      // Login successful, will redirect via useEffect
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'MFA verification failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetMFA = () => {
    setShowMFA(false);
    setMfaToken('');
    setMfaLoginToken('');
  };

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center mb-8">
            <Image 
              src="/logo.png" 
              alt="Fresh County Logo" 
              width={96}
              height={96}
              className="h-24 w-auto"
            />
          </div>
          
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            {showMFA ? 'Two-Factor Authentication' : 'Admin Portal'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showMFA 
              ? 'Enter your authenticator code to continue' 
              : 'Secure access to Fresh County admin dashboard'
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100">

          {!showMFA ? (
            // Regular Login Form
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-5">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors touch-manipulation"
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockClosedIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm sm:text-base transition-colors touch-manipulation"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:from-orange-800 active:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 transform hover:scale-[1.02] touch-manipulation"
                  style={{minHeight: '48px'}}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="h-4 w-4 mr-2" />
                      Sign in to Dashboard
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-4">
                <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500 transition-colors inline-block py-2 touch-manipulation">
                  Forgot your password?
                </a>
              </div>
            </form>
          ) : (
            // MFA Form
            <form className="space-y-6" onSubmit={handleMFALogin}>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  Enter the 6-digit verification code from your authenticator app
                </p>
              </div>

              <div>
                <label htmlFor="mfa-token" className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Authentication Code
                </label>
                <input
                  id="mfa-token"
                  name="mfa-token"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={mfaToken}
                  onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-xl sm:text-2xl tracking-[0.5em] font-mono transition-colors touch-manipulation"
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || mfaToken.length !== 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:from-green-800 active:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-200 transform hover:scale-[1.02] touch-manipulation"
                  style={{minHeight: '48px'}}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheckIcon className="h-4 w-4 mr-2" />
                      Verify & Continue
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetMFA}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors touch-manipulation"
                  style={{minHeight: '48px'}}
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

        </div>
        
        {/* Security Features */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <LockClosedIcon className="h-3 w-3 mr-1" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center">
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              <span>MFA Protected</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            All Rights Reserved. Fresh County © 2025
          </p>
        </div>
      </div>
    </div>
  );
}