/**
 * Cache Service for StudySync
 * Handles caching of search results and recent activity
 */

// Constants for localStorage keys
const CACHE_KEYS = {
  YOUTUBE_SEARCH: 'studysync_youtube_search_cache',
  BOOKS_SEARCH: 'studysync_books_search_cache',
  RECENT_ACTIVITY: 'studysync_recent_activity'
};

// Maximum number of items to keep in each cache
const MAX_CACHE_ITEMS = 20;

// Maximum number of recent activities to track
const MAX_RECENT_ACTIVITIES = 10;

// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Get cached search results for a specific query
 * @param {string} cacheKey - The cache key to use (YOUTUBE_SEARCH or BOOKS_SEARCH)
 * @param {string} query - The search query
 * @returns {Array|null} - The cached results or null if not found or expired
 */
const getCachedResults = (cacheKey, query) => {
  try {
    const cache = JSON.parse(localStorage.getItem(cacheKey)) || {};
    const cachedItem = cache[query];
    
    // Check if cache exists and hasn't expired
    if (cachedItem && (Date.now() - cachedItem.timestamp < CACHE_EXPIRATION)) {
      console.log(`Cache hit for ${cacheKey} query: ${query}`);
      return cachedItem.data;
    }
    
    console.log(`Cache miss for ${cacheKey} query: ${query}`);
    return null;
  } catch (error) {
    console.error(`Error retrieving cache for ${cacheKey}:`, error);
    return null;
  }
};

/**
 * Cache search results for a specific query
 * @param {string} cacheKey - The cache key to use (YOUTUBE_SEARCH or BOOKS_SEARCH)
 * @param {string} query - The search query
 * @param {Array} data - The search results to cache
 */
const cacheResults = (cacheKey, query, data) => {
  try {
    const cache = JSON.parse(localStorage.getItem(cacheKey)) || {};
    
    // Add new cache entry
    cache[query] = {
      data,
      timestamp: Date.now()
    };
    
    // Limit cache size by removing oldest entries
    const queries = Object.keys(cache);
    if (queries.length > MAX_CACHE_ITEMS) {
      // Sort by timestamp (oldest first)
      const sortedQueries = queries.sort((a, b) => cache[a].timestamp - cache[b].timestamp);
      // Remove oldest entries
      const queriesToRemove = sortedQueries.slice(0, queries.length - MAX_CACHE_ITEMS);
      queriesToRemove.forEach(q => delete cache[q]);
    }
    
    localStorage.setItem(cacheKey, JSON.stringify(cache));
    console.log(`Cached results for ${cacheKey} query: ${query}`);
  } catch (error) {
    console.error(`Error caching results for ${cacheKey}:`, error);
  }
};

/**
 * Add an item to recent activity
 * @param {Object} item - The activity item to add
 * @param {string} item.id - Unique identifier
 * @param {string} item.title - Title of the item
 * @param {string} item.type - Type of activity (e.g., 'youtube', 'book')
 * @param {string} item.url - URL to the resource
 * @param {string} item.thumbnail - Thumbnail image URL
 * @param {string} item.description - Short description
 */
const addToRecentActivity = (item) => {
  try {
    // Ensure the item has all required fields
    if (!item.id || !item.title || !item.type || !item.url) {
      console.error('Invalid activity item:', item);
      return;
    }
    
    // Create activity object with timestamp
    const activityItem = {
      ...item,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    
    // Get current activities
    const activities = JSON.parse(localStorage.getItem(CACHE_KEYS.RECENT_ACTIVITY)) || [];
    
    // Check if item already exists (by id and type)
    const existingIndex = activities.findIndex(
      a => a.id === item.id && a.type === item.type
    );
    
    // If exists, remove it (we'll add it back at the top)
    if (existingIndex !== -1) {
      activities.splice(existingIndex, 1);
    }
    
    // Add new activity at the beginning
    activities.unshift(activityItem);
    
    // Limit to max number of activities
    const limitedActivities = activities.slice(0, MAX_RECENT_ACTIVITIES);
    
    // Save back to localStorage
    localStorage.setItem(CACHE_KEYS.RECENT_ACTIVITY, JSON.stringify(limitedActivities));
    console.log('Added to recent activity:', activityItem.title);
  } catch (error) {
    console.error('Error adding to recent activity:', error);
  }
};

/**
 * Get recent activity items
 * @param {number} limit - Maximum number of items to return
 * @returns {Array} - Recent activity items
 */
const getRecentActivity = (limit = MAX_RECENT_ACTIVITIES) => {
  try {
    const activities = JSON.parse(localStorage.getItem(CACHE_KEYS.RECENT_ACTIVITY)) || [];
    return activities.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
};

/**
 * Clear all cached data
 */
const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEYS.YOUTUBE_SEARCH);
    localStorage.removeItem(CACHE_KEYS.BOOKS_SEARCH);
    console.log('Cache cleared successfully');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Clear recent activity
 */
const clearRecentActivity = () => {
  try {
    localStorage.removeItem(CACHE_KEYS.RECENT_ACTIVITY);
    console.log('Recent activity cleared successfully');
  } catch (error) {
    console.error('Error clearing recent activity:', error);
  }
};

// YouTube search cache service
export const youtubeSearchCache = {
  get: (query) => getCachedResults(CACHE_KEYS.YOUTUBE_SEARCH, query),
  set: (query, data) => cacheResults(CACHE_KEYS.YOUTUBE_SEARCH, query, data),
  addToRecent: (video) => {
    addToRecentActivity({
      id: video.id,
      title: video.title,
      type: 'youtube',
      url: video.url,
      thumbnail: video.thumbnail,
      description: video.description || ''
    });
  }
};

// Books search cache service
export const booksSearchCache = {
  get: (query) => getCachedResults(CACHE_KEYS.BOOKS_SEARCH, query),
  set: (query, data) => cacheResults(CACHE_KEYS.BOOKS_SEARCH, query, data),
  addToRecent: (book) => {
    addToRecentActivity({
      id: book.id,
      title: book.title,
      type: 'book',
      url: book.infoLink || book.previewLink || '',
      thumbnail: book.thumbnail || '',
      description: book.authors ? `By ${book.authors.join(', ')}` : ''
    });
  }
};

// Recent activity service
export const recentActivityService = {
  getActivities: (limit) => getRecentActivity(limit),
  clearActivities: clearRecentActivity
};

// Export cache utilities
export const cacheUtils = {
  clearAll: () => {
    clearCache();
    clearRecentActivity();
  }
};

// Create a default export object
const cacheService = {
  youtubeSearchCache,
  booksSearchCache,
  recentActivityService,
  cacheUtils
};

export default cacheService;
