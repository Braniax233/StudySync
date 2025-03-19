import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { youtubeSearchCache } from '../services/cacheService';
import '../styles/YouTubeSearch.css';

const YouTubeSearch = () => {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Check cache first
      const cachedResults = youtubeSearchCache.get(query);
      
      if (cachedResults) {
        // Use cached results
        setVideos(cachedResults);
        setLoading(false);
        return;
      }
      
      // If not in cache, make API request
      console.log('Sending request to:', `/api/youtube/search?query=${encodeURIComponent(query)}`);
      const response = await axios.get(`/api/youtube/search?query=${encodeURIComponent(query)}`);
      console.log('Response received:', response);
      
      const videoResults = response.data.data;
      setVideos(videoResults);
      
      // Cache the results
      youtubeSearchCache.set(query, videoResults);
    } catch (error) {
      console.error('Search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to search YouTube videos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (video) => {
    // Add to recent activity when a video is clicked
    youtubeSearchCache.addToRecent(video);
    
    // Open the video in a new tab
    window.open(video.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="youtube-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search YouTube videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="video-thumbnail" 
              onClick={() => handleVideoClick(video)}
            />
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
              <button
                onClick={() => handleVideoClick(video)}
                className="watch-button"
              >
                Watch on YouTube
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeSearch;
