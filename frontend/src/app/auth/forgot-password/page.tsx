"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ForgotPasswordModal } from '@/components/auth/forgot-password-modal'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(true)

  const handleClose = () => {
    setIsModalOpen(false)
    router.push('/')
  }

  const handleSignInClick = () => {
    setIsModalOpen(false)
    router.push('/auth/signin')
  }

  return (
    <ForgotPasswordModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSignInClick={handleSignInClick}
    />
  )
}