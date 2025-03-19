const express = require('express');
const { getEvents, getEvent, getEventsByDate, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Event routes
router.route('/')
  .get(getEvents)
  .post(createEvent);

router.get('/date/:date', getEventsByDate);

router.route('/:id')
  .get(getEvent)
  .put(updateEvent)
  .delete(deleteEvent);

module.exports = router;
