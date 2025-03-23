import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import StudySyncCalendar from '../components/Calendar/Calendar';
import { bookmarkService } from '../services/bookmarkService';
import { recentActivityService } from '../services/cacheService';
import RecommendationModel from '../components/RecommendationModel';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load data from services and generate recommendations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');

        // Load bookmarks
        const loadedBookmarks = await bookmarkService.getBookmarks();
        console.log('Loaded bookmarks:', loadedBookmarks);
        
        if (Array.isArray(loadedBookmarks)) {
          setBookmarks(loadedBookmarks);
        } else {
          console.error('Bookmarks data is not an array:', loadedBookmarks);
          setBookmarks([]);
        }
        
        // Load recent activity from cache
        const activities = recentActivityService.getActivities(10);
        console.log('Loaded activities:', activities);
        setRecentActivity(activities);

        // Initialize recommendation model
        console.log('Initializing recommendation model...');
        const recommendationModel = new RecommendationModel();

        // Prepare user data for recommendations
        const userData = {
          recentActivity: activities,
          bookmarks: loadedBookmarks,
          searchHistory: []
        };
        console.log('User data for recommendations:', userData);

        // Train the model with user data
        console.log('Training recommendation model...');
        const trained = await recommendationModel.trainModel(userData);
        
        if (!trained) {
          throw new Error('Failed to train recommendation model');
        }
        
        // Get personalized recommendations
        console.log('Getting recommendations...');
        const userRecommendations = await recommendationModel.getRecommendations(userData);
        console.log('Generated recommendations:', userRecommendations);
        
        if (!userRecommendations || userRecommendations.length === 0) {
          console.log('No recommendations generated');
        }
        
        setRecommendations(userRecommendations);
      } catch (error) {
        console.error('Error in dashboard data fetching:', error);
        setError(error.message);
        setBookmarks([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };
  
  const handleOpenResource = (url) => {
    window.open(url, '_blank');
  };
  
  const handleDeleteBookmark = (bookmark) => {
    if (window.confirm('Are you sure you want to remove this bookmark?')) {
      bookmarkService.removeBookmark(bookmark.id, bookmark.type);
      // Update the bookmarks state by filtering out the deleted bookmark
      setBookmarks(prevBookmarks => prevBookmarks.filter(b => 
        !(b.id === bookmark.id && b.type === bookmark.type)
      ));
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format relative time for recent activity
  const getRelativeTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    // Convert to appropriate units
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    // Fall back to formatted date for older items
    return formatDate(new Date(timestamp));
  };

  const renderRecommendations = () => {
    if (loading) {
      return <div className="loading">Loading recommendations...</div>;
    }

    if (error) {
      return <div className="error">Error loading recommendations: {error}</div>;
    }

    if (!recommendations || recommendations.length === 0) {
      return (
        <div className="no-recommendations">
          <p>No recommendations available yet.</p>
          <p className="hint">Try searching for some content or bookmarking items to get personalized recommendations!</p>
        </div>
      );
    }

    return (
      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div key={index} className="recommendation-card">
            <div className="recommendation-image">
              <img 
                src={`/assets/${rec.type.toLowerCase()}.jpg`} 
                alt={rec.type} 
                onError={(e) => {
                  e.target.src = '/assets/default.jpg';
                }}
              />
              {rec.duration && <span className="duration-badge">{rec.duration}</span>}
            </div>
            <div className="recommendation-details">
              <h3>{rec.type} Content</h3>
              <div className="recommendation-meta">
                <span className="recommendation-score">
                  Match: {(rec.score * 100).toFixed(1)}%
                </span>
                <span className="recommendation-type">{rec.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card recommendations">
            <div className="card-header">
              <h2>Recommended for You</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/search')}>View All</button>
            </div>
            <div className="card-content">
              {renderRecommendations()}
            </div>
          </div>

          <div className="dashboard-card recent-activity">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/activity')}>View All</button>
            </div>
            <div className="card-content">
              {recentActivity.length > 0 ? (
                <ul className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <li key={`${activity.id}-${activity.type}-${index}`} className="activity-item" onClick={() => handleOpenResource(activity.url)}>
                      <div className="activity-icon">
                        {activity.type === 'youtube' && <div className="resource-icon youtube"></div>}
                        {activity.type === 'book' && <div className="resource-icon book"></div>}
                      </div>
                      <div className="activity-details">
                        <h3>{activity.title}</h3>
                        <div className="activity-meta">
                          <span className="activity-type">
                            {activity.type === 'youtube' ? 'YouTube Video' : 'Book'}
                          </span>
                          <span className="activity-date">{getRelativeTime(activity.timestamp)}</span>
                        </div>
                        {activity.description && (
                          <p className="activity-description">{activity.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-activity">
                  <p>No recent activity</p>
                  <p className="empty-activity-hint">
                    Search for YouTube videos or books to see your activity here
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-card calendar">
            <div className="card-header">
              <h2>Calendar</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/notes')}>View All</button>
            </div>
            <div className="card-content calendar-content">
              <StudySyncCalendar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 