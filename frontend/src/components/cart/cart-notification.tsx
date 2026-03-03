"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Check } from 'lucide-react'
import { CartItem } from '@/lib/storage'
import { getImageUrl } from '@/lib/utils'

interface CartNotificationProps {
  isVisible: boolean
  item: CartItem | null
  onClose: () => void
}

export function CartNotification({ isVisible, item, onClose }: CartNotificationProps) {
  if (!isVisible || !item) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-80 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Item Added to Cart</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-lg uppercase tracking-wide">
            {item.name}
          </h4>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Link href="/cart" onClick={onClose}>
          <Button 
            variant="outline" 
            className="w-full border border-[#FE4501] text-[#FE4501] hover:bg-[#FE4501] hover:text-white font-semibold mb-[20px]"
          >
            VIEW CART
          </Button>
        </Link>
        
        <Link href="/checkout" onClick={onClose}>
          <Button className="w-full bg-[#FE4501] hover:bg-[#FE4501]/90 text-white font-semibold">
            CHECKOUT
          </Button>
        </Link>
        
        <button 
          onClick={onClose}
          className="w-full text-gray-600 hover:text-gray-900 font-medium text-sm underline decoration-2 underline-offset-4 py-2"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}