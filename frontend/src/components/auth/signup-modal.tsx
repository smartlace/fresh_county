"use client"

import React, { useState } from 'react'
import { X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface SignUpModalProps {
  isOpen: boolean
  onClose: () => void
  onSignInClick: () => void
}

export function SignUpModal({ isOpen, onClose, onSignInClick }: SignUpModalProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Password validation state
  const [passwordFocused, setPasswordFocused] = useState(false)
  
  // Email validation state
  const [emailFocused, setEmailFocused] = useState(false)
  const [emailCheckLoading, setEmailCheckLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const { register, isLoading } = useAuth()
  const router = useRouter()

  // Password validation logic
  const validatePassword = (password: string) => {
    const requirements = [
      {
        label: 'At least 8 characters',
        test: password.length >= 8
      },
      {
        label: 'One uppercase letter',
        test: /[A-Z]/.test(password)
      },
      {
        label: 'One lowercase letter',
        test: /[a-z]/.test(password)
      },
      {
        label: 'One number',
        test: /\d/.test(password)
      },
      {
        label: 'One special character',
        test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ]
    
    return requirements
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = passwordRequirements.every(req => req.test)

  // Mobile validation logic
  const validateMobile = (mobile: string) => {
    const requirements = [
      {
        label: 'Exactly 10 digits',
        test: mobile.length === 10
      },
      {
        label: 'Only numbers allowed',
        test: /^\d+$/.test(mobile)
      },
      {
        label: 'Valid Nigerian mobile format',
        test: /^[789]\d{9}$/.test(mobile) // Nigerian mobile numbers start with 7, 8, or 9
      }
    ]
    
    return requirements
  }

  const mobileRequirements = validateMobile(mobile)
  const isMobileValid = mobile.length === 0 || mobileRequirements.every(req => req.test)

  // Full name validation logic
  const validateFullName = (name: string) => {
    const requirements = [
      {
        label: 'At least 2 characters',
        test: name.trim().length >= 2
      },
      {
        label: 'Contains at least 2 words',
        test: name.trim().split(/\s+/).length >= 2
      },
      {
        label: 'Letters and spaces only',
        test: /^[a-zA-Z\s]+$/.test(name)
      },
      {
        label: 'No leading/trailing spaces',
        test: name === name.trim()
      }
    ]
    
    return requirements
  }

  const fullNameRequirements = validateFullName(fullName)
  const isFullNameValid = fullNameRequirements.every(req => req.test)

  // Email format validation
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Email duplicate check with debouncing
  const checkEmailExists = React.useCallback(async (emailToCheck: string) => {
    if (!isEmailFormatValid || emailToCheck.length < 3) {
      setEmailExists(false)
      return
    }

    setEmailCheckLoading(true)
    try {
      // Simple check by attempting a request that would fail if email exists
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToCheck })
      })
      
      const data = await response.json()
      setEmailExists(data.exists || false)
    } catch {
      // If endpoint doesn't exist, we'll skip the check
      setEmailExists(false)
    } finally {
      setEmailCheckLoading(false)
    }
  }, [isEmailFormatValid])

  // Debounce email check
  React.useEffect(() => {
    if (email && isEmailFormatValid) {
      const timer = setTimeout(() => {
        checkEmailExists(email)
      }, 1000) // Wait 1 second after user stops typing
      
      return () => clearTimeout(timer)
    } else {
      setEmailExists(false)
    }
  }, [email, isEmailFormatValid, checkEmailExists])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowSuccess(false)
    
    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      const result = await register({
        email,
        password,
        firstName,
        lastName,
        phone: mobile ? `+234${mobile}` : undefined
      })
      
      if (result.success) {
        setShowSuccess(true)
        // Show success message for 2 seconds before redirecting
        setTimeout(() => {
          onClose()
          router.push('/') // Redirect to homepage
        }, 2000)
      } else {
        // Handle detailed password validation errors
        if (result.message && result.message.includes('Password does not meet security requirements')) {
          setError('Please ensure your password meets all the requirements listed below.')
        } else {
          setError(result.message || 'Registration failed. Please try again.')
        }
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
          className="absolute top-4 right-4 md:top-6 md:right-6 text-red-500 hover:text-red-600 z-10 touch-manipulation"
          aria-label="Close"
        >
          <X className="w-6 h-6 md:w-6 md:h-6" />
        </button>

        <div className="relative bg-white w-full max-w-[600px] h-auto overflow-hidden flex flex-col auth-wrap px-6 md:px-0">

          <div className="flex-1 px-4 sm:px-8 md:px-10 py-6 md:py-12 flex flex-col justify-center">
            {/* Logo */}
            <div className="flex justify-center mb-4 md:mb-8">
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
            <h2 className="text-2xl sm:text-3xl md:text-[2rem] font-bold text-center text-gray-900 mb-6 md:mb-[50px] font-heading">
              CREATE ACCOUNT
            </h2>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                {error}
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
                Registration successful! Welcome to FreshCounty
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Full Name Field */}
              <div>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none pr-8"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  
                  {/* Full Name Status Indicator */}
                  {fullName.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isFullNameValid ? (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Full Name Error Message */}
                {!isFullNameValid && fullName.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 flex items-center">
                    <div className="w-3 h-3 mr-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Please enter your full name (first and last name, letters only)
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    required
                    className="text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none pr-8"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  
                  {/* Email Status Indicator */}
                  {email.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailCheckLoading ? (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : isEmailFormatValid && !emailExists ? (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : emailExists ? (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : null}
                    </div>
                  )}
                </div>
                
                {/* Email Validation Feedback */}
                {(emailFocused || email.length > 0) && (
                  <div className="mt-2">
                    {!isEmailFormatValid && email.length > 0 && (
                      <div className="text-xs text-red-600 flex items-center">
                        <div className="w-3 h-3 mr-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        Please enter a valid email address
                      </div>
                    )}
                    
                    {emailExists && (
                      <div className="text-xs text-red-600 flex items-center">
                        <div className="w-3 h-3 mr-2">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        This email address is already registered
                      </div>
                    )}
                    
                  </div>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <div className="flex relative">
                  <div className="flex items-center justify-center bg-gray-100 border border-r-0 border-gray-200 rounded-l-md px-3 text-sm text-gray-700 font-medium">
                    +234
                  </div>
                  <Input
                    type="tel"
                    placeholder="8012345678"
                    value={mobile}
                    onChange={(e) => {
                      // Only allow digits and limit to 10 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setMobile(value)
                    }}
                    required
                    className="flex-1 text-sm border-gray-200 rounded-l-none rounded-r-md focus:border-[#FE4501] pr-8"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  
                  {/* Mobile Status Indicator */}
                  {mobile.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isMobileValid ? (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Mobile Error Message */}
                {!isMobileValid && mobile.length > 0 && (
                  <div className="mt-2 text-xs text-red-600 flex items-center">
                    <div className="w-3 h-3 mr-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Please enter a valid Nigerian mobile number (10 digits starting with 7, 8, or 9)
                  </div>
                )}
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
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    required
                    className="pl-10 pr-10 text-sm border-gray-200 rounded-md focus:border-[#FE4501] focus:ring-0 focus:outline-none"
                    style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '50px', backgroundColor: 'white', fontSize: '0.9rem', outline: 'none', boxShadow: 'none'}}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2  hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {/* Interactive Password Requirements */}
                {(passwordFocused || password.length > 0) && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</div>
                    <div className="space-y-1">
                      {passwordRequirements.map((requirement, index) => (
                        <div 
                          key={index}
                          className={`flex items-center text-xs ${
                            requirement.test 
                              ? 'text-green-600' 
                              : 'text-gray-500'
                          }`}
                        >
                          <div className="w-4 h-4 mr-2 flex items-center justify-center">
                            {requirement.test ? (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                            )}
                          </div>
                          <span className={requirement.test ? 'line-through' : ''}>{requirement.label}</span>
                        </div>
                      ))}
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 text-xs">
                        <div className={`font-medium ${isPasswordValid ? 'text-green-600' : 'text-orange-600'}`}>
                          Password Strength: {isPasswordValid ? 'Strong' : 'Weak'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Create Account Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-xs sm:text-sm font-semibold bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601] rounded-lg font-heading text-white disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation"
                  style={{paddingTop: '15px', paddingBottom: '15px', minHeight: '52px'}}
                  disabled={isLoading || !isPasswordValid || !isFullNameValid || !isMobileValid || !isEmailFormatValid || emailExists}
                >
                  {isLoading
                    ? 'CREATING ACCOUNT...'
                    : !isFullNameValid && fullName.length > 0
                    ? 'COMPLETE NAME REQUIREMENTS'
                    : emailExists
                    ? 'EMAIL ALREADY EXISTS'
                    : !isEmailFormatValid && email.length > 0
                    ? 'INVALID EMAIL FORMAT'
                    : !isMobileValid && mobile.length > 0
                    ? 'COMPLETE MOBILE REQUIREMENTS'
                    : !isPasswordValid && password.length > 0
                    ? 'COMPLETE PASSWORD REQUIREMENTS'
                    : 'CREATE ACCOUNT'
                  }
                </Button>
              </div>

              {/* Sign In Link */}
              <div className="text-center text-gray-600 pt-3 text-sm sm:text-base">
                Already have an account,{' '}
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