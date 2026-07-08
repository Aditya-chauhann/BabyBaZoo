import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = env.REDIS_URL.trim();
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      family: 0
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis connection error', { error: err.message }));
  }
  return redisClient;
}
