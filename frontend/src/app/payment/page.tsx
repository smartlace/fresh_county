"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { formatPriceSimple, getImageUrl } from '@/lib/utils'
import { ArrowLeft, Check } from 'lucide-react'
import { PaymentModal } from '@/components/payment/payment-modal'
import { apiService } from '@/lib/api'

interface DeliveryInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  mobileNumber: string
  email: string
}

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, subtotal, deliveryCost, total, delivery, selectedShippingZone, discountState, taxAmount, taxRate, clearCart, removeDiscount } = useCart()
  const { isAuthenticated, isLoading } = useAuth()
  
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    mobileNumber: '',
    email: ''
  })
  
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin?redirect=/payment')
    }
  }, [isAuthenticated, isLoading, router])

  // Load delivery info from URL params or localStorage
  useEffect(() => {
    const firstName = searchParams.get('firstName')
    const lastName = searchParams.get('lastName')
    const address = searchParams.get('address')
    const city = searchParams.get('city')
    const mobileNumber = searchParams.get('mobileNumber')
    const email = searchParams.get('email')

    if (firstName && lastName && address && city && mobileNumber && email) {
      setDeliveryInfo({
        firstName,
        lastName,
        address,
        city,
        mobileNumber,
        email
      })
    } else {
      // Fallback to localStorage
      const savedInfo = localStorage.getItem('checkoutDeliveryInfo')
      if (savedInfo) {
        try {
          const parsed = JSON.parse(savedInfo)
          setDeliveryInfo(parsed)
        } catch (error) {
          console.error('Error parsing delivery info from localStorage:', error)
          // Redirect back to checkout if no valid delivery info
          router.push('/checkout')
        }
      } else {
        // Redirect back to checkout if no delivery info
        router.push('/checkout')
      }
    }
  }, [searchParams, router])

  const handlePayment = async () => {
    // Show payment modal instead of processing
    setShowPaymentModal(true)
  }

  const handlePaymentConfirmed = async () => {
    setIsProcessing(true)
    setShowPaymentModal(false)
    
    try {
      // Prepare order data with cart items
      const orderData = {
        shipping_address: {
          first_name: deliveryInfo.firstName,
          last_name: deliveryInfo.lastName,
          address_line_1: deliveryInfo.address,
          city: deliveryInfo.city,
          state: 'Lagos', // Default state, can be made dynamic later
          postal_code: '', // Optional field, empty for now
          country: 'Nigeria',
          phone: `+234${deliveryInfo.mobileNumber}`,
          email: deliveryInfo.email
        },
        billing_address: {
          first_name: deliveryInfo.firstName,
          last_name: deliveryInfo.lastName,
          address_line_1: deliveryInfo.address,
          city: deliveryInfo.city,
          state: 'Lagos', // Default state, can be made dynamic later
          postal_code: '', // Optional field, empty for now
          country: 'Nigeria',
          phone: `+234${deliveryInfo.mobileNumber}`,
          email: deliveryInfo.email
        },
        payment_method: 'bank_transfer',
        coupon_code: discountState.appliedDiscount?.code || undefined,
        delivery_type: delivery,
        delivery_cost: deliveryCost,
        shipping_zone_id: selectedShippingZone?.id || null,
        notes: `Order placed via website. Delivery: ${delivery === 'pickup' ? 'Pickup' : `Home Delivery (${selectedShippingZone?.name || 'Unknown Zone'})`}. Payment method: Bank Transfer. Total: ₦${formatPriceSimple(total)}`,
        cart_items: items.map(item => {
          const cartItem = {
            product_id: item.product_id || item.id, // Use base product_id for variable products, fallback to id for regular products
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
            variation_id: item.variation_id || null, // Include variation info if available
            variation_name: item.variation_id ? item.size : null // Use size field as variation name for variable products
          }
          
                    
          return cartItem
        })
      }

      // Submit order to backend using apiService
      const result = await apiService.post('/orders', orderData)

      if (result.success) {
        setIsProcessing(false)
        setOrderComplete(true)
        clearCart() // Clear cart after successful order submission
        removeDiscount() // Clear applied discount after successful order
        localStorage.removeItem('checkoutDeliveryInfo') // Clear delivery info after successful order
      } else {
        console.error('Order submission failed:', result)
        console.error('Full error details:', JSON.stringify(result, null, 2))
        throw new Error(result.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      setIsProcessing(false)
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to submit order: ${errorMessage}. Please try again.`)
      setShowPaymentModal(true) // Reopen modal to try again
    }
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

  if (items.length === 0 && !orderComplete) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before making a payment.</p>
            <Link href="/categories">
              <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (orderComplete) {
    return (
      <>
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Submitted!</h2>
            <p className="text-gray-600 mb-2">Thank you for your order. Your order has been submitted and is pending confirmation.</p>
            <p className="text-sm text-gray-500 mb-8">
              You&apos;ll receive a confirmation email shortly with your order details.
            </p>
            <div className="space-y-3">
              <Link href="/categories">
                <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90 mr-4">
                  Continue Shopping
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
      </>
    )
  }

  return (
    <>
    <MainLayout>
      <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
        {/* Left Section - Customer Info & Cart Summary */}
        <div className="bg-white py-12 px-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl ml-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">REVIEW AND PAY</h1>
              <p className="text-gray-600 mb-8 text-sm">
                By completing your order, you agree to our Terms of Service and Refund Policy
              </p>

              {/* Customer Information Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Deliver to</span>
                    <p className="font-medium text-gray-900">{deliveryInfo.firstName} {deliveryInfo.lastName}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-600">Address</span>
                      <p className="font-medium text-gray-900">{deliveryInfo.address}<br />{deliveryInfo.city}</p>
                    </div>
                    <Link href="/checkout" className="text-sm text-[#FE4501] underline hover:text-[#FE4501]/80">Change</Link>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Email</span>
                      <p className="font-medium text-gray-900">{deliveryInfo.email}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm text-gray-600">Phone Number</span>
                      <p className="font-medium text-gray-900">+234 {deliveryInfo.mobileNumber}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <p className="font-medium text-gray-900">Bank Transfer</p>
                  </div>
                </div>
              </div>

              {/* Cart Summary Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Subtotal</span>
                    <span className="font-medium">₦{formatPriceSimple(subtotal)}</span>
                  </div>
                  {discountState.appliedDiscount && (
                    <div className="flex justify-between text-green-600 text-base">
                      <span>Discount - {discountState.appliedDiscount.code}</span>
                      <span className="font-medium">₦{formatPriceSimple(discountState.appliedDiscount.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Delivery</span>
                    <span className="font-medium">{delivery === 'pickup' ? 'Pickup' : `₦${formatPriceSimple(deliveryCost)}`}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-gray-700 text-base">
                      <span>Tax ({taxRate}%)</span>
                      <span className="font-medium">₦{formatPriceSimple(taxAmount)}</span>
                    </div>
                  )}
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span>
                    <span>₦{formatPriceSimple(total)}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mb-8">
                <Link href="/checkout" className="flex items-center gap-2 text-gray-600 hover:text-[#FE4501]">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to info</span>
                </Link>
                
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-8 py-3 rounded-lg font-medium"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Processing...
                    </div>
                  ) : (
                    'PAY NOW'
                  )}
                </Button>
              </div>

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

        {/* Right Section - Product List */}
        <div className="bg-gray-50 py-12 px-8 border-l border-gray-200">
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
                      <p className="font-medium text-gray-900 text-base">₦{formatPriceSimple(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>


              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700 text-base">
                  <span>Subtotal</span>
                  <span>₦{formatPriceSimple(subtotal)}</span>
                </div>
                {discountState.appliedDiscount && (
                  <div className="flex justify-between text-green-600 text-base">
                    <span>Discount - {discountState.appliedDiscount.code}</span>
                    <span>₦{formatPriceSimple(discountState.appliedDiscount.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-700 text-base">
                  <span>Delivery</span>
                  <span>{delivery === 'pickup' ? 'Pickup' : `₦${formatPriceSimple(deliveryCost)}`}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-700 text-base">
                    <span>Tax ({taxRate}%)</span>
                    <span>₦{formatPriceSimple(taxAmount)}</span>
                  </div>
                )}
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

    {/* Payment Modal */}
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      customerEmail={deliveryInfo.email}
      totalAmount={total}
      onPaymentConfirmed={handlePaymentConfirmed}
      isProcessing={isProcessing}
    />
    </>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment page...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}