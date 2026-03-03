"use client"

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSignInClick: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onSignInClick }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { forgotPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsLoading(true)
    
    try {
      const result = await forgotPassword(email)
      
      if (result.success) {
        setSuccess(true)
        // Don't close modal immediately, let user see success message
        setTimeout(() => {
          onClose()
        }, 3000)
      } else {
        setError(result.message || 'Failed to send reset email. Please try again.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
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
              FORGOT PASSWORD
            </h2>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
                Password reset email sent! Please check your inbox and follow the instructions.
              </div>
            )}

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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                </div>
              </div>

              {/* Reset Password Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-sm sm:text-base font-semibold bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601] rounded-lg font-heading text-white touch-manipulation"
                  style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '52px'}}
                  disabled={isLoading}
                >
                  {isLoading ? 'SENDING RESET LINK...' : 'SEND RESET LINK'}
                </Button>
              </div>

              {/* Back to Sign In Link */}
              <div className="text-center text-gray-600 pt-3 text-sm sm:text-base">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={onSignInClick}
                  className="text-[#FE4501] hover:text-[#E63E01] font-medium touch-manipulation inline-block py-1"
                >
                  Sign In
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