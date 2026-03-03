"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductCard } from '@/components/shop/product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
}

interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  is_active: boolean
  product_count: number
}

function CategoriesPageContent() {
  const searchParams = useSearchParams()
  
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [productsPerPage] = useState(9)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreProducts, setHasMoreProducts] = useState(true)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get initial category from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    setActiveCategory(categoryParam || 'all')
  }, [searchParams])

  // Fetch products function  
  const fetchProducts = React.useCallback(async (page: number, isLoadMore: boolean = false) => {
    if (isLoadMore) setIsLoadingMore(true)
    
    try {
      const productsUrl = activeCategory === 'all' 
        ? `/api/products?page=${page}&limit=${productsPerPage}`
        : `/api/products?category_slug=${activeCategory}&page=${page}&limit=${productsPerPage}`
      
      const productsResponse = await fetch(productsUrl)
      const productsData = await productsResponse.json()
      
      if (productsData.success && productsData.data?.items) {
        const activeProducts = productsData.data.items
          .filter((product: Product) => product.status === 'active')
        
        if (isLoadMore) {
          setProducts(prev => [...prev, ...activeProducts])
        } else {
          setProducts(activeProducts)
        }
        
        // Check if there are more products
        const totalPages = productsData.data.pagination?.total_pages || 1
        setHasMoreProducts(page < totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      if (isLoadMore) setIsLoadingMore(false)
    }
  }, [activeCategory, productsPerPage])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch('/api/products/categories')
        const categoriesData = await categoriesResponse.json()
        
        if (categoriesData.success && categoriesData.data?.categories) {
          const activeCategories = categoriesData.data.categories
            .filter((cat: Category) => cat.is_active)
          setCategories([
            { id: 'all', name: 'All', slug: 'all', image: '', is_active: true, product_count: 0 },
            ...activeCategories
          ])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch products when category changes (including initial load)
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setCurrentPage(1)
      setHasMoreProducts(true)
      await fetchProducts(1, false)
      setIsLoading(false)
    }

    // Load products once activeCategory is set (either from URL or default)
    if (activeCategory !== '') {
      loadProducts()
    }
  }, [activeCategory, fetchProducts])


  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug)
    // Update URL without page reload
    const newUrl = categorySlug === 'all' ? '/categories' : `/categories?category=${categorySlug}`
    window.history.pushState({}, '', newUrl)
  }

  const handleShowMore = async () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await fetchProducts(nextPage, true)
  }


  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">CATEGORIES</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title with Chevron Controls */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CATEGORIES</h1>
          
          {/* Chevron Controls */}
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={scrollRight}
              className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Category Tabs - Horizontal Scroll */}
        <div className="mb-12">

          {/* Scrollable Categories */}
          <div className="overflow-hidden">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
            >
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`flex-shrink-0 px-6 py-3 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap cursor-pointer ${
                    activeCategory === category.slug
                      ? 'bg-[#FE4501] text-white shadow-lg'
                      : 'bg-[#ebeaea] text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description || product.short_description || '',
                price: parseFloat(product.sale_price || product.price),
                image: product.featured_image,
                category: product.category_slug,
                sizes: ['Regular', 'Large'] // Default sizes - could be made dynamic
              }}
            />
          ))}
        </div>

        {/* Show More Button */}
        {hasMoreProducts && !isLoading && (
          <div className="flex justify-center mt-12 mb-8">
            <button
              onClick={handleShowMore}
              disabled={isLoadingMore}
              className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-8 py-3 rounded-[50px] transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoadingMore ? 'LOADING...' : 'SHOW MORE PRODUCTS'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              No products found in this category.
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">CATEGORIES</h1>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-[#FE4501] border-t-transparent rounded-full"></div>
          </div>
        </div>
      </MainLayout>
    }>
      <CategoriesPageContent />
    </Suspense>
  )
}