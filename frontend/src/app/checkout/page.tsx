"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPriceSimple, getImageUrl } from '@/lib/utils'
import { ChevronLeft } from 'lucide-react'

interface DeliveryInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  mobileNumber: string
  email: string
  saveInfo: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, deliveryCost, taxAmount, taxRate, total, delivery, discountState, applyDiscount, removeDiscount } = useCart()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [discountCode, setDiscountCode] = useState('')
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    mobileNumber: '',
    email: '',
    saveInfo: false
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/checkout')
    }
  }, [isAuthenticated, isLoading, router])

  // Always populate with current user's data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Clear any previous checkout data from localStorage
      localStorage.removeItem('checkoutDeliveryInfo')
      
      // Parse user's full name
      const [firstName = '', lastName = ''] = (user.full_name || '').split(' ', 2)
      
      // Remove country code if present for display
      let phoneNumber = user.mobile || ''
      if (phoneNumber.startsWith('+234')) {
        phoneNumber = phoneNumber.slice(4)
      } else if (phoneNumber.startsWith('234')) {
        phoneNumber = phoneNumber.slice(3)
      }
      
      // Always use current user's data
      setDeliveryInfo({
        firstName,
        lastName,
        address: user.address || '',
        city: user.city || '',
        mobileNumber: phoneNumber,
        email: user.email || '',
        saveInfo: false
      })
    }
  }, [isAuthenticated, user])

  const handleInputChange = (field: keyof DeliveryInfo, value: string | boolean) => {
    const updatedInfo = { ...deliveryInfo, [field]: value }
    setDeliveryInfo(updatedInfo)
    
    // Save to localStorage as user types to preserve data when navigating back
    localStorage.setItem('checkoutDeliveryInfo', JSON.stringify(updatedInfo))
  }

  const handleApplyDiscount = async () => {
    if (!user || !discountCode.trim()) {
      return
    }

    const result = await applyDiscount(discountCode.trim(), user.id)
    
    if (result.success) {
      setDiscountCode('') // Clear the input on success
    }
  }

  const handleRemoveDiscount = () => {
    removeDiscount()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Save delivery info to localStorage and pass via URL params
    localStorage.setItem('checkoutDeliveryInfo', JSON.stringify(deliveryInfo))
    
    // Navigate to payment page with delivery info as query params
    const params = new URLSearchParams({
      firstName: deliveryInfo.firstName,
      lastName: deliveryInfo.lastName,
      address: deliveryInfo.address,
      city: deliveryInfo.city,
      mobileNumber: deliveryInfo.mobileNumber,
      email: deliveryInfo.email
    })
    
    router.push(`/payment?${params.toString()}`)
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Don't render if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Link href="/categories">
              <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90 cursor-pointer">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section - Delivery Address */}
        <div className="bg-white py-12 px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl ml-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">DELIVERY ADDRESS</h1>
              
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      id="firstName"
                      value={deliveryInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                      placeholder=" "
                      required
                    />
                    <label 
                      htmlFor="firstName"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                    >
                      First Name
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      id="lastName"
                      value={deliveryInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                      placeholder=" "
                      required
                    />
                    <label 
                      htmlFor="lastName"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                    >
                      Last Name
                    </label>
                  </div>
                </div>

                {/* Address */}
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="address"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                  >
                    Address
                  </label>
                </div>

                {/* City & Mobile Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      id="city"
                      value={deliveryInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                      placeholder=" "
                      required
                    />
                    <label 
                      htmlFor="city"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                    >
                      City
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute left-1 top-1 h-[calc(100%-8px)] flex items-center px-3 bg-[#ebeaea] text-gray-700 font-medium rounded-l-lg z-10">
                      +234
                    </div>
                    <input
                      type="tel"
                      id="mobileNumber"
                      value={deliveryInfo.mobileNumber}
                      onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                      className="w-full pl-20 pr-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                      placeholder=" "
                      required
                    />
                    <label 
                      htmlFor="mobileNumber"
                      className="absolute left-20 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                    >
                      Mobile Number
                    </label>
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={deliveryInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 pt-4 pb-2 h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent peer"
                    placeholder=" "
                    required
                  />
                  <label 
                    htmlFor="email"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 pointer-events-none peer-focus:text-xs peer-focus:-translate-y-6 peer-focus:text-[#FE4501] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:-translate-y-6 peer-[:not(:placeholder-shown)]:text-gray-600"
                  >
                    Email
                  </label>
                </div>

                {/* Save Info Checkbox */}
                <div className="flex items-center gap-3 mt-6">
                  <input
                    type="checkbox"
                    id="saveInfo"
                    checked={deliveryInfo.saveInfo}
                    onChange={(e) => handleInputChange('saveInfo', e.target.checked)}
                    className="w-4 h-4 text-[#FE4501] border-gray-300 rounded focus:ring-[#FE4501]"
                  />
                  <label htmlFor="saveInfo" className="text-gray-700 text-sm">
                    Save this information for next time
                  </label>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12">
                  <Link href="/cart" className="flex items-center gap-2 text-gray-600 hover:text-[#FE4501]">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Return to cart</span>
                  </Link>
                  
                  <Button 
                    type="submit"
                    className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-8 py-3 rounded-lg font-medium cursor-pointer"
                  >
                    CONTINUE
                  </Button>
                </div>
              </form>

              {/* Divider */}
              <hr className="border-t border-gray-200 my-6" />

              {/* Legal Links */}
              <div className="text-sm text-gray-600">
                <Link href="/terms" className="hover:text-gray-900 underline">Terms of Service</Link>
                <span className="mx-2">,</span>
                <Link href="/privacy-policy" className="hover:text-gray-900 underline">Privacy Policy</Link>
                <span className="mx-2">, and</span>
                <Link href="/cancellation-policy" className="hover:text-gray-900 underline">Cancellation Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="bg-gray-50 py-27 px-8 border-l border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mr-auto">
              {/* Cart Items */}
              <div className="space-y-4 mb-8">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {item.image ? (
                          <Image
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₦{formatPriceSimple(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-8">
                {discountState.appliedDiscount ? (
                  <div className="relative bg-white border border-gray-200 rounded-lg p-4">
                    {/* Success icon */}
                    <div className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <div className="pr-8">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                          {discountState.appliedDiscount.code}
                        </span>
                        <span className="text-green-600 text-sm font-medium">Applied</span>
                      </div>
                      
                      <p className="text-gray-700 text-sm">
                        You saved <span className="font-semibold text-green-600">₦{formatPriceSimple(discountState.appliedDiscount.discount_amount)}</span> on this order
                      </p>
                    </div>

                    <button
                      onClick={handleRemoveDiscount}
                      className="absolute bottom-3 right-3 text-xs text-gray-500 hover:text-gray-700 underline hover:no-underline transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter discount code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        className="flex-1 px-4 py-4 h-14 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE4501] focus:border-transparent transition-all"
                        disabled={discountState.isValidating}
                      />
                      <Button 
                        onClick={handleApplyDiscount}
                        disabled={discountState.isValidating || !discountCode.trim() || !isAuthenticated}
                        className={`px-6 h-14 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer ${
                          discountCode.trim() 
                            ? 'bg-gray-300 hover:bg-gray-400' 
                            : 'bg-[#ebeaea] hover:bg-gray-300'
                        }`}
                      >
                        {discountState.isValidating ? 'APPLYING...' : 'APPLY'}
                      </Button>
                    </div>
                    
                    {!isAuthenticated && (
                      <p className="text-gray-500 text-xs">Please log in to apply discount codes</p>
                    )}
                  </div>
                )}
                
                {discountState.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {discountState.error}
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₦{formatPriceSimple(subtotal)}</span>
                </div>
                {discountState.appliedDiscount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount - {discountState.appliedDiscount.code}</span>
                    <span>-₦{formatPriceSimple(discountState.appliedDiscount.discount_amount)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Tax ({taxRate}%)</span>
                    <span>₦{formatPriceSimple(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700">
                  <span>Delivery</span>
                  <span>{delivery === 'pickup' ? 'Pickup' : `₦${formatPriceSimple(deliveryCost)}`}</span>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span>₦{formatPriceSimple(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}