"use client"

import React, { useState } from 'react'
import { SignInModal } from './signin-modal'
import { SignUpModal } from './signup-modal'
import { ForgotPasswordModal } from './forgot-password-modal'
import { ResetPasswordModal } from './reset-password-modal'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup' | 'forgot-password' | 'reset-password'
  resetToken?: string
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin', resetToken }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'reset-password'>(initialMode)

  const handleSwitchToSignUp = () => {
    setMode('signup')
  }

  const handleSwitchToSignIn = () => {
    setMode('signin')
  }

  const handleSwitchToForgotPassword = () => {
    setMode('forgot-password')
  }

  // const handleSwitchToResetPassword = () => {
  //   setMode('reset-password')
  // }

  if (mode === 'signin') {
    return (
      <SignInModal
        isOpen={isOpen}
        onClose={onClose}
        onSignUpClick={handleSwitchToSignUp}
        onForgotPasswordClick={handleSwitchToForgotPassword}
      />
    )
  }

  if (mode === 'signup') {
    return (
      <SignUpModal
        isOpen={isOpen}
        onClose={onClose}
        onSignInClick={handleSwitchToSignIn}
      />
    )
  }

  if (mode === 'forgot-password') {
    return (
      <ForgotPasswordModal
        isOpen={isOpen}
        onClose={onClose}
        onSignInClick={handleSwitchToSignIn}
      />
    )
  }

  if (mode === 'reset-password') {
    return (
      <ResetPasswordModal
        isOpen={isOpen}
        onClose={onClose}
        token={resetToken || 'demo-token-123'}
        onSignInClick={handleSwitchToSignIn}
      />
    )
  }

  // Default fallback
  return (
    <SignInModal
      isOpen={isOpen}
      onClose={onClose}
      onSignUpClick={handleSwitchToSignUp}
    />
  )
}