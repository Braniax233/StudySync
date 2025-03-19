const Bookmark = require('../models/Bookmark');

/**
 * @desc    Get all bookmarks for a user
 * @route   GET /api/bookmarks
 * @access  Private
 */
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ dateAdded: -1 });
    
    res.json({
      success: true,
      count: bookmarks.length,
      data: bookmarks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get a single bookmark
 * @route   GET /api/bookmarks/:id
 * @access  Private
 */
exports.getBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this bookmark'
      });
    }
    
    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a new bookmark
 * @route   POST /api/bookmarks
 * @access  Private
 */
exports.createBookmark = async (req, res) => {
  try {
    const { title, url, category, notes } = req.body;
    
    const bookmark = await Bookmark.create({
      title,
      url,
      category: category || 'Uncategorized',
      notes,
      user: req.user._id,
      dateAdded: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update a bookmark
 * @route   PUT /api/bookmarks/:id
 * @access  Private
 */
exports.updateBookmark = async (req, res) => {
  try {
    let bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this bookmark'
      });
    }
    
    // Update bookmark
    const { title, url, category, notes } = req.body;
    
    bookmark = await Bookmark.findByIdAndUpdate(
      req.params.id,
      {
        title: title || bookmark.title,
        url: url || bookmark.url,
        category: category || bookmark.category,
        notes: notes !== undefined ? notes : bookmark.notes
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a bookmark
 * @route   DELETE /api/bookmarks/:id
 * @access  Private
 */
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    
    // Check if bookmark exists
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    // Check if user owns the bookmark
    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this bookmark'
      });
    }
    
    await bookmark.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
