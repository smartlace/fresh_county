import type { NextConfig } from "next";

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

const nextConfig: NextConfig = {
  // Security headers configuration
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy - prevents XSS attacks
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
              "img-src 'self' data: blob: https: http:", // Allow images from external sources
              "font-src 'self' data:",
              "connect-src 'self' https: http:", // Allow API calls
              "media-src 'self'",
              "object-src 'none'", // Block object/embed/applet
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'", // Prevent embedding in frames
              "upgrade-insecure-requests"
            ].join('; ')
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Enable XSS filtering
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // HTTPS redirect (only in production)
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }] : []),
          // Feature policy
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'accelerometer=()',
              'gyroscope=()'
            ].join(', ')
          }
        ]
      }
    ]
  },

  // Image domains for optimization (enhanced security)
  images: {
    domains: [
      'images.unsplash.com', 
      'localhost'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.freshcounty.com'
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001'
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}/uploads/:path*`,
      },
    ];
  },

  // Disable X-Powered-By header for security
  poweredByHeader: false,

  // Enable compression for better performance
  compress: true,

  // Experimental features
  experimental: {
    // Add other experimental features here as needed
  },

  // Webpack configuration for optimization
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
        },
      };
    }

    return config;
  }
};

export default withBundleAnalyzer(nextConfig);
