import Redis from 'ioredis';

// Define Redis connection details from environment variables
// with fallback values for development
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisPassword = process.env.REDIS_PASSWORD || undefined;

// Initialize Redis client
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      password: redisPassword,
      // Reconnect strategy
      retryStrategy(times) {
        // Maximum retry time: 3 seconds
        const maxRetryTimeMs = 3000;
        // Calculate delay, increasing by 200ms each time, up to max
        const delay = Math.min(times * 200, maxRetryTimeMs);
        return delay;
      },
    });

    // Handle Redis connection errors
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  return redisClient;
}

// Cache expiration times (in seconds)
export const REDIS_CACHE_TIMES = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 600, // 10 minutes
  VERY_LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

/**
 * Get a value from Redis cache
 * @param key Cache key
 * @returns The cached value or null if not found
 */
export async function getFromRedis<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error('Error reading from Redis:', error);
    return null;
  }
}

/**
 * Set a value in Redis cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Time to live in seconds
 */
export async function setInRedis<T>(
  key: string, 
  value: T, 
  ttl: number = REDIS_CACHE_TIMES.MEDIUM
): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (error) {
    console.error('Error writing to Redis:', error);
  }
}

/**
 * Delete a specific item from Redis cache
 * @param key Cache key to delete
 */
export async function deleteFromRedis(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    await redis.del(key);
  } catch (error) {
    console.error('Error deleting from Redis:', error);
  }
}

/**
 * Delete all cache items that match a pattern
 * @param pattern Cache key pattern to match (e.g., "videos:*")
 */
export async function deleteByPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Error deleting by pattern from Redis:', error);
  }
} 