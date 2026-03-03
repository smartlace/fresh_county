'use client'

import React, { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  is_featured: boolean
  view_count: number
  reading_time?: number
  published_at?: string
  category_name?: string
  category_color?: string
  created_at: string
  updated_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [blogSettings, setBlogSettings] = useState({
    blog_page_title: 'BLOG LISTS',
    blog_page_subtitle: 'Offer a range of fresh juices, smoothies, parfaits, salads, wraps, and other healthy options'
  })

  useEffect(() => {
    fetchBlogPosts()
    fetchBlogSettings()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch only published posts for frontend
      const response = await fetch('/api/blog/public/posts?limit=50')
      const data = await response.json()
      
      if (data.success && data.data) {
        setPosts(data.data)
      } else {
        setError('Failed to load blog posts')
      }
    } catch (err) {
      console.error('Error fetching blog posts:', err)
      setError('Failed to load blog posts')
    } finally {
      setLoading(false)
    }
  }

  const fetchBlogSettings = async () => {
    try {
      const response = await fetch('/api/blog/public/settings')
      const data = await response.json()
      
      if (data.success && data.data?.settings) {
        setBlogSettings(data.data.settings)
      }
    } catch (err) {
      console.error('Error fetching blog settings:', err)
      // Keep default values on error
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return '/home-bg.jpg'
    if (imagePath.startsWith('http')) return imagePath
    return `/uploads/${imagePath.replace(/^\/+/, '')}`
  }

  return (
    <MainLayout>
      <div className="bg-gray-50">
        {/* Header spacer */}
        <div className="h-4"></div>
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            {blogSettings.blog_page_title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {blogSettings.blog_page_subtitle}
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchBlogPosts}
              className="bg-[#FE4501] text-white px-6 py-3 rounded-lg hover:bg-[#FE4501]/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">No blog posts available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg border border-gray-200 overflow-hidden transition-colors duration-200"
              >
                {/* Featured Image */}
                <div className="aspect-w-16 aspect-h-10 relative h-48">
                  <Image
                    src={getImageUrl(post.featured_image)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {post.is_featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#FE4501] text-white px-3 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <time dateTime={post.published_at || post.created_at}>
                      {formatDate(post.published_at || post.created_at)}
                    </time>
                    {post.reading_time && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.reading_time} min read</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 uppercase tracking-wide">
                    {post.title}
                  </h2>

                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>

                  <Link 
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center text-[#FE4501] hover:text-[#FE4501]/80 font-medium transition-colors"
                  >
                    Read More
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      </div>
    </MainLayout>
  )
}