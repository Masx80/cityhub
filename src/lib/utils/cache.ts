/**
 * Cache utility for improved application performance.
 * Provides both in-memory caching and HTTP response caching mechanisms.
 */

import { NextResponse } from "next/server";

// Cache expiration times (in seconds)
export const CACHE_TIMES = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 600, // 10 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

// In-memory cache store
type CacheItem<T> = {
  value: T;
  expiresAt: number;
};

// Cache map with automatic type inference
const memoryCache = new Map<string, CacheItem<any>>();

/**
 * Get a value from the in-memory cache
 * @param key Cache key
 * @returns The cached value or undefined if not found or expired
 */
export function getCached<T>(key: string): T | undefined {
  const item = memoryCache.get(key);
  
  if (!item) return undefined;
  
  // Check if the item has expired
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return undefined;
  }
  
  return item.value as T;
}

/**
 * Set a value in the in-memory cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds
 */
export function setCache<T>(key: string, value: T, ttl: number = CACHE_TIMES.MEDIUM): void {
  const expiresAt = Date.now() + ttl * 1000;
  memoryCache.set(key, { value, expiresAt });
}

/**
 * Delete a specific item from the cache
 * @param key Cache key to delete
 */
export function deleteCache(key: string): void {
  memoryCache.delete(key);
}

/**
 * Delete all cache items that match a prefix
 * @param prefix Cache key prefix to match
 */
export function deleteCacheByPrefix(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Create a NextResponse with appropriate cache headers
 * @param data Data to be JSON-serialized in the response
 * @param options Response options including cache settings
 */
export function cachedResponse(
  data: any,
  options: {
    status?: number;
    maxAge?: number;
    staleWhileRevalidate?: number;
    private?: boolean;
    headers?: Record<string, string>;
  } = {}
) {
  const {
    status = 200,
    maxAge = CACHE_TIMES.MEDIUM,
    staleWhileRevalidate = maxAge * 2,
    private: isPrivate = false,
    headers = {},
  } = options;

  // Determine cache control directive
  const cacheControl = isPrivate
    ? 'private, no-cache, no-store, must-revalidate'
    : `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`;

  return new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': cacheControl,
      ...headers,
    },
  });
}

/**
 * Utility to cache the result of async functions
 * @param fn The async function to cache
 * @param keyFn Function to generate a cache key from arguments
 * @param ttl Time to live in seconds
 */
export function cachify<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyFn: (...args: TArgs) => string,
  ttl: number = CACHE_TIMES.MEDIUM
) {
  return async (...args: TArgs): Promise<TResult> => {
    const cacheKey = keyFn(...args);
    const cachedResult = getCached<TResult>(cacheKey);
    
    if (cachedResult !== undefined) {
      return cachedResult;
    }
    
    const result = await fn(...args);
    setCache(cacheKey, result, ttl);
    return result;
  };
} 