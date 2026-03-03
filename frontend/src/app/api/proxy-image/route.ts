import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config'

/**
 * Simple image proxy for development
 * In production, this should be handled by the backend or CDN
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 })
  }

  try {
    // Handle relative URLs
    let fullImageUrl = imageUrl
    if (imageUrl.startsWith('/uploads/')) {
      fullImageUrl = `${API_CONFIG.BACKEND_URL}${imageUrl}`
    }

    // Fetch the image
    const response = await fetch(fullImageUrl)
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse('Error loading image', { status: 500 })
  }
}