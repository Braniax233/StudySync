const BOOKMARKS_KEY = 'studysync_bookmarks';

/**
 * Get all bookmarks from localStorage
 * @returns {Array} Array of bookmarks
 */
const getBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

/**
 * Save bookmarks to localStorage
 * @param {Array} bookmarks Array of bookmarks
 */
const saveBookmarks = (bookmarks) => {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving bookmarks:', error);
  }
};

/**
 * Add a new bookmark
 * @param {Object} bookmark Bookmark object to add
 * @returns {Object} The added bookmark
 */
const addBookmark = (bookmark) => {
  try {
    const bookmarks = getBookmarks();
    
    // Check if bookmark already exists
    const exists = bookmarks.some(b => 
      b.id === bookmark.id && b.type === bookmark.type
    );
    
    if (exists) {
      return null;
    }
    
    // Add new bookmark with timestamp and default values
    const newBookmark = {
      ...bookmark,
      dateAdded: new Date().toISOString(),
      category: bookmark.category || bookmark.type || 'general',
      tags: bookmark.tags || [bookmark.type]
    };
    
    bookmarks.push(newBookmark);
    saveBookmarks(bookmarks);
    
    return newBookmark;
  } catch (error) {
    console.error('Error adding bookmark:', error);
    return null;
  }
};

/**
 * Remove a bookmark
 * @param {string} id The ID of the bookmark to remove
 * @param {string} type The type of the bookmark
 * @returns {boolean} Whether the bookmark was removed successfully
 */
const removeBookmark = (id, type) => {
  try {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(
      b => !(b.id === id && b.type === type)
    );
    saveBookmarks(updatedBookmarks);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

/**
 * Check if an item is bookmarked
 * @param {string} id The ID of the item
 * @param {string} type The type of the item
 * @returns {boolean} Whether the item is bookmarked
 */
const isBookmarked = (id, type) => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(b => b.id === id && b.type === type);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

export const bookmarkService = {
  getBookmarks,
  addBookmark,
  removeBookmark,
  isBookmarked
}; 