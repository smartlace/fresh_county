import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Check if Redis should be enabled
const isRedisEnabled = () => {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  
  // If REDIS_HOST is empty or undefined, disable Redis
  if (!host || host.trim() === '') {
    return false;
  }
  
  return true;
};

let redis: Redis | null = null;

// Only create Redis client if Redis is enabled
if (isRedisEnabled()) {
  const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true, // Don't connect immediately
  };

  redis = new Redis(redisConfig);

  // Handle Redis errors gracefully
  redis.on('error', (error) => {
    console.warn('Redis error (continuing without Redis):', error.message);
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
  });

  redis.on('close', () => {
    console.log('Redis connection closed');
  });
}

export const connectRedis = async () => {
  if (!redis) {
    console.log('Redis disabled - continuing without Redis');
    return false;
  }

  try {
    await redis.ping();
    console.log('Connected to Redis');
    return true;
  } catch (error) {
    console.warn('Redis connection failed, continuing without Redis:', (error as Error).message);
    // Disconnect the client to prevent retry attempts
    if (redis) {
      redis.disconnect();
      redis = null;
    }
    return false;
  }
};

export { redis };
export default redis;