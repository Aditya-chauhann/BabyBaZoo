import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const isTLSRedis = env.REDIS_URL.startsWith('rediss://');
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      ...(isTLSRedis ? { tls: { rejectUnauthorized: false } } : {})
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.error('Redis connection error', { error: err.message }));
  }
  return redisClient;
}
