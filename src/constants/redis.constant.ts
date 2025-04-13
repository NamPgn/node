export const REDIS_CONFIG = {
  RETRY: {
    MAX_ATTEMPTS: 5,
    MIN_TIMEOUT: 50,
    MAX_TIMEOUT: 2000
  },
  CACHE: {
    DEFAULT_TTL: 3600, // 1 hour in seconds
    PRODUCTS_TTL: 1800, // 30 minutes
    CATEGORIES_TTL: 3600, // 1 hour
    USER_TTL: 7200 // 2 hours
  },
  KEYS: {
    PRODUCTS: 'products:',
    CATEGORIES: 'categories:',
    USERS: 'users:',
    COMMENTS: 'comments:',
    STATS: 'stats:'
  },
  PATTERNS: {
    ALL_PRODUCTS: 'products:*',
    ALL_CATEGORIES: 'categories:*',
    ALL_USERS: 'users:*'
  }
} as const; 