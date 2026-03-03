"use client"

import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { getSafeRedirectUrl, sanitizeAuthInput, isValidEmail } from '@/lib/auth-utils'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignUpClick: () => void
  onForgotPasswordClick?: () => void
}

export function SignInModal({ isOpen, onClose, onSignUpClick, onForgotPasswordClick }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // SECURITY: Sanitize inputs
    const sanitizedEmail = sanitizeAuthInput(email)
    const sanitizedPassword = sanitizeAuthInput(password)
    
    // SECURITY: Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    
    if (sanitizedPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    
    try {
      const result = await login({ email: sanitizedEmail, password: sanitizedPassword })
      
      if (result.success) {
        onClose()
        
        // SECURITY: Use safe redirect validation to prevent open redirect attacks
        const safeRedirectUrl = getSafeRedirectUrl('/')
        router.push(safeRedirectUrl)
      } else {
        setError(result.message || 'Login failed. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col md:flex-row">

      {/* Left side - Background visible (hidden on mobile) */}
      <div
        className="hidden md:flex flex-1 auth-lhs bg-cover bg-center"
        style={{
          backgroundImage: "url('/home-bg.jpg')"
        }}
        onClick={onClose}
      ></div>

      {/* Right side - Form area */}
      <div className="flex-1 flex items-center justify-center auth-rhs bg-white relative overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-red-500 hover:text-red-600 z-10 cursor-pointer touch-manipulation"
          aria-label="Close"
        >
          <X className="w-6 h-6 md:w-6 md:h-6" />
        </button>

        <div className="relative bg-white w-full max-w-[600px] h-auto overflow-hidden flex flex-col auth-wrap px-6 md:px-0">

          <div className="flex-1 px-4 sm:px-8 md:px-10 py-8 md:py-16 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex justify-center mb-6 md:mb-10">
              <div className="relative w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]">
                <Image
                  src="/logo.png"
                  alt="FreshCounty Logo"
                  fill
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-bold text-center text-gray-900 mb-8 md:mb-[50px] font-heading">
              SIGN IN
            </h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: '#151414'}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: '#151414'}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2  hover:text-gray-600 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1" style={{fontSize: '0.9rem'}}>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3 h-3 rounded border-gray-300 text-[#FE4501] focus:ring-[#FE4501]"
                  />
                  <span className="ml-2 text-gray-600">Remember Me</span>
                </label>
                {onForgotPasswordClick ? (
                  <button
                    type="button"
                    onClick={onForgotPasswordClick}
                    className="text-gray-600 hover:text-[#FE4501] cursor-pointer"
                  >
                    Forgot Password
                  </button>
                ) : (
                  <Link
                    href="/auth/forgot-password"
                    className="text-gray-600 hover:text-[#FE4501]"
                    onClick={onClose}
                  >
                    Forgot Password
                  </Link>
                )}
              </div>

              {/* Sign In Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-sm sm:text-base font-semibold bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601] rounded-lg font-heading text-white cursor-pointer touch-manipulation"
                  style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '52px'}}
                  disabled={isLoading}
                >
                  {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center text-gray-600 pt-3 text-sm sm:text-base">
                Don&apos;t have an account,{' '}
                <button
                  type="button"
                  onClick={onSignUpClick}
                  className="text-[#FE4501] hover:text-[#E63E01] font-medium cursor-pointer touch-manipulation inline-block py-1"
                >
                  Create an Account
                </button>
              </div>

              {/* Terms */}
              <div className="text-center pt-2">
                <Link
                  href="/terms"
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm inline-block py-2 touch-manipulation"
                  onClick={onClose}
                >
                  Terms of Service and Privacy Policy
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}