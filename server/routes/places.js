const express = require('express');
const router = express.Router();
const placesService = require('../services/placesService');

// Search for nearby places
router.get('/search', async (req, res) => {
  try {
    const { location, radius } = req.query;
    
    if (!location) {
      return res.status(400).json({ error: 'Location parameter is required' });
    }

    const places = await placesService.searchNearbyPlaces(location, parseInt(radius) || 5000);
    res.json(places);
  } catch (error) {
    console.error('Error in places search route:', error);
    res.status(500).json({ error: 'Failed to search for places' });
  }
});

module.exports = router; 