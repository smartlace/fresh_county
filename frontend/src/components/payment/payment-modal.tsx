"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { formatPriceSimple } from '@/lib/utils'
import { X, Copy, Check } from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  customerEmail: string
  totalAmount: number
  onPaymentConfirmed: () => void
  isProcessing?: boolean
}

interface BankDetails {
  bank_name: string
  account_name: string
  account_number: string
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  totalAmount, 
  onPaymentConfirmed,
  isProcessing = false
}: PaymentModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null)
  const [isLoadingBankDetails, setIsLoadingBankDetails] = useState(false)

  // Fetch bank details from API
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!isOpen) return // Only fetch when modal is open
      
      setIsLoadingBankDetails(true)
      try {
        const response = await fetch('/api/settings/bank-details')
        const data = await response.json()
        
        if (data.success && data.data?.bankDetails) {
          setBankDetails(data.data.bankDetails)
        } else {
          // Fallback to default values if API fails
          setBankDetails({
            bank_name: 'MoniePoint',
            account_name: 'Freshcounty',
            account_number: '35176728977'
          })
        }
      } catch (error) {
        console.error('Failed to fetch bank details:', error)
        // Fallback to default values
        setBankDetails({
          bank_name: 'MoniePoint',
          account_name: 'Freshcounty',
          account_number: '35176728977'
        })
      } finally {
        setIsLoadingBankDetails(false)
      }
    }

    fetchBankDetails()
  }, [isOpen])

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  if (!isOpen) return null

  // Show loading state while fetching bank details
  if (isLoadingBankDetails || !bankDetails) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}}>
        <div className="bg-white rounded-2xl max-w-md w-full mx-4 relative">
          <div className="p-8">
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading payment details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}}>
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-8">
          {/* Header with Logo */}
          <div className="flex items-center mb-8">
            <div className="relative w-16 h-16 mr-4">
              <Image
                src="/logo.png"
                alt="Fresh County"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Customer Info */}
          <div className="text-center mb-6">
            <p className="text-lg font-bold">
              Pay <span className="text-[#FE4501]">₦{formatPriceSimple(totalAmount)}</span>
            </p>
          </div>

          {/* Payment Method Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">PAY WITH BANK TRANSFER</h2>
            <p className="text-gray-500 text-base">Transfer via Your Bank</p>
          </div>

          {/* Bank Details Card */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-5">
            {/* Bank Name */}
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Bank</p>
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">{bankDetails.bank_name}</p>
              </div>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Account Name */}
            <div className="mb-4">
              <p className="text-gray-500 text-sm mb-1">Account Name</p>
              <p className="text-base font-semibold text-gray-900">{bankDetails.account_name}</p>
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Account Number */}
            <div>
              <p className="text-gray-500 text-sm mb-1">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-900">{bankDetails.account_number}</p>
                <button
                  onClick={() => copyToClipboard(bankDetails.account_number, 'accountNumber')}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  {copiedField === 'accountNumber' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Instruction Message */}
          <div className="mb-8">
            <p className="text-[#FE4501] text-sm text-center">
              Click on the button below after you make a transfer
            </p>
          </div>

          {/* Confirm Payment Button */}
          <Button
            onClick={onPaymentConfirmed}
            disabled={isProcessing}
            className="w-full bg-[#FE4501] hover:bg-[#FE4501]/90 text-white py-4 text-sm font-medium rounded-xl disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </div>
            ) : (
              'I HAVE SENT THE MONEY'
            )}
          </Button>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-base text-gray-500 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Payment
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}