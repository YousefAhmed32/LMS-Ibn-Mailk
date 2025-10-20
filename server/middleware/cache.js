// Redis-based caching middleware for performance optimization
const redis = require('redis');

// Redis client configuration
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.log('⚠️ Redis server connection refused');
      return new Error('Redis server connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.log('❌ Redis retry time exhausted');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.log('❌ Redis max retry attempts reached');
      return undefined;
    }
    return Math.min(options.attempt * 100, 3000);
  }
});

// Handle Redis connection
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('error', (err) => {
  console.log('❌ Redis client error:', err.message);
});

redisClient.on('end', () => {
  console.log('🔌 Redis client disconnected');
});

// Cache middleware factory
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and query parameters
    const cacheKey = `cache:${req.originalUrl}`;
    
    try {
      // Try to get cached data
      const cachedData = await redisClient.get(cacheKey);
      
      if (cachedData) {
        console.log(`🎯 Cache hit for: ${cacheKey}`);
        return res.json(JSON.parse(cachedData));
      }
      
      // If no cache, continue to route handler
      console.log(`❌ Cache miss for: ${cacheKey}`);
      
      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response data
        redisClient.setex(cacheKey, duration, JSON.stringify(data));
        console.log(`💾 Cached response for: ${cacheKey} (TTL: ${duration}s)`);
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('❌ Cache middleware error:', error);
      // If Redis fails, continue without caching
      next();
    }
  };
};

// Cache invalidation helper
const invalidateCache = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🗑️ Invalidated ${keys.length} cache entries matching: ${pattern}`);
    }
  } catch (error) {
    console.error('❌ Cache invalidation error:', error);
  }
};

// Cache statistics
const getCacheStats = async () => {
  try {
    const info = await redisClient.info('memory');
    const keys = await redisClient.keys('cache:*');
    
    return {
      totalKeys: keys.length,
      memoryInfo: info,
      status: 'connected'
    };
  } catch (error) {
    return {
      totalKeys: 0,
      memoryInfo: null,
      status: 'disconnected',
      error: error.message
    };
  }
};

module.exports = {
  cache,
  invalidateCache,
  getCacheStats,
  redisClient
};

