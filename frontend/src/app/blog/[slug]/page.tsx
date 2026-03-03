'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { processAndSanitizeContent } from '@/lib/sanitize'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  status: 'draft' | 'published' | 'scheduled' | 'archived'
  is_featured: boolean
  view_count: number
  reading_time?: number
  published_at?: string
  category_name?: string
  category_color?: string
  tags?: string
  created_at: string
  updated_at: string
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogPost = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/blog/public/posts/slug/${slug}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setPost(data.data)
        // Increment view count
        incrementViewCount(data.data.id)
      } else {
        setError(data.message || 'Blog post not found')
      }
    } catch (err) {
      console.error('Error fetching blog post:', err)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (slug) {
      fetchBlogPost()
    }
  }, [slug, fetchBlogPost])

  const incrementViewCount = async (postId: string) => {
    try {
      await fetch(`/api/blog/public/posts/${postId}/view`, {
        method: 'POST'
      })
    } catch (err) {
      console.error('Failed to increment view count:', err)
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

  // SECURITY: Content processing now handled by secure sanitization utility
  // This prevents XSS attacks by using DOMPurify to sanitize HTML content

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="h-4"></div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-[#FE4501] border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="h-4"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-[#FE4501] hover:bg-[#FE4501]/90 transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Header spacer */}
      <div className="h-4"></div>
      
      {/* Blog Post Content */}
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Article Header */}
        <header className="mb-8">
          {post.is_featured === true && (
            <div className="mb-4">
              <span className="bg-[#FE4501] text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
            {post.title}
          </h1>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <time dateTime={post.published_at || post.created_at}>
              {formatDate(post.published_at || post.created_at)}
            </time>
            {post.reading_time && (
              <>
                <span>•</span>
                <span>{post.reading_time} min read</span>
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <div className="aspect-w-16 aspect-h-9 relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src={getImageUrl(post.featured_image)}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <div>
          {/* Excerpt */}
          {post.excerpt && (
            <div className="text-xl text-gray-600 font-medium leading-relaxed mb-8 border-l-4 border-[#FE4501] pl-6 italic">
              {post.excerpt}
            </div>
          )}

          {/* Main Content */}
          <div 
            className="
              [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:uppercase [&_h1]:tracking-wide [&_h1]:mb-6 [&_h1]:mt-8
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mb-4 [&_h2]:mt-8
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:mb-3 [&_h3]:mt-6
              [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-gray-900 [&_h4]:mb-3 [&_h4]:mt-4
              [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-base
              [&_ul]:text-gray-700 [&_ul]:mb-4 [&_ul]:ml-6 [&_ul]:space-y-2 [&_ul]:list-disc
              [&_ol]:text-gray-700 [&_ol]:mb-4 [&_ol]:ml-6 [&_ol]:space-y-2 [&_ol]:list-decimal
              [&_li]:text-gray-700 [&_li]:leading-relaxed
              [&_strong]:text-gray-900 [&_strong]:font-semibold
              [&_em]:text-gray-800 [&_em]:italic
              [&_blockquote]:border-l-4 [&_blockquote]:border-[#FE4501] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
            "
            dangerouslySetInnerHTML={{ __html: processAndSanitizeContent(post.content) }}
          />
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.split(',').map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

      </article>

      {/* Footer */}
      <Footer />
    </div>
  )
}