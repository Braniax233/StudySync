import React, { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';
import axios from '../utils/axiosConfig';
import '../styles/ResourceLocator.css';

const ResourceLocator = () => {
  const [location, setLocation] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Sample popular Cities
  const popularCities = [
    "Accra",
    "Kumasi",
    "Takoradi",
    "Tema",
    "Cape Coast"
  ];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!location.trim()) {
      setError('Please enter your location');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Sending request to search places:', location);
      const response = await axios.get('/api/places/search', {
        params: {
          location: location.trim(),
          radius: 5000 // 5km radius
        }
      });
      console.log('Response received:', response.data);
      setNearbyPlaces(response.data);
    } catch (error) {
      console.error('Error fetching nearby places:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.response?.data?.error || 'Failed to fetch nearby places. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCityClick = (city) => {
    setLocation(city);
    // Removed automatic search - now just sets the location in the input field
  };

  const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    }
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const handleOpenInMaps = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="resource-locator-page">
      <Navbar />
      
      <div className="locator-content">
        <div className="locator-hero">
          <h1>Resource Locator</h1>
          <p className="locator-subtitle">
            Find physical books in nearby libraries and bookstores
          </p>
          
          <form onSubmit={handleSearch} className="locator-search-form">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Search for libraries and bookstores near you..."
              className="search-input"
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        {nearbyPlaces.length > 0 && (
          <div className="nearby-places-section">
            <h2>Nearby Places</h2>
            <div className="places-grid">
              {nearbyPlaces.map((place) => (
                <div key={place.id} className="place-card">
                  <div className="place-icon">
                    {place.type === 'library' ? '📚' : '📖'}
                  </div>
                  <div className="place-info">
                    <h3>{place.name}</h3>
                    <p className="place-type">{place.type === 'library' ? 'Library' : 'Bookshop'}</p>
                    <p className="place-address">{place.address}</p>
                    <div className="place-details">
                      <span className="distance">{formatDistance(place.distance)}</span>
                      <button 
                        className="maps-button"
                        onClick={() => handleOpenInMaps(place.googleMapsUrl)}
                      >
                        Open in Maps
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="popular-cities-section">
          <h2>Popular cities</h2>
          <div className="popular-cities-list">
            {popularCities.map((city, index) => (
              <div 
                key={index} 
                className="popular-city-item"
                onClick={() => handleCityClick(city)}
              >
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLocator;
