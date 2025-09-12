/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:3001 https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 https:; frame-ancestors 'none';"
              : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';"
          }
        ]
      }
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_APP_NAME: 'Fresh County Admin',
  },
  
  // Images configuration
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  
  // Redirect configuration
  async redirects() {
    const redirects = [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      }
    ];
    
    if (process.env.NODE_ENV === 'production') {
      redirects.push({
        source: '/(.*)',
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http'
          }
        ],
        destination: 'https://admin.freshcounty.com/:path*',
        permanent: true
      });
    }
    return redirects;
  },
  
  // Security configurations
  poweredByHeader: false,
  compress: true,
  
  // Type checking during build
  typescript: {
    ignoreBuildErrors: false
  },
  
  // ESLint during build
  eslint: {
    ignoreDuringBuilds: false
  }
};

module.exports = nextConfig;