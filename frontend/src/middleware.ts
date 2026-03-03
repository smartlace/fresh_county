import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logInfo, logError } from '@/lib/logger'
import { getApiUrl } from '@/lib/config'

async function isUnderConstructionMode(): Promise<boolean> {
  try {
    const apiUrl = getApiUrl('settings/public/under-construction')
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this request
    })

    logInfo('Under construction check response', { 
      component: 'middleware',
      metadata: { status: response.status }
    })

    if (response.ok) {
      const data = await response.json()
      logInfo('Under construction mode status', {
        component: 'middleware',
        metadata: { underConstruction: data.underConstruction }
      })
      return data.underConstruction === true || data.underConstruction === 'true'
    }
    
    return false
  } catch (error) {
    logError('Error checking under construction mode', error, {
      component: 'middleware',
      action: 'check_construction_mode'
    })
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware entirely for any file with an extension (static assets)
  if (pathname.includes('.')) {
    return NextResponse.next()
  }
  
  logInfo('Middleware running', { 
    component: 'middleware',
    metadata: { pathname }
  })

  // Skip middleware for admin routes, API routes, static files, and the under-construction page itself
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/uploads') ||
    pathname === '/under-construction'
  ) {
    logInfo('Skipping middleware', {
      component: 'middleware',
      metadata: { pathname, reason: 'excluded_path' }
    })
    return NextResponse.next()
  }

  // Check if under construction mode is enabled
  logInfo('Checking under construction mode', {
    component: 'middleware',
    metadata: { pathname }
  })
  const isUnderConstruction = await isUnderConstructionMode()
  
  if (isUnderConstruction) {
    logInfo('Redirecting to under construction page', {
      component: 'middleware',
      action: 'redirect_construction',
      metadata: { pathname }
    })
    return NextResponse.redirect(new URL('/under-construction', request.url))
  }

  logInfo('Allowing request to continue', {
    component: 'middleware',
    metadata: { pathname }
  })
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Only match page routes, exclude all static assets and API routes
     * This is more restrictive to prevent middleware from running on images
     */
    '/((?!api|_next|favicon.ico|admin|.*\\.).*)',
  ],
}