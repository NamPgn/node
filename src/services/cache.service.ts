import redisClient from '../config/redis.config';

/**
 * Get data from cache
 * @param key Cache key
 * @returns Parsed data or null if not found
 */
export const get = async (key: string): Promise<any> => {
  try {
    const cachedData = await redisClient.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

/**
 * Set data to cache
 * @param key Cache key
 * @param data Data to cache
 * @param ttl Time to live in seconds (optional)
 */
export const set = async (key: string, data: any, ttl?: number): Promise<void> => {
  try {
    const value = JSON.stringify(data);
    if (ttl) {
      await redisClient.set(key, value, 'EX', ttl);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

/**
 * Delete data from cache
 * @param key Cache key
 */
export const del = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param pattern Key pattern to match
 */
export const deletePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
};

/**
 * Get data from cache or fetch from source
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param ttl Time to live in seconds (optional)
 */
export const getOrSet = async (key: string, fetchFn: () => Promise<any>, ttl?: number): Promise<any> => {
  try {
    const cachedData = await get(key);
    if (cachedData) {
      return cachedData;
    }

    const freshData = await fetchFn();
    await set(key, freshData, ttl);
    return freshData;
  } catch (error) {
    console.error('Cache getOrSet error:', error);
    return null;
  }
};

/**
 * Clear all cache
 */
export const clear = async (): Promise<void> => {
  try {
    await redisClient.flushall();
  } catch (error) {
    console.error('Cache clear error:', error);
  }
};

// Helper function to generate cache key
export const generateKey = (prefix: string, id: string | number): string => {
  return `${prefix}${id}`;
};

// Helper function to check if key exists
export const exists = async (key: string): Promise<boolean> => {
  try {
    return await redisClient.exists(key) === 1;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
}; 