import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard', 
  '/users', 
  '/products', 
  '/orders', 
  '/settings', 
  '/analytics',
  '/blog',
  '/newsletters', 
  '/website-pages',
  '/categories',
  '/coupons'
];
const authRoutes = ['/login', '/mfa-verify'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get authentication token from cookies
  const token = request.cookies.get('admin_token')?.value;
  const sessionId = request.cookies.get('fresh_county_admin_session')?.value;
  
  // Debug logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware debug:', {
      pathname,
      hasToken: !!token,
      hasSessionId: !!sessionId,
      tokenLength: token?.length || 0,
      allCookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  }
  
  // Check if user is authenticated
  const isAuthenticated = !!(token || sessionId);
  
  // Allow a brief grace period after login for cookie to be set
  const isLoginRedirect = request.headers.get('referer')?.includes('/login');
  
  // If coming from login page and no token yet, allow one pass
  if (isLoginRedirect && !isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Grace period: allowing access after login redirect to', pathname);
    }
    // Set a temporary session to prevent immediate redirect loop
    const response = NextResponse.next();
    response.cookies.set('temp_auth_grace', 'true', { maxAge: 5, path: '/' });
    return response;
  }
  
  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.some(route => pathname.startsWith(route))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirecting authenticated user to dashboard from:', pathname);
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Redirecting unauthenticated user to login from:', pathname);
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Security headers for all responses
  const response = NextResponse.next();
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https://freshcounty.com; " +
    "font-src 'self'; " +
    "connect-src 'self' https://freshcounty.com; " +
    "frame-ancestors 'none';"
  );
  
  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Commented out COEP to allow uploads from same domain
  // response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};