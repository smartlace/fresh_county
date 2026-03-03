"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPriceSimple, getImageUrl } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    description: string
    category: string
    sizes: string[]
  }
}

export function ProductCard({ 
  product
}: ProductCardProps) {

  // Truncate description to 35 characters with ellipsis
  const truncateDescription = (description: string, maxLength: number = 40) => {
    if (description.length <= maxLength) {
      return description
    }
    return description.substring(0, maxLength) + '...'
  }

  return (
    <div className="group relative rounded-lg overflow-hidden">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative bg-gray-50 overflow-hidden rounded-lg">
          {product.image ? (
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="py-4">
        <div className="flex items-center justify-between">
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-gray-900 text-base uppercase tracking-wide hover:text-[#FE4501] transition-colors">
              {product.name}
            </h3>
          </Link>
          <span className="text-base font-normal text-[#FE4501]">
            ₦{formatPriceSimple(product.price)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {truncateDescription(product.description)}
        </p>
      </div>
    </div>
  )
}