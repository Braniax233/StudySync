const express = require('express');
const { getResources, getResource, createResource, updateResource, deleteResource, searchResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Resource routes
router.route('/')
  .get(getResources)
  .post(createResource);

router.get('/search', searchResources);

router.route('/:id')
  .get(getResource)
  .put(updateResource)
  .delete(deleteResource);

module.exports = router;
