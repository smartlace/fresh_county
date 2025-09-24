import rateLimit from 'express-rate-limit';

// Authentication rate limiter - strict limits for login/register/password reset
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 50 : 10, // Increased from 5 to 10 for production
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Admin panel rate limiter - moderate limits for admin operations
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for admin operations (increased from 500)
  message: {
    error: 'Too many admin requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Very lenient rate limiter for admin dashboard read operations (settings, stats, etc.)
export const adminDashboardLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes window
  max: 1000, // Very high limit for dashboard operations
  message: {
    error: 'Too many dashboard requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Upload rate limiter - moderate limits for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limited uploads per window
  message: {
    error: 'Too many upload attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Newsletter rate limiter - prevent spam subscriptions
export const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 newsletter subscriptions per IP per window
  message: {
    error: 'Too many newsletter subscription attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});

// Contact form rate limiter - prevent spam
export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 contact form submissions per IP per window
  message: {
    error: 'Too many contact form submissions, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    trustProxy: false,
    xForwardedForHeader: false,
  },
});