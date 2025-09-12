import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { redisClient } from '../config/session';

/**
 * Strict rate limiting for admin login attempts
 */
export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use Redis for distributed rate limiting
  store: redisClient ? new (require('rate-limit-redis'))({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:admin_login:'
  }) : undefined,
  // Skip successful requests
  skipSuccessfulRequests: true,
  // Custom key generator (IP + user agent for better tracking)
  keyGenerator: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 20)}`;
  }
});

/**
 * Rate limiting for admin API operations
 */
export const adminAPILimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each admin to 100 API requests per minute
  message: {
    success: false,
    message: 'Too many API requests. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new (require('rate-limit-redis'))({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:admin_api:'
  }) : undefined,
  // Key by user ID for authenticated requests
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    if (user && user.user_id) {
      return `user:${user.user_id}`;
    }
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});

/**
 * Strict rate limiting for sensitive admin operations
 */
export const adminSensitiveLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Only 10 sensitive operations per 5 minutes
  message: {
    success: false,
    message: 'Too many sensitive operations. Please wait before trying again.',
    retryAfter: 5 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new (require('rate-limit-redis'))({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:admin_sensitive:'
  }) : undefined,
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    return user ? `user:${user.user_id}` : req.ip || 'unknown';
  }
});

/**
 * Rate limiting for password reset attempts
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 password reset attempts per hour
  message: {
    success: false,
    message: 'Too many password reset attempts. Please try again in 1 hour.',
    retryAfter: 60 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new (require('rate-limit-redis'))({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    prefix: 'rl:password_reset:'
  }) : undefined,
  keyGenerator: (req: Request): string => {
    // Combine IP and email for more targeted limiting
    const email = req.body.email;
    const ip = req.ip || 'unknown';
    return email ? `${ip}:${email}` : ip;
  }
});

/**
 * Suspicious activity detector
 */
export const suspiciousActivityDetector = async (req: Request, res: Response, next: any) => {
  try {
    const ip = req.ip;
    const userAgent = req.get('User-Agent');
    const user = (req as any).user;
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      // No user agent
      !userAgent,
      // Too many different user agents from same IP
      // Rapid requests from same IP
      // Unusual request patterns
    ];
    
    // Log suspicious activity
    if (suspiciousPatterns.some(pattern => pattern)) {
      console.warn('🚨 Suspicious admin activity detected:', {
        ip,
        userAgent,
        userId: user?.user_id,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      
      // Optional: Temporary block or alert
      // You could implement auto-blocking here
    }
    
    next();
  } catch (error) {
    console.error('Error in suspicious activity detector:', error);
    next(); // Don't block on error
  }
};

/**
 * Brute force protection
 */
export class BruteForceProtection {
  private static instance: BruteForceProtection;
  private attempts: Map<string, { count: number; lastAttempt: Date; blocked: boolean }> = new Map();
  
  static getInstance(): BruteForceProtection {
    if (!BruteForceProtection.instance) {
      BruteForceProtection.instance = new BruteForceProtection();
    }
    return BruteForceProtection.instance;
  }
  
  async recordFailedAttempt(identifier: string): Promise<void> {
    const now = new Date();
    const existing = this.attempts.get(identifier);
    
    if (existing) {
      // Reset if more than 1 hour has passed
      if (now.getTime() - existing.lastAttempt.getTime() > 60 * 60 * 1000) {
        this.attempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
      } else {
        existing.count++;
        existing.lastAttempt = now;
        
        // Block after 10 failed attempts
        if (existing.count >= 10) {
          existing.blocked = true;
          console.warn(`🚨 Brute force protection: Blocked ${identifier}`);
        }
      }
    } else {
      this.attempts.set(identifier, { count: 1, lastAttempt: now, blocked: false });
    }
    
    // Store in Redis for persistence across restarts
    if (redisClient) {
      await redisClient.setex(
        `brute_force:${identifier}`,
        60 * 60, // 1 hour TTL
        JSON.stringify(this.attempts.get(identifier))
      );
    }
  }
  
  async isBlocked(identifier: string): Promise<boolean> {
    // Check memory first
    const existing = this.attempts.get(identifier);
    if (existing && existing.blocked) {
      return true;
    }
    
    // Check Redis
    if (redisClient) {
      try {
        const data = await redisClient.get(`brute_force:${identifier}`);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.blocked) {
            // Update memory cache
            this.attempts.set(identifier, parsed);
            return true;
          }
        }
      } catch (error) {
        console.error('Error checking brute force protection:', error);
      }
    }
    
    return false;
  }
  
  async clearAttempts(identifier: string): Promise<void> {
    this.attempts.delete(identifier);
    if (redisClient) {
      await redisClient.del(`brute_force:${identifier}`);
    }
  }
}

export const bruteForceProtection = BruteForceProtection.getInstance();