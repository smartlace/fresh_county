"use client"

import React from 'react'
import { SignUpModal } from '@/components/auth/signup-modal'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/')
  }

  const handleSignInClick = () => {
    router.push('/auth/signin')
  }

  return (
    <SignUpModal
      isOpen={true}
      onClose={handleClose}
      onSignInClick={handleSignInClick}
    />
  )
}