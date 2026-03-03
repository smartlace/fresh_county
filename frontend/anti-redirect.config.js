/**
 * Anti-Redirect Configuration for Fresh County Frontend
 * Prevents frontend from accidentally serving admin content
 */

module.exports = {
  // Routes that should never be served by frontend
  blockedRoutes: [
    '/admin',
    '/admin/*',
    '/dashboard',
    '/dashboard/*',
    '/management',
    '/management/*'
  ],
  
  // Admin-specific patterns to detect and block
  adminPatterns: [
    'admin dashboard',
    'admin login',
    'admin panel',
    'management console',
    'admin.freshcounty.com'
  ],
  
  // Redirect configuration
  adminRedirectUrl: 'https://admin.freshcounty.com',
  
  // Health check configuration
  healthCheck: {
    enabled: true,
    paths: ['/health', '/_health', '/api/health'],
    expectedContent: ['FreshCounty', 'Fresh County', 'freshcounty']
  },
  
  // Monitoring settings
  monitoring: {
    enabled: true,
    checkInterval: 300000, // 5 minutes
    memoryThreshold: 150, // MB
    logLevel: 'info'
  }
};