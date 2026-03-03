import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  is_active: boolean
  product_count: number
}

export function Footer() {
  const [categories, setCategories] = useState<Category[]>([])

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories')
        const data = await response.json()
        
        if (data.success && data.data?.categories) {
          const activeCategories = data.data.categories
            .filter((cat: Category) => cat.is_active)
            .slice(0, 6) // Limit to 6 categories
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Failed to fetch categories for footer:', error)
      }
    }

    fetchCategories()
  }, [])

  const links = [
    { name: 'About Us', href: '/about' },
    { name: 'Catering', href: '/catering' },
    { name: 'Fidelity', href: '/fidelity' },
    { name: 'MaaS', href: '/maas' },
    { name: 'Detox Program', href: '/detox' },
    { name: 'Blog', href: '/blog' },
  ]

  const help = [
    { name: 'FAQs', href: '/faq' },
    { name: '+234-8090967748', href: 'tel:+2348090967748' },
    { name: 'info@freshcounty.com', href: 'mailto:info@freshcounty.com' },
  ]

  const legal = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Cancellation Policy', href: '/cancellation-policy' },
  ]

  return (
    <footer className="bg-[#f5f5f5] border-t border-gray-200">
      <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <Image
                src="/logo.png"
                alt="FreshCounty Logo"
                width={90}
                height={90}
                className="w-[90px] h-[90px] object-contain"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              CATEGORIES
            </h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories?category=${category.slug}`}
                    className="text-sm text-gray-600 hover:text-[#FE4501] transition-colors duration-200"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              LINKS
            </h3>
            <ul className="space-y-2">
              {links.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-[#FE4501] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              HELP
            </h3>
            <ul className="space-y-2">
              {help.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-[#FE4501] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              LEGAL
            </h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-gray-600 hover:text-[#FE4501] transition-colors duration-200"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © FreshCounty {new Date().getFullYear()}. All Rights Reserved. Built by{' '}
              <a 
                href="mailto:erhunabbe@gmail.com" 
                className="hover:text-[#FE4501] transition-colors duration-200"
              >
                Orion Media
              </a>
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <p className="text-sm text-gray-500">
                Connect with us
              </p>
              <div className="flex space-x-3">
                <Link href="#" className="text-gray-400 hover:text-[#FE4501] transition-colors duration-200">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#FE4501] transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#FE4501] transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-[#FE4501] transition-colors duration-200">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}