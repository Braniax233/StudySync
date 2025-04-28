const axios = require('axios');
const cacheService = require('./cacheService');

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

const CACHE_KEYS = {
  PLACES_SEARCH: 'places_search'
};

const placesService = {
  async searchNearbyPlaces(location, radius = 5000) {
    try {
      // Check cache first
      const cacheKey = `${CACHE_KEYS.PLACES_SEARCH}:${location}:${radius}`;
      const cachedResults = cacheService.get(cacheKey);
      
      if (cachedResults) {
        console.log('Cache hit for places search:', cacheKey);
        return cachedResults;
      }

      console.log('Cache miss for places search:', cacheKey);

      // First, get the coordinates for the location using Nominatim
      const geocodeResponse = await axios.get(`${NOMINATIM_API_URL}/search`, {
        params: {
          q: location,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'StudySync/1.0' // Required by Nominatim's terms of service
        }
      });

      if (!geocodeResponse.data.length) {
        throw new Error('Location not found');
      }

      const { lat, lon } = geocodeResponse.data[0];

      // Search for libraries and bookstores using Overpass API
      const query = `
        [out:json][timeout:25];
        (
          // Libraries
          node["amenity"="library"](around:${radius},${lat},${lon});
          way["amenity"="library"](around:${radius},${lat},${lon});
          relation["amenity"="library"](around:${radius},${lat},${lon});
          
          // Bookstores with specific names
          node["shop"="books"]["name"](around:${radius},${lat},${lon});
          way["shop"="books"]["name"](around:${radius},${lat},${lon});
          relation["shop"="books"]["name"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const overpassResponse = await axios.post(OVERPASS_API_URL, query);

      // Process and format the results
      const places = overpassResponse.data.elements.map(element => {
        const tags = element.tags || {};
        const isLibrary = tags.amenity === 'library';
        
        return {
          id: element.id,
          name: tags.name || (isLibrary ? 'Library' : 'Bookstore'),
          type: isLibrary ? 'library' : 'bookshop',
          address: tags['addr:street'] ? 
            `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : 
            'Address not available',
          distance: this.calculateDistance(lat, lon, element.lat, element.lon),
          location: {
            lat: element.lat,
            lng: element.lon
          },
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${element.lat},${element.lon}`
        };
      });

      // Sort by distance
      places.sort((a, b) => a.distance - b.distance);

      // Cache the results
      cacheService.set(cacheKey, places);

      return places;
    } catch (error) {
      console.error('Error in searchNearbyPlaces:', error);
      throw error;
    }
  },

  // Calculate distance between two points using the Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
};

module.exports = placesService; 