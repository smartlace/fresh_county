"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartNotification } from '@/components/cart/cart-notification'
import { apiService } from '@/lib/api'
import { ShoppingStateManager } from '@/lib/storage'
import type { CartItem, DiscountInfo } from '@/lib/storage'
import type { 
  ShippingZone, 
  CouponValidationResponse, 
  CartTotalsResponse
} from '@/lib/types'

export interface DeliveryInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  mobileNumber: string
  email: string
  saveInfo: boolean
}


export interface DiscountState {
  appliedDiscount: DiscountInfo | null
  isValidating: boolean
  error: string | null
}

export interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  subtotal: number
  delivery: string
  deliveryCost: number
  taxAmount: number
  taxRate: number
  shippingZones: ShippingZone[]
  selectedShippingZone: ShippingZone | null
  loadingShippingZones: boolean
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string, size: string) => void
  updateQuantity: (id: string, size: string, quantity: number) => void
  clearCart: () => void
  clearAllCartData: () => void
  setDelivery: (type: 'pickup' | 'home') => void
  setSelectedShippingZone: (zone: ShippingZone | null) => void
  loadShippingZones: () => Promise<void>
  // Discount functionality
  discountState: DiscountState
  applyDiscount: (code: string, userId: string) => Promise<{ success: boolean; message?: string }>
  removeDiscount: () => void
  // Notification state
  notificationItem: CartItem | null
  isNotificationVisible: boolean
  showNotification: (item: CartItem) => void
  hideNotification: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [delivery, setDeliveryType] = useState<string>('pickup')
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
  const [selectedShippingZone, setSelectedShippingZoneState] = useState<ShippingZone | null>(null)
  const [loadingShippingZones, setLoadingShippingZones] = useState(false)
  const [notificationItem, setNotificationItem] = useState<CartItem | null>(null)
  const [isNotificationVisible, setIsNotificationVisible] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [backendTotals, setBackendTotals] = useState<{
    subtotal: number
    tax_amount: number
    tax_rate: number
    shipping_cost: number
    total_amount: number
  } | null>(null)
  const [discountState, setDiscountState] = useState<DiscountState>({
    appliedDiscount: null,
    isValidating: false,
    error: null
  })

  // Load shipping zones from API
  const loadShippingZones = async () => {
    setLoadingShippingZones(true)
    try {
      const response = await apiService.get('/shipping-zones')
      if (response.success && response.data && Array.isArray((response.data as { zones?: ShippingZone[] }).zones)) {
        // Ensure price is a number
        const processedZones = (response.data as { zones: ShippingZone[] }).zones.map((zone: ShippingZone) => ({
          ...zone,
          price: typeof zone.price === 'string' ? parseFloat(zone.price) : zone.price
        }))
        setShippingZones(processedZones)
      } else {
        console.error('Failed to load shipping zones:', response.message)
      }
    } catch (error) {
      console.error('Error loading shipping zones:', error)
    } finally {
      setLoadingShippingZones(false)
    }
  }

  // Load cart from localStorage on mount using standardized storage
  useEffect(() => {
    const savedItems = ShoppingStateManager.getCartItems()
    const savedDelivery = ShoppingStateManager.getDeliveryType()
    const savedDiscount = ShoppingStateManager.getAppliedDiscount()
    
    setItems(savedItems)
    setDeliveryType(savedDelivery)
    setHasInitialized(true)
    
    if (savedDiscount) {
      setDiscountState({
        appliedDiscount: savedDiscount,
        isValidating: false,
        error: null
      })
    }

    // Load shipping zones on mount
    loadShippingZones()
  }, [])

  // Save cart to localStorage whenever items change (but not on initial load)
  useEffect(() => {
    // Only save if we've initialized (prevents saving empty array on mount)
    if (hasInitialized) {
      ShoppingStateManager.saveCartItems(items)
    }
  }, [items, hasInitialized])

  // Save delivery type to localStorage
  useEffect(() => {
    if (hasInitialized) {
      ShoppingStateManager.saveDeliveryType(delivery)
    }
  }, [delivery, hasInitialized])

  // Fetch cart totals from backend when items change
  useEffect(() => {
    const fetchCartTotals = async () => {
      if (items.length === 0) {
        setBackendTotals(null)
        return
      }

      try {
        // Call backend API for real-time calculations using database settings
        const response = await apiService.post('/cart/calculate-totals', {
          items: items.map(item => ({
            price: item.price,
            quantity: item.quantity
          }))
        })

        if (response.success && response.data) {
          const responseData = response.data as CartTotalsResponse
          const { totals } = responseData
          
          // Adjust shipping cost based on delivery type and selected shipping zone
          let finalShippingCost = 0
          if (delivery === 'home' && selectedShippingZone) {
            finalShippingCost = Number(selectedShippingZone.price)
          }
          

          setBackendTotals({
            subtotal: totals.subtotal,
            tax_amount: totals.tax_amount,
            tax_rate: totals.tax_rate,
            shipping_cost: finalShippingCost,
            total_amount: totals.subtotal + totals.tax_amount + finalShippingCost
          })
        } else {
          console.error('Failed to calculate cart totals:', response.message)
        }
      } catch (error) {
        console.error('Failed to calculate cart totals:', error)
        
        // Fallback to basic calculation if API fails
        const localSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        const fallbackShippingCost = delivery === 'home' && selectedShippingZone ? selectedShippingZone.price : 0
        
        
        setBackendTotals({
          subtotal: localSubtotal,
          tax_amount: 0,
          tax_rate: 0,
          shipping_cost: fallbackShippingCost,
          total_amount: localSubtotal + fallbackShippingCost
        })
      }
    }

    fetchCartTotals()
  }, [items, delivery, selectedShippingZone])

  // Listen for logout event to clear cart data
  useEffect(() => {
    const handleLogout = () => {
      clearAllCartData()
    }

    window.addEventListener('userLogout', handleLogout)
    
    return () => {
      window.removeEventListener('userLogout', handleLogout)
    }
  }, [])

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantityToAdd: number = 1) => {
    setItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(
        item => item.id === newItem.id && item.size === newItem.size
      )

      if (existingItemIndex >= 0) {
        // Item already exists, increase quantity by specified amount
        const updatedItems = [...currentItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
        }
        // Show notification with updated item
        showNotification({ ...updatedItems[existingItemIndex] })
        return updatedItems
      } else {
        // New item, add to cart with specified quantity
        const cartItem = { ...newItem, quantity: quantityToAdd }
        showNotification(cartItem)
        return [...currentItems, cartItem]
      }
    })
  }

  const removeItem = (id: string, size: string) => {
    setItems(currentItems =>
      currentItems.filter(item => !(item.id === id && item.size === size))
    )
  }

  const updateQuantity = (id: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id, size)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id && item.size === size
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  // Clear cart and discount when user logs out
  const clearAllCartData = () => {
    setItems([])
    setDeliveryType('pickup')
    setDiscountState({
      appliedDiscount: null,
      isValidating: false,
      error: null
    })
    // Clear localStorage using standardized storage
    ShoppingStateManager.clearAll()
    // Keep hasInitialized true so future saves work properly
  }

  const setDelivery = (type: 'pickup' | 'home') => {
    setDeliveryType(type)
    // Clear shipping zone selection if switching to pickup
    if (type === 'pickup') {
      setSelectedShippingZoneState(null)
    }
  }

  const setSelectedShippingZone = (zone: ShippingZone | null) => {
    setSelectedShippingZoneState(zone)
    // If selecting a shipping zone, automatically set delivery to home
    if (zone && delivery === 'pickup') {
      setDeliveryType('home')
    }
  }

  // Notification functions
  const showNotification = (item: CartItem) => {
    setNotificationItem(item)
    setIsNotificationVisible(true)
    
    // Auto-hide notification after 8 seconds
    setTimeout(() => {
      hideNotification()
    }, 8000)
  }

  const hideNotification = () => {
    setIsNotificationVisible(false)
    setTimeout(() => {
      setNotificationItem(null)
    }, 300) // Wait for exit animation
  }

  // Apply discount to subtotal
  const applyDiscount = async (code: string, userId: string): Promise<{ success: boolean; message?: string }> => {
    if (!code.trim()) {
      return { success: false, message: 'Please enter a discount code' }
    }

    setDiscountState(prev => ({ ...prev, isValidating: true, error: null }))

    try {
      const response = await apiService.post('/coupon/validate', {
        code: code.trim().toUpperCase(),
        order_amount: subtotal,
        user_id: userId
      })

      if (response.success && response.data) {
        const validationData = response.data as CouponValidationResponse
        const discountInfo: DiscountInfo = {
          code: validationData.coupon.code,
          name: validationData.coupon.name,
          type: validationData.coupon.type,
          discount_value: validationData.coupon.discount_value,
          discount_amount: validationData.discount_amount
        }

        setDiscountState({
          appliedDiscount: discountInfo,
          isValidating: false,
          error: null
        })

        // Save discount to localStorage using standardized storage
        ShoppingStateManager.saveAppliedDiscount(discountInfo)

        return { 
          success: true, 
          message: `Discount code applied! You saved ₦${discountInfo.discount_amount.toLocaleString()}` 
        }
      } else {
        const errorMessage = response.message || 'Invalid discount code'
        setDiscountState(prev => ({ 
          ...prev, 
          isValidating: false, 
          error: errorMessage 
        }))
        return { success: false, message: errorMessage }
      }
    } catch (error: unknown) {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to apply discount code'
      setDiscountState(prev => ({ 
        ...prev, 
        isValidating: false, 
        error: errorMessage 
      }))
      return { success: false, message: errorMessage }
    }
  }

  const removeDiscount = () => {
    setDiscountState({
      appliedDiscount: null,
      isValidating: false,
      error: null
    })
    ShoppingStateManager.clearAppliedDiscount()
  }

  // Calculate totals using backend calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = backendTotals?.subtotal || 0
  const taxAmount = backendTotals?.tax_amount || 0
  const taxRate = backendTotals?.tax_rate || 0
  const deliveryCost = backendTotals?.shipping_cost || 0
  
  // Apply discount to subtotal
  const discountAmount = discountState.appliedDiscount?.discount_amount || 0
  const discountedSubtotal = Math.max(0, subtotal - discountAmount)
  
  // Total includes tax and shipping
  const total = discountedSubtotal + taxAmount + deliveryCost
  

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      subtotal,
      delivery,
      deliveryCost,
      taxAmount,
      taxRate,
      shippingZones,
      selectedShippingZone,
      loadingShippingZones,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      clearAllCartData,
      setDelivery,
      setSelectedShippingZone,
      loadShippingZones,
      discountState,
      applyDiscount,
      removeDiscount,
      notificationItem,
      isNotificationVisible,
      showNotification,
      hideNotification
    }}>
      {children}
      <CartNotification 
        isVisible={isNotificationVisible}
        item={notificationItem}
        onClose={hideNotification}
      />
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}