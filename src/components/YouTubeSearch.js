import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
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
      console.log('Sending request to:', `/api/youtube/search?query=${encodeURIComponent(query)}`);
      const response = await axios.get(`/api/youtube/search?query=${encodeURIComponent(query)}`);
      console.log('Response received:', response);
      setVideos(response.data.data);
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
            <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
            <div className="video-info">
              <h3 className="video-title">{video.title}</h3>
              <p className="video-description">{video.description}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="watch-button"
              >
                Watch on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeSearch;
