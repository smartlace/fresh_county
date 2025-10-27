// Enhanced Admin Server for Shared Hosting
// This file is needed to run the admin panel on shared hosting environments
// Includes protection against serving frontend routes

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3002;

// IMPORTANT: Ensure this is the ADMIN app, not frontend
const APP_NAME = 'ADMIN'
const ALLOWED_DOMAIN = process.env.ALLOWED_DOMAIN || 'admin.freshcounty.com'

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

// Create Next.js app instance
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Health check handler
function handleHealthCheck(res) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'healthy',
    app: APP_NAME,
    service: 'admin',
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
      // Health check endpoint
      if (req.url === '/health' || req.url === '/_health' || req.url === '/api/health') {
        return handleHealthCheck(req, res)
      }

      // CRITICAL: Block frontend-only routes to prevent cross-serving
      // These paths should only be served by the frontend app
      const frontendOnlyPaths = ['/cart', '/checkout', '/payment', '/auth', '/about', '/faq', '/maas', '/maas-order', '/detox', '/catering', '/fidelity', '/under-construction', '/privacy-policy', '/terms', '/cancellation-policy']
      const isFrontendPath = frontendOnlyPaths.some(path => {
        return req.url === path || req.url.startsWith(path + '/') || req.url.startsWith(path + '?')
      })

      if (isFrontendPath) {
        log(`🚨 BLOCKED frontend route request: ${req.url} - Redirecting to freshcounty.com`, 'warn')
        res.writeHead(302, {
          'Location': 'https://freshcounty.com',
          'Content-Type': 'text/html',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        })
        res.end('<!DOCTYPE html><html><head><title>Redirecting...</title><meta http-equiv="refresh" content="0;url=https://freshcounty.com"></head><body><p>Redirecting to customer site...</p></body></html>')
        return
      }

      // Parse request URL
      const parsedUrl = parse(req.url, true);

      // Add security headers for production
      if (!dev) {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Powered-By', ''); // Hide powered by header
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      }

      // Log requests in development
      if (dev && !req.url.includes('_next')) {
        log(`${req.method} ${req.url}`)
      }

      // Handle the request
      await handle(req, res, parsedUrl);
    } catch (err) {
      log(`Error handling ${req.url}: ${err.message}`, 'error')

      if (!res.headersSent) {
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }
  });

  server.listen(port, (err) => {
    if (err) {
      log(`Failed to start server: ${err.message}`, 'error')
      process.exit(1);
    }
    log(`🚀 Admin server ready on http://${hostname}:${port}`)
    log(`📊 Environment: ${dev ? 'development' : 'production'}`)
    log(`🔧 Node.js version: ${process.version}`)
    log(`💾 Initial memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)
  });

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

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM received, shutting down gracefully...')
    server.close(() => {
      log('Admin server terminated')
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT received, shutting down gracefully...')
    server.close(() => {
      log('Admin server terminated')
      process.exit(0);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    log(`Uncaught exception: ${error.message}`, 'error')
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    log(`Unhandled rejection at ${promise}: ${reason}`, 'error')
  })
}).catch((error) => {
  log(`Failed to start admin server: ${error.message}`, 'error')
  process.exit(1)
});