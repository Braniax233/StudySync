const CACHE_EXPIRATION = 3600; // 1 hour in seconds

const cache = new Map();

const cacheService = {
  get(key) {
    const item = cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_EXPIRATION * 1000) {
      cache.delete(key);
      return null;
    }
    
    return item.data;
  },
  
  set(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },
  
  clear() {
    cache.clear();
  }
};

module.exports = cacheService; 