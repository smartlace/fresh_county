"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/shop/product-card'
import { formatPriceSimple, getImageUrl } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { API_CONFIG } from '@/lib/config'

interface ProductVariation {
  id: string
  sku: string
  price: number
  sale_price?: number
  stock_quantity: number
  stock_status: string
  is_default: boolean
  combinations: Array<{
    id: number
    name: string
    display_name: string
    color_hex?: string
    type_name: string
    type_display_name: string
  }>
}

interface RelatedProduct {
  id: string
  name: string
  slug: string
  price: string
  sale_price?: string
  featured_image: string
  stock_status: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description?: string
  price: string
  sale_price?: string
  category_id: string
  category_name: string
  category_slug: string
  featured_image: string
  images?: string[]
  stock_quantity: number
  stock_status: string
  status: string
  featured: number
  variations?: ProductVariation[]
  related_products?: RelatedProduct[]
}

export default function ProductPage() {
  const params = useParams()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null)
  const [variations, setVariations] = useState<ProductVariation[]>([])

  const productId = params.id as string

  // Fetch product data and variations
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch product
        const productResponse = await fetch(`${API_CONFIG.BASE_URL}/products/${productId}`)
        const productData = await productResponse.json()
        
        if (productData.success && productData.data) {
          setProduct(productData.data)
          
          // Fetch variations
          try {
            const variationsResponse = await fetch(`${API_CONFIG.BASE_URL}/products/${productId}/variations`)
            const variationsData = await variationsResponse.json()
            
            if (variationsData.success && variationsData.data) {
              setVariations(variationsData.data)
              // Don't auto-select a variation - let user choose between base product and variations
              // The base product is the default option (no variation selected)
              setSelectedVariation(null)
            }
          } catch (variationError) {
                        // This is not an error - product simply doesn't have variations
          }
        } else {
          setError('Product not found')
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
        setError('Failed to load product')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductData()
  }, [productId])

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading product...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Product not found'}</h2>
            <Link href="/categories">
              <Button className="bg-[#FE4501] hover:bg-[#FE4501]/90 cursor-pointer">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Get current pricing (from selected variation or base product)
  const getCurrentPrice = () => {
    if (selectedVariation) {
      return {
        price: selectedVariation.price,
        sale_price: selectedVariation.sale_price
      }
    }
    return {
      price: parseFloat(product?.price || '0'),
      sale_price: product?.sale_price ? parseFloat(product.sale_price) : undefined
    }
  }

  // Get current stock info
  const getCurrentStock = () => {
    if (selectedVariation) {
      return {
        quantity: selectedVariation.stock_quantity,
        status: selectedVariation.stock_status
      }
    }
    return {
      quantity: product?.stock_quantity || 0,
      status: product?.stock_status || 'out_of_stock'
    }
  }

  const handleAddToCart = async () => {
    if (isAdding) return // Prevent multiple clicks
    setIsAdding(true)
    
    const currentPrice = getCurrentPrice()
    const variationInfo = selectedVariation ? {
      variation_id: selectedVariation.id,
      sku: selectedVariation.sku,
      variation_name: selectedVariation.combinations.map(c => `${c.type_display_name}: ${c.display_name}`).join(', ')
    } : null

    // Create cart item matching the CartItem interface
    const cartItem = {
      id: selectedVariation ? selectedVariation.id : product!.id,
      name: product!.name + (variationInfo ? ` (${variationInfo.variation_name})` : ' (Regular)'),
      price: Number(currentPrice.sale_price || currentPrice.price),
      image: product!.featured_image || '',
      description: product!.description || product!.short_description || '',
      size: variationInfo ? variationInfo.variation_name : 'Regular',
      category: product!.category_slug || '',
      // Store the base product ID for backend order processing
      product_id: product!.id,
      variation_id: selectedVariation ? selectedVariation.id : null
    }
    
    
    
    // Add item with the specified quantity
    addItem(cartItem, quantity)
    
    // Simulate loading
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="aspect-square relative bg-gray-50 overflow-hidden rounded-lg">
            {product.featured_image ? (
              <Image
                src={getImageUrl(product.featured_image)}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-lg">No Image Available</span>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-4">
              {product.name}
            </h1>
            
            <div className="mb-6">
              {(() => {
                const currentPrice = getCurrentPrice()
                return currentPrice.sale_price ? (
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-normal text-[#FE4501]">
                      ₦{formatPriceSimple(currentPrice.sale_price)}
                    </p>
                    <p className="text-lg text-gray-500 line-through">
                      ₦{formatPriceSimple(currentPrice.price)}
                    </p>
                  </div>
                ) : (
                  <p className="text-2xl font-normal text-[#FE4501]">
                    ₦{formatPriceSimple(currentPrice.price)}
                  </p>
                )
              })()}
            </div>
            
            <p className="text-gray-600 mb-4">
              {product.description || product.short_description}
            </p>

            {/* Category */}
            <div className="mb-6">
              <span className="inline-block bg-[#ebeaea] text-gray-700 px-3 py-1 rounded-full text-sm">
                {product.category_name}
              </span>
            </div>

            {/* Variable Product Options */}
            {variations.length > 0 && (
              <div className="mb-6 space-y-4">
                <h3 className="font-medium text-gray-900 mb-3">Choose your option:</h3>
                
                {/* Base Product Option */}
                <div>
                  <div className="flex flex-wrap gap-2">
                    {/* Regular/Base Product Option */}
                    <button
                      onClick={() => setSelectedVariation(null)}
                      className={`px-4 py-1.5 h-[30px] text-xs rounded-full font-medium transition-all duration-200 flex items-center border cursor-pointer ${
                        !selectedVariation
                          ? 'bg-gray-50 text-[#FE4501] border-[#FE4501] shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#FE4501]/40 hover:text-[#FE4501]'
                      }`}
                    >
                      <span>Regular</span>
                    </button>

                    {/* Variation Options */}
                    {(() => {
                      // Display all variation options as individual buttons
                      return variations.map((variation) => {
                        const isSelected = selectedVariation?.id === variation.id
                        const variationLabel = variation.combinations.map(c => c.display_name).join(' + ')
                        
                        return (
                          <button
                            key={variation.id}
                            onClick={() => setSelectedVariation(variation)}
                            className={`px-4 py-1.5 h-[30px] text-xs rounded-full font-medium transition-all duration-200 border cursor-pointer ${
                              isSelected
                                ? 'bg-gray-50 text-[#FE4501] border-[#FE4501] shadow-sm'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-[#FE4501]/40 hover:text-[#FE4501]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {variation.combinations.some(c => c.color_hex) && (
                                <div 
                                  className="w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: variation.combinations.find(c => c.color_hex)?.color_hex }}
                                />
                              )}
                              <span>{variationLabel}</span>
                            </div>
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
                
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden p-0.5">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-12 h-10 flex items-center justify-center bg-white">
                  <span className="font-medium text-gray-900">{quantity}</span>
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-[#FE4501] text-white flex items-center justify-center hover:bg-[#FE4501]/90 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link href="/categories">
                <Button 
                  variant="outline" 
                  className="border border-[#FE4501] text-[#FE4501] hover:bg-[#FE4501] hover:text-white px-6 cursor-pointer"
                >
                  CONTINUE SHOPPING
                </Button>
              </Link>
              
              <Button
                onClick={handleAddToCart}
                disabled={(() => {
                  const currentStock = getCurrentStock()
                  return isAdding || currentStock.status !== 'in_stock' || currentStock.quantity <= 0
                })()}
                className="bg-[#FE4501] hover:bg-[#FE4501]/90 text-white px-8 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {(() => {
                  if (isAdding) return 'ADDING...'
                  const currentStock = getCurrentStock()
                  return currentStock.status !== 'in_stock' || currentStock.quantity <= 0 ? 'OUT OF STOCK' : 'ADD TO CART'
                })()}
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product.related_products && product.related_products.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">YOU MAY ALSO LIKE</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {product.related_products.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={{
                    id: relatedProduct.id,
                    name: relatedProduct.name,
                    price: parseFloat(relatedProduct.sale_price || relatedProduct.price),
                    image: relatedProduct.featured_image,
                    description: product.category_name, // Use category as description for related products
                    category: product.category_slug,
                    sizes: ['Regular'] // Default size for related products
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}