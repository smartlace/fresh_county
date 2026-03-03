'use client'

import { useState, useEffect } from 'react'

interface WebsitePage {
  id: string
  title: string
  slug: string
  page_type: string
  content: string
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  template: string
  updated_at: string
}

interface UseWebsitePageResult {
  page: WebsitePage | null
  loading: boolean
  error: string | null
}

export function useWebsitePage(identifier: string): UseWebsitePageResult {
  const [page, setPage] = useState<WebsitePage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/website-pages/public/${identifier}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setPage(data.data)
        } else {
          setError(data.message || 'Page not found')
        }
      } catch (err) {
        console.error('Error fetching website page:', err)
        setError('Failed to load page content')
      } finally {
        setLoading(false)
      }
    }

    if (identifier) {
      fetchPage()
    }
  }, [identifier])

  return { page, loading, error }
}