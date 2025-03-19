import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import { recentActivityService } from '../services/cacheService';
import '../styles/RecentActivityPage.css';

const RecentActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all recent activities (no limit)
    const loadedActivities = recentActivityService.getActivities();
    setActivities(loadedActivities);
    setLoading(false);
  }, []);

  const handleOpenResource = (url) => {
    window.open(url, '_blank');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your activity history?')) {
      recentActivityService.clearActivities();
      setActivities([]);
    }
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
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="recent-activity-page">
      <Navbar />
      <div className="recent-activity-content">
        <div className="page-header">
          <h1>Recent Activity</h1>
          {activities.length > 0 && (
            <button 
              className="clear-history-button"
              onClick={handleClearHistory}
            >
              Clear History
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-indicator">Loading your activity...</div>
        ) : activities.length > 0 ? (
          <div className="activity-list-container">
            <ul className="activity-list">
              {activities.map((activity, index) => (
                <li 
                  key={`${activity.id}-${activity.type}-${index}`} 
                  className="activity-item"
                  onClick={() => handleOpenResource(activity.url)}
                >
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
                    {activity.thumbnail && (
                      <div className="activity-thumbnail">
                        <img src={activity.thumbnail} alt={activity.title} />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="empty-activity">
            <p>No recent activity</p>
            <p className="empty-activity-hint">
              Search for YouTube videos or books to see your activity here
            </p>
            <button 
              className="explore-button"
              onClick={() => navigate('/search')}
            >
              Explore Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityPage;
