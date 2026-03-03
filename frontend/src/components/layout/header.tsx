"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, ShoppingCart, Menu, X, ChevronDown, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { logError } from '@/lib/logger'

interface HeaderProps {
  cartItemsCount?: number
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

export function Header({ cartItemsCount = 0 }: HeaderProps) {
  const { isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    await logout()
  }

  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded)
    // Close mobile menu when opening search
    if (!isSearchExpanded) {
      setIsMenuOpen(false)
      setIsCategoriesOpen(false)
      // Focus the input when opening search
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      // Clear search query when closing
      setSearchQuery('')
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to categories page with search query
      window.location.href = `/categories?search=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const handleSearchClose = () => {
    setIsSearchExpanded(false)
    setSearchQuery('')
  }

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        const data = await response.json()
        
        if (data.success && data.data?.categories) {
          const activeCategories = data.data.categories
            .filter((cat: Category) => cat.is_active)
          setCategories(activeCategories)
        }
      } catch (error) {
        logError('Failed to fetch categories', error, {
          component: 'header',
          action: 'fetch_categories'
        })
      } finally {
        setIsCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setIsCategoriesOpen(false)
    setIsSearchExpanded(false)
  }, [pathname])

  // Handle escape key to close search
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchExpanded) {
        handleSearchClose()
      }
    }

    if (isSearchExpanded) {
      document.addEventListener('keydown', handleEscapeKey)
      return () => {
        document.removeEventListener('keydown', handleEscapeKey)
      }
    }
  }, [isSearchExpanded])

  const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'CATEGORIES', href: '/categories', hasDropdown: true },
    { name: 'CATERING', href: '/catering' },
    { name: 'ABOUT US', href: '/about' },
    { name: 'FIDELITY', href: '/fidelity' },
    { name: 'MaaS', href: '/maas' },
    { name: 'DETOX PROGRAM', href: '/detox' },
    { name: 'BLOG', href: '/blog' },
  ]

  // Function to check if a navigation item is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }


  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link 
            href="/" 
            className="flex items-center"
            aria-label="Fresh County - Go to homepage"
          >
            <Image
              src="/logo.png"
              alt="Fresh County Logo - Premium organic food delivery"
              width={90}
              height={90}
              className="w-[65px] h-[65px] md:w-[90px] md:h-[90px] object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav id="navigation" className={`items-center space-x-8 ${isSearchExpanded ? 'hidden' : 'hidden md:flex'}`} role="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <div key={item.name} className="relative" ref={item.hasDropdown ? dropdownRef : null}>
              {item.hasDropdown ? (
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className={`flex items-center text-sm text-gray-700 hover:text-[#FE4501] font-medium transition-colors duration-200 cursor-pointer ${
                    isActiveLink(item.href) 
                      ? 'text-[#FE4501] border-b-2 border-[#FE4501] pb-1' 
                      : ''
                  }`}
                  aria-expanded={isCategoriesOpen}
                  aria-haspopup="true"
                  aria-label={`${item.name} menu`}
                >
                  {item.name}
                  <ChevronDown 
                    className={`ml-1 w-4 h-4 transition-transform duration-200 cursor-pointer ${
                      isCategoriesOpen ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center text-sm text-gray-700 hover:text-[#FE4501] font-medium transition-colors duration-200 ${
                    isActiveLink(item.href) 
                      ? 'text-[#FE4501] border-b-2 border-[#FE4501] pb-1' 
                      : ''
                  }`}
                >
                  {item.name}
                </Link>
              )}

              {/* Categories Dropdown */}
              {item.hasDropdown && isCategoriesOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-[400px] bg-white shadow-xl border border-gray-200 z-50"
                  role="menu"
                  aria-labelledby={`${item.name}-menu-button`}
                >
                  {/* Categories List */}
                  <div className="p-6">
                    <div className="space-y-1" role="none">
                      {/* All Products Link */}
                      <a
                        href="/categories"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE4501] rounded-md transition-colors duration-200 font-medium"
                        role="menuitem"
                        aria-label="View all products"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = '/categories'
                        }}
                      >
                        All Products
                      </a>

                      {/* Loading state */}
                      {isCategoriesLoading ? (
                        <div className="flex items-center justify-center py-8" role="status" aria-label="Loading categories">
                          <div className="animate-spin h-5 w-5 border-2 border-[#FE4501] border-t-transparent rounded-full" aria-hidden="true"></div>
                          <span className="sr-only">Loading categories...</span>
                        </div>
                      ) : (
                        /* Dynamic Categories */
                        categories.map((category) => (
                          <a
                            key={category.id}
                            href={`/categories?category=${category.slug}`}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE4501] rounded-md transition-colors duration-200"
                            role="menuitem"
                            aria-label={`View ${category.name} products`}
                            onClick={(e) => {
                              e.preventDefault()
                              window.location.href = `/categories?category=${category.slug}`
                            }}
                          >
                            {category.name}
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Desktop Right side actions */}
        <div className={`items-center space-x-4 ${isSearchExpanded ? 'hidden' : 'hidden md:flex'}`}>
          {/* Search Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:text-[#FE4501] cursor-pointer"
            aria-label="Search products"
            onClick={handleSearchToggle}
          >
            <Search className="w-5 h-5 cursor-pointer" aria-hidden="true" />
          </Button>

          {/* Cart */}
          <Link href="/cart" aria-label={`Shopping cart - ${cartItemsCount} items`}>
            <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-[#FE4501] cursor-pointer">
              <ShoppingCart className="w-5 h-5 cursor-pointer" aria-hidden="true" />
              {cartItemsCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-[#FE4501] text-white text-xs rounded-full w-5 h-5 p-0 flex items-center justify-center"
                  aria-label={`${cartItemsCount} items in cart`}
                >
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Profile Icon */}
          <Link href="/profile" aria-label="My profile">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#FE4501] cursor-pointer">
              <User className="w-5 h-5 cursor-pointer" aria-hidden="true" />
            </Button>
          </Link>

          {/* Authentication Button */}
          {!isAuthenticated ? (
            <Button 
              asChild
              className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              <Link href="/auth/signin">SIGN IN/JOIN</Link>
            </Button>
          ) : (
            <Button 
              onClick={handleLogout}
              className="bg-[#FE4501] hover:bg-[#E63E01] text-white font-bold px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
            >
              LOGOUT
            </Button>
          )}
        </div>

        {/* Expanded Search Overlay - Desktop */}
        {isSearchExpanded && (
          <div className="hidden md:flex items-center flex-1 mx-8">
            <div className="w-full">
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <div className="flex-1 relative mr-6">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 px-6 text-base border border-gray-300 bg-gray-50 rounded-full focus:ring-0 focus:border-[#FE4501] focus:outline-none focus:bg-white"
                    aria-label="Search products"
                  />
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search Submit Button */}
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-[#FE4501] hover:bg-white rounded-full cursor-pointer transition-all duration-200"
                    aria-label="Submit search"
                  >
                    <Search className="w-5 h-5 cursor-pointer" aria-hidden="true" />
                  </Button>
                  
                  {/* Close Search Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-[#FE4501] hover:bg-white rounded-full cursor-pointer transition-all duration-200"
                    onClick={handleSearchClose}
                    aria-label="Close search"
                  >
                    <X className="w-5 h-5 cursor-pointer" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Mobile Action Buttons */}
        <div className="flex items-center md:hidden">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-[#FE4501] cursor-pointer"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen)
              setIsSearchExpanded(false)
            }}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X className="w-6 h-6 cursor-pointer" aria-hidden="true" /> : <Menu className="w-6 h-6 cursor-pointer" aria-hidden="true" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div 
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 animate-in slide-in-from-top-2 duration-200"
            id="mobile-menu"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
              <div className="px-4 py-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* Mobile Search */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-0 focus:border-[#FE4501] focus:outline-none"
                    aria-label="Search products"
                  />
                </form>
                
                {/* Mobile Navigation Links */}
                <nav className="space-y-2">
                  {navigation.map((item) => (
                    <div key={item.name}>
                      {item.hasDropdown ? (
                        <div>
                          <button
                            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                            className={`w-full flex items-center justify-between text-gray-700 hover:text-[#FE4501] active:text-[#FE4501] font-medium py-3 px-2 rounded-lg transition-colors duration-200 cursor-pointer touch-manipulation ${
                              isActiveLink(item.href)
                                ? 'text-[#FE4501] bg-[#FE4501]/10'
                                : 'hover:bg-gray-50 active:bg-[#FE4501]/10'
                            }`}
                            style={{ minHeight: '48px' }}
                            aria-expanded={isCategoriesOpen}
                            aria-label="Categories menu"
                          >
                            <span className="text-base">{item.name}</span>
                            <ChevronDown className={`w-5 h-5 transition-transform duration-200 cursor-pointer ${
                              isCategoriesOpen ? 'rotate-180' : ''
                            }`} />
                          </button>

                          {/* Mobile Categories Dropdown */}
                          {isCategoriesOpen && (
                            <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-100 pl-4 animate-in slide-in-from-top-2 duration-200">
                              <div
                                role="button"
                                tabIndex={0}
                                className="block text-sm sm:text-base text-gray-600 hover:text-[#FE4501] active:text-[#FE4501] py-3 transition-colors duration-200 touch-manipulation cursor-pointer"
                                style={{ minHeight: '44px' }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  window.location.href = '/categories'
                                }}
                                onTouchEnd={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  window.location.href = '/categories'
                                }}
                              >
                                All Products
                              </div>

                              {isCategoriesLoading ? (
                                <div className="flex items-center py-3">
                                  <div className="animate-spin h-4 w-4 border-2 border-[#FE4501] border-t-transparent rounded-full"></div>
                                  <span className="ml-2 text-sm text-gray-500">Loading...</span>
                                </div>
                              ) : (
                                categories.map((category) => (
                                  <div
                                    key={category.id}
                                    role="button"
                                    tabIndex={0}
                                    className="block text-sm sm:text-base text-gray-600 hover:text-[#FE4501] active:text-[#FE4501] py-3 transition-colors duration-200 touch-manipulation cursor-pointer"
                                    style={{ minHeight: '44px' }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      window.location.href = `/categories?category=${category.slug}`
                                    }}
                                    onTouchEnd={(e) => {
                                      e.stopPropagation()
                                      e.preventDefault()
                                      window.location.href = `/categories?category=${category.slug}`
                                    }}
                                  >
                                    {category.name}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={`block text-base text-gray-700 hover:text-[#FE4501] active:text-[#FE4501] font-medium py-3 px-2 rounded-lg transition-colors duration-200 touch-manipulation ${
                            isActiveLink(item.href)
                              ? 'text-[#FE4501] bg-[#FE4501]/10'
                              : 'hover:bg-gray-50 active:bg-[#FE4501]/10'
                          }`}
                          style={{ minHeight: '48px' }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>

                {/* Mobile Action Buttons */}
                <div className="border-t border-gray-200 pt-6 space-y-3">
                  {/* Cart Link */}
                  <Link
                    href="/cart"
                    className="flex items-center justify-between w-full text-base text-gray-700 hover:text-[#FE4501] active:text-[#FE4501] font-medium py-3 px-2 rounded-lg hover:bg-gray-50 active:bg-[#FE4501]/10 transition-colors duration-200 cursor-pointer touch-manipulation"
                    style={{ minHeight: '48px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-3 cursor-pointer" />
                      <span>Shopping Cart</span>
                    </div>
                    {cartItemsCount > 0 && (
                      <Badge className="bg-[#FE4501] text-white text-xs rounded-full w-5 h-5 p-0 flex items-center justify-center">
                        {cartItemsCount}
                      </Badge>
                    )}
                  </Link>

                  {/* Profile Link */}
                  <Link
                    href="/profile"
                    className="flex items-center w-full text-base text-gray-700 hover:text-[#FE4501] active:text-[#FE4501] font-medium py-3 px-2 rounded-lg hover:bg-gray-50 active:bg-[#FE4501]/10 transition-colors duration-200 cursor-pointer touch-manipulation"
                    style={{ minHeight: '48px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3 cursor-pointer" />
                    <span>My Profile</span>
                  </Link>

                  {/* Authentication Button */}
                  {!isAuthenticated ? (
                    <Link
                      href="/auth/signin"
                      className="block w-full bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601] text-white text-center text-base font-bold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer touch-manipulation"
                      style={{ minHeight: '52px' }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      SIGN IN/JOIN
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-[#FE4501] hover:bg-[#E63E01] active:bg-[#D63601] text-white text-base font-bold py-3 px-6 rounded-lg transition-colors duration-200 cursor-pointer touch-manipulation"
                      style={{ minHeight: '52px' }}
                    >
                      LOGOUT
                    </button>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
    </header>
  )
}