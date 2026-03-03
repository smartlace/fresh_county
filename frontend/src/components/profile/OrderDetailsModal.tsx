'use client'

import React from 'react'
import Image from 'next/image'
import { X, Package, Truck, CheckCircle, Clock } from 'lucide-react'
import { Order } from '@/lib/types'


interface OrderDetailsModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Calculate subtotal from items if not provided
  const calculateSubtotal = () => {
    if (!order.items || !Array.isArray(order.items)) return 0
    return order.items.reduce((sum: number, item) => {
      return sum + ((parseFloat(String(item.price)) || 0) * (parseInt(String(item.quantity)) || 0))
    }, 0)
  }

  // Get order financial data from backend fields
  const getOrderFinancials = () => {
    const subtotal = calculateSubtotal() // Calculate from items since not stored separately
    
    // Check multiple possible field names for shipping cost from backend
    const orderWithCost = order as Order & { 
      shipping_cost?: number 
      delivery_cost?: number
    }
    
    // Use exact same logic as admin modal - simple and direct
    const orderWithAmounts = order as Order & {
      tax_amount?: number
      discount_amount?: number | string
    }
    
    const shipping = orderWithCost.delivery_cost || orderWithCost.shipping_cost || order.shipping_fee || 0
    const total = order.total_amount || 0
    
    // Debug log to see what data we have
    if (process.env.NODE_ENV === 'development') {
      console.log('Order data for modal:', {
        delivery_type: order.delivery_type,
        delivery_cost: orderWithCost.delivery_cost,
        shipping_cost: orderWithCost.shipping_cost, 
        shipping_fee: order.shipping_fee,
        calculated_shipping: shipping,
        discount_amount: orderWithAmounts.discount_amount,
        coupon_code: order.coupon_code,
        total_amount: order.total_amount
      })
    }
    
    // Tax: Use backend value first, fallback to estimation
    const backendTax = orderWithAmounts.tax_amount
    const tax = backendTax && backendTax > 0 ? backendTax : (subtotal * 0.075 > 1 ? subtotal * 0.075 : 0)
    
    // Discount: Use exact same simple logic as admin modal
    const discount = orderWithAmounts.discount_amount || 0
    
    return { subtotal, shipping, tax, discount, total }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'processing':
        return <Package className="w-5 h-5 text-purple-600" />
      case 'shipped':
        return <Truck className="w-5 h-5 text-[#FE4501]" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'processing':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'shipped':
        return 'text-[#FE4501] bg-orange-50 border-orange-200'
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const trackingSteps = [
    { key: 'placed', label: 'Order Placed', icon: CheckCircle, status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] },
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, status: ['confirmed', 'processing', 'shipped', 'delivered'] },
    { key: 'processing', label: 'Processing', icon: Package, status: ['processing', 'shipped', 'delivered'] },
    { key: 'shipped', label: 'Shipped', icon: Truck, status: ['shipped', 'delivered'] },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, status: ['delivered'] }
  ]

  // Get current order status
  const currentStatus = order.status || 'pending'

  // Calculate progress based on current status
  const getTrackingProgress = () => {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(currentStatus)
    return currentIndex >= 0 ? currentIndex : 0
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{order.order_number || order.id?.slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="p-6 space-y-8">
                
                {/* Order Tracking */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Tracking</h3>
                  <div className="relative mb-8">
                    {/* Horizontal Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200"></div>
                    
                    {/* Progress Fill */}
                    <div 
                      className="absolute top-6 left-6 h-0.5 bg-[#FE4501] transition-all duration-300"
                      style={{
                        width: `${Math.max(0, (getTrackingProgress() / (trackingSteps.length - 1)) * 100)}%`
                      }}
                    ></div>
                    
                    {/* Status Steps */}
                    <div className="flex justify-between items-start relative">
                      {trackingSteps.map((step, index) => {
                        const isCompleted = step.status.includes(currentStatus) && getTrackingProgress() >= index
                        const isActive = getTrackingProgress() === index
                        
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            {/* Status Icon */}
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 relative z-10 ${
                              isCompleted 
                                ? 'bg-[#FE4501] border-[#FE4501] text-white' 
                                : isActive 
                                ? 'bg-orange-50 border-[#FE4501] text-[#FE4501]'
                                : 'bg-white border-gray-200 text-gray-400'
                            }`}>
                              <step.icon className="w-6 h-6" />
                            </div>
                            
                            {/* Status Info */}
                            <div className="text-center mt-3 max-w-20">
                              <h4 className={`text-sm font-medium ${
                                isCompleted ? 'text-gray-900' : isActive ? 'text-[#FE4501]' : 'text-gray-500'
                              }`}>
                                {step.label}
                              </h4>
                              {isCompleted && (
                                <p className="text-xs text-gray-600 mt-1">
                                  {index === 0 ? formatDate(order.created_at) : 
                                   index === getTrackingProgress() ? formatDate(order.updated_at || order.created_at) : 
                                   ''}
                                </p>
                              )}
                              {isActive && !isCompleted && (
                                <p className="text-xs text-[#FE4501] mt-1">
                                  In progress
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Tracking Number & Estimated Delivery */}
                {(order.tracking_number || order.estimated_delivery) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {order.tracking_number && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Tracking Number</h4>
                        <p className="text-[#FE4501] font-mono text-lg">{order.tracking_number}</p>
                      </div>
                    )}
                    {order.estimated_delivery && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Estimated Delivery</h4>
                        <p className="text-gray-700">{formatDate(order.estimated_delivery)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-4 py-3 grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-center">Unit Price</div>
                      <div className="col-span-3 text-right">Total</div>
                    </div>
                    
                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50">
                          {/* Product Info */}
                          <div className="col-span-5 flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {item.product_image ? (
                                <Image
                                  src={item.product_image.startsWith('http') ? 
                                    item.product_image : 
                                    `/api/proxy-image?url=${encodeURIComponent(item.product_image)}`
                                  }
                                  alt={item.product_name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEgyMFYxNkgxNlYyMFoiIGZpbGw9IiM5Q0E5QkEiLz4KPHBhdGggZD0iTTE0IDMySDM0VjI5TDI5IDI0TDI0IDI5TDIwIDI0TDE0IDMwVjMyWiIgZmlsbD0iIzlDQTlCQSIvPgo8L3N2Zz4K'
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{item.product_name}</h4>
                              
                              {/* Display variation information */}
                              {(() => {
                                // Check for variation_name (primary source)
                                if (item.variation_name && item.variation_name.trim()) {
                                  return (
                                    <p className="text-xs text-gray-600 mt-1">
                                      <span className="font-medium">Variant:</span> {item.variation_name}
                                    </p>
                                  )
                                }
                                
                                // Check for size field (legacy support)
                                if (item.size && item.size.trim()) {
                                  return (
                                    <p className="text-xs text-gray-600 mt-1">
                                      <span className="font-medium">Size:</span> {item.size}
                                    </p>
                                  )
                                }
                                
                                // Check for variation_details from backend processing
                                if (item.variation_details && typeof item.variation_details === 'object') {
                                  const detailEntries = Object.entries(item.variation_details)
                                    .filter(([, value]) => value && String(value).trim())
                                  
                                  if (detailEntries.length > 0) {
                                    const details = detailEntries
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')
                                    return (
                                      <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Variant:</span> {details}
                                      </p>
                                    )
                                  }
                                }
                                
                                // Check for attributes object
                                if (item.attributes && typeof item.attributes === 'object') {
                                  if (item.attributes.variation && String(item.attributes.variation).trim()) {
                                    return (
                                      <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Variant:</span> {item.attributes.variation}
                                      </p>
                                    )
                                  }
                                  
                                  const attrEntries = Object.entries(item.attributes)
                                    .filter(([key, value]) => key !== 'variation' && value && String(value).trim())
                                  
                                  if (attrEntries.length > 0) {
                                    const attrs = attrEntries
                                      .map(([key, value]) => `${key}: ${value}`)
                                      .join(', ')
                                    return (
                                      <p className="text-xs text-gray-600 mt-1">
                                        <span className="font-medium">Options:</span> {attrs}
                                      </p>
                                    )
                                  }
                                }
                                
                                // Final fallback: show variation_id if available (for debugging)
                                if (item.variation_id && process.env.NODE_ENV === 'development') {
                                  return (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Variation ID: {item.variation_id.slice(-8)}
                                    </p>
                                  )
                                }
                                
                                // No variation data found - show "Regular" for standard products
                                return (
                                  <p className="text-xs text-gray-600 mt-1">
                                    <span className="font-medium">Variant:</span> Regular
                                  </p>
                                )
                              })()}
                            </div>
                          </div>
                          
                          {/* Quantity */}
                          <div className="col-span-2 text-center">
                            <span className="text-sm text-gray-900 font-medium">{item.quantity}</span>
                          </div>
                          
                          {/* Unit Price */}
                          <div className="col-span-2 text-center">
                            <span className="text-sm text-gray-900">{formatCurrency(parseFloat(String(item.price)) || 0)}</span>
                          </div>
                          
                          {/* Total */}
                          <div className="col-span-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatCurrency((parseFloat(String(item.price)) || 0) * (parseInt(String(item.quantity)) || 0))}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {/* <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[#FE4501] mt-1" />
                      <div>
                        {(() => {
                          // Handle both parsed JSON object and string cases
                          let shippingAddr = (order as any).shipping_address;
                          
                          if (typeof shippingAddr === 'string') {
                            try {
                              shippingAddr = JSON.parse(shippingAddr);
                            } catch (e) {
                              shippingAddr = {};
                            }
                          }
                          shippingAddr = shippingAddr || {};

                          return (
                            <>
                              <p className="text-gray-900">
                                {shippingAddr.address_line_1 || shippingAddr.address || shippingAddr.street || shippingAddr.line1 || 'Address not available'}
                              </p>
                              <p className="text-gray-700">
                                {[shippingAddr.city, shippingAddr.state, shippingAddr.postal_code || shippingAddr.zip || shippingAddr.zipCode]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                              {shippingAddr.country && (
                                <p className="text-gray-700">{shippingAddr.country}</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {(() => {
                      const financials = getOrderFinancials()
                      // Financial data from order
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="text-gray-900">{formatCurrency(financials.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Delivery:</span>
                            <span className="text-gray-900">
                              {(() => {
                                const deliveryType = order.delivery_type || 'pickup'
                                const shippingCost = financials.shipping
                                
                                // Handle both frontend ('pickup', 'delivery') and backend ('home') values
                                if (deliveryType === 'pickup') {
                                  return 'Pickup'
                                } else if (deliveryType === 'delivery' || deliveryType === 'home') {
                                  // Parse the shipping cost properly
                                  const cost = typeof shippingCost === 'string' ? parseFloat(shippingCost) : shippingCost
                                  return cost > 0 
                                    ? formatCurrency(cost)
                                    : 'Delivery (Free)'
                                }
                                return 'Pickup' // fallback
                              })()}
                            </span>
                          </div>
                          {financials.tax > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax (7.5%):</span>
                              <span className="text-gray-900">{formatCurrency(financials.tax)}</span>
                            </div>
                          )}
                          {(() => {
                            // Use the same casting approach as the rest of the function
                            const orderWithAmounts = order as Order & {
                              discount_amount?: number | string
                            }
                            const discountAmount = orderWithAmounts.discount_amount
                            const discount = typeof discountAmount === 'string' ? parseFloat(discountAmount) : (discountAmount || 0)
                            
                            return discount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
                                <span className="font-medium">-{formatCurrency(discount)}</span>
                              </div>
                            )
                          })()}
                          <hr className="border-gray-200" />
                          <div className="flex justify-between font-semibold text-lg">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-[#FE4501]">{formatCurrency(financials.total)}</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{order.notes}</p>
                    </div>
                  </div>
                )}

              </div>
              {/* Bottom Padding */}
              <div className="pb-6"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default OrderDetailsModal