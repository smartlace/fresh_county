"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ResetPasswordModal } from '@/components/auth'

export function ResetPasswordPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)
  
  const token = searchParams.get('token')

  useEffect(() => {
    // Validate token exists
    if (!token) {
      // Redirect to forgot password page if no token
      router.push('/auth/forgot-password')
      return
    }
  }, [token, router])

  const handleClose = () => {
    setIsOpen(false)
    // Redirect to sign in page after closing
    router.push('/auth/signin')
  }

  // Don't render if no token
  if (!token) {
    return null
  }

  return (
    <ResetPasswordModal
      isOpen={isOpen}
      onClose={handleClose}
      token={token}
    />
  )
}