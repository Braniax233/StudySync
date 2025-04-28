import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { youtubeSearchCache } from '../services/cacheService';
import { bookmarkService } from '../services/bookmarkService';
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

  const handleBookmark = (video) => {
    const bookmark = {
      id: video.id,
      type: 'youtube',
      title: video.title,
      url: video.url,
      thumbnail: video.thumbnail,
      description: video.description || ''
    };

    const added = bookmarkService.addBookmark(bookmark);
    if (added) {
      // Update the video's bookmark status in the UI
      setVideos(videos.map(v => 
        v.id === video.id ? { ...v, isBookmarked: true } : v
      ));
    } else {
      // If bookmark already exists, remove it (toggle functionality)
      const removed = bookmarkService.removeBookmark(video.id, 'youtube');
      if (removed) {
        setVideos(videos.map(v => 
          v.id === video.id ? { ...v, isBookmarked: false } : v
        ));
      }
    }
  };

  const VideoGrid = ({ videos, onBookmark, isBookmarked }) => {
    return (
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-card">
            <div className="thumbnail-container" onClick={() => handleVideoClick(video)}>
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="video-thumbnail"
              />
              <span className="video-duration">{video.duration}</span>
            </div>
            <div className="video-info">
              <h3 className="video-title" onClick={() => handleVideoClick(video)}>{video.title}</h3>
              <div className="video-meta">
                <span className="channel-name">{video.channelTitle}</span>
                <div className="video-stats">
                  <span>{video.viewCount} views</span>
                  <span>•</span>
                  <span>{video.publishedAt}</span>
                </div>
              </div>
              <div className="video-actions">
                <button 
                  className={`bookmark-button ${isBookmarked(video) ? 'bookmarked' : ''}`}
                  onClick={() => onBookmark(video)}
                >
                  {isBookmarked(video) ? 'Bookmarked' : 'Bookmark'}
                </button>
                <a 
                  onClick={(e) => {
                    e.preventDefault();
                    handleVideoClick(video);
                  }}
                  href={`https://www.youtube.com/watch?v=${video.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="watch-button"
                >
                  Watch
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="youtube-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for YouTube videos..."
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

      <VideoGrid videos={videos} onBookmark={handleBookmark} isBookmarked={(video) => video.isBookmarked} />
    </div>
  );
};

export default YouTubeSearch;
