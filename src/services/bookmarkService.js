const BOOKMARKS_KEY = 'studysync_bookmarks';

/**
 * Get all bookmarks from localStorage
 * @returns {Array} Array of bookmarks
 */
const getBookmarks = () => {
  try {
    const bookmarks = JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
    // Sort bookmarks by dateAdded in descending order (newest first)
    return bookmarks.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
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
    
    // Add new bookmark with timestamp
    const newBookmark = {
      ...bookmark,
      dateAdded: new Date().toISOString()
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
 * @param {string} id Bookmark ID
 * @param {string} type Bookmark type (youtube or book)
 * @returns {boolean} Success status
 */
const removeBookmark = (id, type) => {
  try {
    const bookmarks = getBookmarks();
    const filteredBookmarks = bookmarks.filter(
      bookmark => !(bookmark.id === id && bookmark.type === type)
    );
    
    saveBookmarks(filteredBookmarks);
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

/**
 * Check if an item is bookmarked
 * @param {string} id Item ID
 * @param {string} type Item type (youtube or book)
 * @returns {boolean} Whether the item is bookmarked
 */
const isBookmarked = (id, type) => {
  try {
    const bookmarks = getBookmarks();
    return bookmarks.some(
      bookmark => bookmark.id === id && bookmark.type === type
    );
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

export default bookmarkService; 