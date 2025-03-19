const express = require('express');
const { getBookmarks, getBookmark, createBookmark, updateBookmark, deleteBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Bookmark routes
router.route('/')
  .get(getBookmarks)
  .post(createBookmark);

router.route('/:id')
  .get(getBookmark)
  .put(updateBookmark)
  .delete(deleteBookmark);

module.exports = router;
