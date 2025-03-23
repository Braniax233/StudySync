/**
 * Add an item to recent activity
 * @param {Object} item - The activity item to add
 * @param {string} item.id - Unique identifier
 * @param {string} item.title - Title of the item
 * @param {string} item.type - Type of activity (e.g., 'youtube', 'book')
 * @param {string} item.url - URL to the resource
 * @param {string} item.thumbnail - Thumbnail image URL
 * @param {string} item.description - Short description
 * @param {string} item.category - Category of the content (e.g., 'programming', 'science')
 * @param {Array} item.tags - Array of tags for the content
 */
const addToRecentActivity = (item) => {
  try {
    // Ensure the item has all required fields
    if (!item.id || !item.title || !item.type || !item.url) {
      console.error('Invalid activity item:', item);
      return;
    }
    
    // Create activity object with timestamp and default values
    const activityItem = {
      ...item,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      category: item.category || 'general',
      tags: item.tags || []
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

// YouTube search cache service
export const youtubeSearchCache = {
  get: (query) => getCachedResults(CACHE_KEYS.YOUTUBE_SEARCH, query),
  set: (query, data) => cacheResults(CACHE_KEYS.YOUTUBE_SEARCH, query, data),
  addToRecent: (video) => {
    addToRecentActivity({
      id: video.id,
      title: video.title,
      type: 'video',
      url: video.url,
      thumbnail: video.thumbnail,
      description: video.description || '',
      category: 'video',
      tags: ['video', 'youtube']
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
      description: book.authors ? `By ${book.authors.join(', ')}` : '',
      category: 'book',
      tags: ['book', 'reading']
    });
  }
}; 