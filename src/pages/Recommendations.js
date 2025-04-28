import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navigation/Navbar';
import { bookmarkService } from '../services/bookmarkService';
import { recentActivityService } from '../services/cacheService';
import RecommendationModel from '../components/RecommendationModel';
import '../styles/Recommendations.css';

// Get singleton instance
const recommendationModel = new RecommendationModel();

const Recommendations = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'video', 'book'

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data
        const loadedBookmarks = await bookmarkService.getBookmarks();
        const activities = recentActivityService.getActivities(20); // Load more activities

        setBookmarks(loadedBookmarks || []);
        setRecentActivity(activities);

        // Transform data for the model
        const transformedData = {
          recentActivity: activities.map(activity => ({
            ...activity,
            type: activity.type === 'youtube' ? 'video' : activity.type,
            category: activity.category || 'general',
            tags: activity.tags || [],
            timestamp: activity.timestamp || Date.now()
          })),
          bookmarks: (loadedBookmarks || []).map(bookmark => ({
            ...bookmark,
            type: bookmark.type === 'youtube' ? 'video' : bookmark.type,
            category: bookmark.category || 'general',
            tags: bookmark.tags || [],
            timestamp: new Date(bookmark.dateAdded).getTime() || Date.now()
          }))
        };

        // Generate recommendations
        const allRecommendations = await recommendationModel.getRecommendations(transformedData);
        setRecommendations(allRecommendations);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      recommendationModel.cleanup();
    };
  }, []);

  // Get content for a recommendation
  const getContentForType = (type, recentActivity, bookmarks) => {
    // Combine recent activity and bookmarks, with most recent items first
    const allContent = [...recentActivity, ...bookmarks]
      .filter(item => (item.type === 'youtube' && type === 'video') || item.type === type)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Return the first match if available
    return allContent.length > 0 ? allContent[0] : null;
  };

  // Filter recommendations based on selected filter
  const filteredRecommendations = filter === 'all' 
    ? recommendations
    : recommendations.filter(rec => rec.type === filter);

  // Handle opening a resource
  const handleOpenResource = (url) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="recommendations-page">
      <Navbar />
      
      <div className="recommendations-content">
        <div className="recommendations-header">
          <h1>Recommended for You</h1>
          <div className="filter-controls">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${filter === 'video' ? 'active' : ''}`} 
              onClick={() => setFilter('video')}
            >
              Videos
            </button>
            <button 
              className={`filter-button ${filter === 'book' ? 'active' : ''}`} 
              onClick={() => setFilter('book')}
            >
              Books
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Loading recommendations...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div className="empty-recommendations">
            <p>No recommendations available. Try exploring more content!</p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {filteredRecommendations.map((recommendation, index) => {
              const { type, score, confidence } = recommendation;
              const matchingContent = getContentForType(type, recentActivity, bookmarks);
              const displayScore = Math.round(score * 100);
              
              const defaultThumbnails = {
                video: '/assets/video.jpg',
                book: '/assets/book.jpg'
              };

              return (
                <div 
                  key={index} 
                  className={`recommendation-card ${confidence}`}
                  onClick={() => handleOpenResource(matchingContent?.url)}
                >
                  <div className="recommendation-thumbnail">
                    <img 
                      src={matchingContent?.thumbnail || defaultThumbnails[type]} 
                      alt={matchingContent?.title || `${type} recommendation`}
                      onError={(e) => {
                        e.target.src = defaultThumbnails[type];
                      }}
                    />
                    <div className="recommendation-type-badge">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                  </div>
                  <div className="recommendation-content">
                    <h3 className="recommendation-title">
                      {matchingContent?.title || `Recommended ${type} content`}
                    </h3>
                    <div className="recommendation-score">
                      <div className="score-bar" style={{ width: `${displayScore}%` }}></div>
                      <span>{displayScore}% Match</span>
                    </div>
                    {matchingContent?.description && (
                      <p className="recommendation-description">
                        {matchingContent.description.slice(0, 120)}
                        {matchingContent.description.length > 120 ? '...' : ''}
                      </p>
                    )}
                    {matchingContent?.tags && matchingContent.tags.length > 0 && (
                      <div className="recommendation-tags">
                        {matchingContent.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                        {matchingContent.tags.length > 3 && (
                          <span className="more-tags">+{matchingContent.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                    <div className="recommendation-confidence">
                      <span className={`confidence-indicator ${confidence}`}></span>
                      <span className="confidence-text">{confidence} confidence</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations; 