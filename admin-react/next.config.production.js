// Production Next.js configuration for admin-react on shared hosting
// This version fixes standalone issues and image configuration

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
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()'
          },
          // HSTS for production
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }] : []),
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:3001 https:; font-src 'self' data:; connect-src 'self' http://localhost:3001 https:; frame-ancestors 'none';"
              : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://freshcounty.com https:; font-src 'self' data:; connect-src 'self' https://freshcounty.com https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
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
  
  // Images configuration - fixed deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'freshcounty.com'
      },
      {
        protocol: 'https',
        hostname: '*.freshcounty.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001'
      },
      {
        protocol: 'https',
        hostname: 'localhost'
      }
    ],
    unoptimized: true // Disable optimization for shared hosting compatibility
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
    
    // Remove problematic HTTPS redirect for shared hosting
    // Shared hosting handles SSL termination
    
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
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },
  
  // Remove standalone output for shared hosting compatibility
  // Use regular SSR mode instead
  
  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react']
  }
};

module.exports = nextConfig;