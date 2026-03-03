"use client"

import React from 'react'
import { AuthModal } from '@/components/auth/auth-modal'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  const handleClose = () => {
    router.push('/')
  }

  return (
    <AuthModal
      isOpen={true}
      onClose={handleClose}
      initialMode="signin"
    />
  )
}