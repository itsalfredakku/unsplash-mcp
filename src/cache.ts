import { logCacheOperation } from './logger.js';

interface CacheItem<T> {
  data: T;
  expiry: number;
}

export class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTtl: number;

  constructor(defaultTtlSeconds: number = 300) {
    this.defaultTtl = defaultTtlSeconds * 1000; // Convert to milliseconds
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds || this.defaultTtl / 1000) * 1000;
    const expiry = Date.now() + ttl;
    
    this.cache.set(key, { data, expiry });
    logCacheOperation('SET', key);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      logCacheOperation('MISS', key, false);
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      logCacheOperation('EXPIRED', key, false);
      return null;
    }

    logCacheOperation('HIT', key, true);
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      logCacheOperation('DELETE', key);
    }
    return deleted;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    logCacheOperation('CLEAR', `${size} items`);
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logCacheOperation('CLEANUP', `${cleaned} expired items`);
    }

    return cleaned;
  }
}
