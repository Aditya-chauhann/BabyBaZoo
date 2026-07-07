import { getRedisClient } from '../config/redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

// In-memory fallback if Redis is down
const memoryCache = new Map<string, { value: string, expiry: number | null }>();

export class RedisService {
  private get client() {
    return getRedisClient();
  }

  private key(...parts: string[]): string {
    return parts.join(':');
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.client.status === 'ready') {
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
      }
    } catch (err) {
      logger.error('Redis GET error', { key, error: (err as Error).message });
    }
    
    // Fallback
    const mem = memoryCache.get(key);
    if (mem) {
      if (mem.expiry && Date.now() > mem.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return JSON.parse(mem.value) as T;
    }
    return null;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (this.client.status === 'ready') {
        if (ttlSeconds) {
          await this.client.setex(key, ttlSeconds, serialized);
        } else {
          await this.client.set(key, serialized);
        }
        return;
      }
    } catch (err) {
      logger.error('Redis SET error', { key, error: (err as Error).message });
    }
    
    // Fallback
    memoryCache.set(key, { 
      value: serialized, 
      expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null 
    });
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client.status === 'ready') {
        await this.client.del(key);
        return;
      }
    } catch (err) {
      logger.error('Redis DEL error', { key, error: (err as Error).message });
    }
    
    // Fallback
    memoryCache.delete(key);
  }

  // Product cache keys
  productListKey(page: number, limit: number, categoryId?: string): string {
    return this.key('products', 'list', String(page), String(limit), categoryId || 'all');
  }

  productDetailKey(pid: string): string {
    return this.key('products', 'detail', pid);
  }

  getProductTtl(): number {
    return env.REDIS_PRODUCT_TTL;
  }

  // Tracking cache keys
  trackingKey(orderId: string): string {
    return this.key('tracking', orderId);
  }
}

export const redisService = new RedisService();
