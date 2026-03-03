"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  is_active: boolean
  product_count: number
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        const data = await response.json()
        
        if (data.success && data.data?.categories) {
          // Filter only active categories and limit to first 6 for display
          const activeCategories = data.data.categories
            .filter((cat: Category) => cat.is_active)
            .slice(0, 6)
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              EXPLORE CATEGORIES
            </h2>
          </div>
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full"></div>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            EXPLORE CATEGORIES
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories?category=${category.slug}`}
              className="group text-center"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
                <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <Image 
                      src={getImageUrl(category.image)} 
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FE4501]/20 to-[#FE4501]/40 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#FE4501]">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#FE4501] transition-colors uppercase tracking-wide leading-tight text-center">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}