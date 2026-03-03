"use client"

import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  token?: string
  onSignInClick?: () => void
}

export function ResetPasswordModal({ isOpen, onClose, token, onSignInClick }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { resetPassword } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const validatePasswords = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter'
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = 'Password must contain at least one special character'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswords() || !token) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const result = await resetPassword(token, password)
      
      if (result.success) {
        setIsSuccess(true)
        // Show success message briefly, then redirect
        setTimeout(() => {
          if (onSignInClick) {
            onSignInClick()
          } else {
            onClose()
            router.push('/auth/signin')
          }
        }, 2000)
      } else {
        setErrors({ general: result.message || 'Failed to reset password. Please try again.' })
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
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
          className="absolute top-4 right-4 md:top-6 md:right-6 text-red-500 hover:text-red-600 z-10 touch-manipulation"
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
              RESET PASSWORD
            </h2>

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: '#151414'}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: '#151414'}}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-gray-500 pt-2">
                Password must be at least 8 characters with uppercase letter and special character
              </div>

              {/* Reset Password Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className={`w-full text-sm sm:text-base font-semibold rounded-lg font-heading text-white touch-manipulation ${isSuccess ? 'bg-green-500 hover:bg-green-600' : 'bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601]'}`}
                  style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '52px'}}
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'RESETTING PASSWORD...' : isSuccess ? '✓ PASSWORD RESET SUCCESSFUL!' : 'RESET PASSWORD'}
                </Button>
              </div>

              {/* Back to Sign In */}
              <div className="text-center text-gray-600 pt-3 text-sm sm:text-base">
                Remember your password?{' '}
                <Link
                  href="/auth/signin"
                  className="text-[#FE4501] hover:text-[#E63E01] font-medium touch-manipulation inline-block py-1"
                  onClick={onClose}
                >
                  Sign In
                </Link>
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