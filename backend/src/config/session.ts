import session from 'express-session';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';
import crypto from 'crypto';

// Redis client and store (optional)
let redisClient: any = null;
let redisStore: any = null;

// Check if Redis should be enabled for sessions
const isRedisEnabled = () => {
  const host = process.env.REDIS_HOST;
  return host && host.trim() !== '';
};

// Try to connect to Redis, but continue without it if not available
const initializeRedis = async () => {
  if (!isRedisEnabled()) {
    console.log('Redis disabled for sessions - using memory store');
    return false;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        connectTimeout: 5000,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Handle Redis connection events
    redisClient.on('error', (err: any) => {
      console.warn('Redis Client Error (sessions will use memory store):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✅ Connected to Redis for sessions');
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis ready for session operations');
    });

    // Connect to Redis with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      )
    ]);
    
    // Create Redis store only if connection successful
    redisStore = new (RedisStore as any)({
      client: redisClient,
      prefix: 'fresh_county_admin:',
      ttl: 24 * 60 * 60 // 24 hours in seconds
    });
    
    return true;
  } catch (error) {
    console.warn('Redis not available for sessions, using memory store:', (error as Error).message);
    if (redisClient) {
      try {
        redisClient.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
      redisClient = null;
    }
    return false;
  }
};

// Initialize Redis (but don't wait for it)
initializeRedis();

// Generate secure session secret
const generateSessionSecret = (): string => {
  const envSecret = process.env.SESSION_SECRET;
  if (envSecret && envSecret.length >= 64) {
    return envSecret;
  }
  
  // Generate a secure random secret if not provided
  const secret = crypto.randomBytes(64).toString('hex');
  console.warn('⚠️ Using generated session secret. Set SESSION_SECRET in production!');
  return secret;
};

// Session configuration factory
export const getSessionConfig = (): session.SessionOptions => {
  const config: session.SessionOptions = {
    secret: generateSessionSecret(),
    name: 'fresh_county_admin_session', // Don't use default 'connect.sid'
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on activity
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
      domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
    }
  };

  // Use Redis store if available, otherwise use memory store
  if (redisStore) {
    config.store = redisStore;
    console.log('✅ Using Redis store for sessions');
  } else {
    console.warn('⚠️ Using memory store for sessions (not suitable for production clusters)');
    // Memory store is the default when no store is specified
  }

  return config;
};

// Export session config for backward compatibility
export const sessionConfig = getSessionConfig();

// Session types for TypeScript
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string | number;
      email: string;
      role: string;
      first_name: string;
      last_name: string;
      login_at: Date;
    };
    csrfToken?: string;
    loginAttempts?: number;
    lastLoginAttempt?: Date;
    mfaToken?: string;
    mfaExpires?: Date;
  }
}

// Helper functions
export const isSessionValid = (session: session.SessionData): boolean => {
  return !!(session.user && session.user.role === 'admin');
};

export const createUserSession = (session: session.SessionData, user: any): void => {
  session.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    login_at: new Date()
  };
  
  // Generate CSRF token
  session.csrfToken = crypto.randomBytes(32).toString('hex');
};

export const destroyUserSession = (session: session.SessionData): void => {
  delete session.user;
  delete session.csrfToken;
  delete session.mfaToken;
  delete session.mfaExpires;
};

export const regenerateSession = (req: any): Promise<void> => {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Export Redis client for other uses (may be null if Redis not available)
export { redisClient };