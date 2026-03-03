/**
 * Enhanced Production server for Next.js frontend on Namecheap hosting
 * This file should be uploaded to /public_html/frontend/server.js
 * Includes routing protection and health monitoring
 */

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

// IMPORTANT: Ensure this is the FRONTEND app, not admin
const APP_NAME = 'FRONTEND'
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'freshcounty.com'

// Enhanced logging with timestamps
function log(message, level = 'info') {
  const timestamp = new Date().toISOString()
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅'
  console.log(`${prefix} [${timestamp}] ${APP_NAME}: ${message}`)
}

// Log startup to verify correct app is running
log(`Starting ${APP_NAME} application`)
log(`Expected domain: ${ALLOWED_DOMAIN}`)
log(`Port: ${port}`)
log(`Environment: ${dev ? 'development' : 'production'}`)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Health check handler
function handleHealthCheck(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'healthy',
    app: APP_NAME,
    service: 'frontend',
    domain: ALLOWED_DOMAIN,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    pid: process.pid,
    environment: process.env.NODE_ENV || 'development',
    port: port
  }))
}

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Health check endpoint for monitoring
      if (req.url === '/health' || req.url === '/_health' || req.url === '/api/health') {
        return handleHealthCheck(res)
      }

      // CRITICAL FIX: Prevent frontend from serving admin pages
      // The frontend app should NEVER serve these routes - they don't exist in frontend/src/app
      // If requested, return 404 immediately without letting Next.js try to serve them
      // This prevents the bug where frontend mysteriously starts serving admin login page
      const nonExistentAdminPaths = ['/login', '/dashboard', '/analytics', '/coupons', '/newsletters', '/shipping', '/website-pages', '/users', '/settings']
      const isNonExistentAdminPath = nonExistentAdminPaths.some(path => {
        return req.url === path || req.url.startsWith(path + '/') || req.url.startsWith(path + '?')
      })

      if (isNonExistentAdminPath) {
        log(`🚨 BLOCKED non-existent admin route: ${req.url} - Showing custom 404 page`, 'warn')

        // Set cache headers to prevent caching of this response
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
        res.setHeader('Pragma', 'no-cache')
        res.setHeader('Expires', '0')

        // Redirect to custom 404 page
        const notFoundUrl = parse('/404', true)
        await handle(req, res, notFoundUrl)
        return
      }

      // Block /admin routes - these should redirect to admin domain
      if (req.url === '/admin' || req.url.startsWith('/admin/') || req.url.startsWith('/admin?')) {
        log(`Redirecting /admin request to admin.freshcounty.com`, 'info')
        res.writeHead(302, {
          'Location': 'https://admin.freshcounty.com',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        })
        res.end()
        return
      }

      // Parse the request URL
      const parsedUrl = parse(req.url, true)
      
      // Log requests in development
      if (dev && !req.url.includes('_next')) {
        log(`${req.method} ${req.url}`)
      }
      
      // Handle the request with Next.js
      await handle(req, res, parsedUrl)
      
    } catch (err) {
      log(`Error handling ${req.url}: ${err.message}`, 'error')
      
      // Enhanced error response
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end(`<!DOCTYPE html>
<html>
<head>
  <title>Service Temporarily Unavailable</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
    h1 { color: #e74c3c; }
    p { color: #666; margin: 20px 0; }
    .retry { background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>Service Temporarily Unavailable</h1>
  <p>We're experiencing a temporary issue. Please try again in a moment.</p>
  <p>If the problem persists, please contact support.</p>
  <a href="/" class="retry">Try Again</a>
</body>
</html>`)
      }
    }
  })

  // Enhanced server error handling
  server.on('error', (err) => {
    log(`Server error: ${err.message}`, 'error')
  })

  server.on('clientError', (err, socket) => {
    log(`Client error: ${err.message}`, 'warn')
    if (!socket.destroyed) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
    }
  })

  server.listen(port, hostname, (err) => {
    if (err) throw err
    log(`🚀 Frontend server ready on http://${hostname}:${port}`)
    log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    log(`🔧 Node.js version: ${process.version}`)
    log(`💾 Initial memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)
  })

  // Monitor memory usage periodically
  setInterval(() => {
    const memUsage = process.memoryUsage()
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    
    // Log memory usage if it's high (>150MB) or every hour
    if (memUsedMB > 150 || Date.now() % 3600000 < 60000) {
      log(`Memory usage: ${memUsedMB}MB (heap: ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB)`)
      
      // Warn if memory usage is very high
      if (memUsedMB > 200) {
        log(`High memory usage detected: ${memUsedMB}MB`, 'warn')
      }
    }
  }, 60000) // Check every minute

}).catch((error) => {
  log(`Failed to start server: ${error.message}`, 'error')
  process.exit(1)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'error')
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled rejection at ${promise}: ${reason}`, 'error')
})