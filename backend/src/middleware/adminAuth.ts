import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT secret at startup
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}

/**
 * Middleware to require admin authentication for routes
 * Redirects to login page if not authenticated or not admin
 */
export const requireAdminAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in various places
    let token: string | null = null;
    
    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // 2. Check cookies
    if (!token && req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }
    
    // Note: Token via query parameters is disabled for security reasons
    // JWT tokens should only be sent via secure headers or httpOnly cookies
    
    // If no token, redirect to login
    if (!token) {
      return res.redirect('/admin/login');
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if user is admin, manager, or staff
    if (!decoded || !['admin', 'manager', 'staff'].includes(decoded.role)) {
      return res.redirect('/admin/login?error=access_denied');
    }
    
    // Add user info to request
    (req as any).user = decoded;
    next();
    
  } catch (error) {
    // Invalid token, redirect to login
    return res.redirect('/admin/login?error=invalid_token');
  }
};

/**
 * Middleware for API routes that require admin authentication
 * Returns JSON error instead of redirect
 */
export const requireAdminAuthAPI = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Check if user is admin, manager, or staff
    if (!decoded || !['admin', 'manager', 'staff'].includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin panel access required'
      });
    }
    
    // Add user info to request
    (req as any).user = decoded;
    next();
    
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Session-based authentication middleware (alternative)
 * For when using session cookies instead of JWT
 */
export const requireAdminSession = (req: Request, res: Response, next: NextFunction) => {
  // Check if session exists and user has admin access
  const session = (req as any).session;
  if (session && session.user && ['admin', 'manager', 'staff'].includes(session.user.role)) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

/**
 * CSRF protection for admin routes
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const session = (req as any).session;
  const sessionToken = session && session.csrfToken;
  
  if (!token || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
};

/**
 * Rate limiting specifically for admin routes
 */
export const adminRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  // Implement stricter rate limiting for admin routes
  // This could check for suspicious activity patterns
  next();
};

/**
 * Audit logging for admin actions
 */
export const auditLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log admin action with user info, IP, timestamp
    const user = (req as any).user;
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      user_id: user?.user_id,
      ip: req.ip,
      user_agent: req.headers['user-agent'],
      path: req.path,
      method: req.method
    };
    
    console.log('ADMIN_AUDIT:', JSON.stringify(logEntry));
    
    // In production, you'd want to store this in a secure audit log
    // await auditLogService.log(logEntry);
    
    next();
  };
};