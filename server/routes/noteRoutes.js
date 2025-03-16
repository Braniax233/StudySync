const express = require('express');
const { getNotes, getNote, createNote, updateNote, deleteNote, toggleShareNote, searchNotes } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Note routes
router.route('/')
  .get(getNotes)
  .post(createNote);

router.get('/search', searchNotes);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.put('/:id/share', toggleShareNote);

module.exports = router;
