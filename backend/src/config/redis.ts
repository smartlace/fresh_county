import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
};

export const redis = new Redis(redisConfig);

export const connectRedis = async () => {
  try {
    await redis.ping();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

export default redis;