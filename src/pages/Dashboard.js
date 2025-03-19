import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import StudySyncCalendar from '../components/Calendar/Calendar';
import { bookmarksService } from '../services/dataService';
import { recentActivityService } from '../services/cacheService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Load data from services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load bookmarks
        const loadedBookmarks = await bookmarksService.getBookmarks();
        if (Array.isArray(loadedBookmarks)) {
          setBookmarks(loadedBookmarks);
        } else {
          console.error('Bookmarks data is not an array:', loadedBookmarks);
          setBookmarks([]);
        }
        
        // Load recent activity from cache
        const activities = recentActivityService.getActivities(5);
        setRecentActivity(activities);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setBookmarks([]);
      }
    };
    
    fetchData();
    
    // Sample recommendations data - in a real app, this would come from an API
    setRecommendations([
      { 
        id: 1, 
        title: 'Python for Data Science', 
        type: 'YouTube Course',
        channel: 'Tech Academy',
        duration: '4h 30m',
        image: '/assets/recommendation.jpg'
      },
      { 
        id: 2, 
        title: 'Algorithms and Data Structures', 
        type: 'Online Textbook',
        author: 'Dr. Jane Smith',
        pages: '342 pages',
        image: '/assets/resource.jpg'
      },
      { 
        id: 3, 
        title: 'Full Stack Web Development', 
        type: 'YouTube Course',
        channel: 'Code Masters',
        duration: '10h 15m',
        image: '/assets/recommendation.jpg'
      }
    ]);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };
  
  const handleOpenResource = (url) => {
    window.open(url, '_blank');
  };
  
  const handleDeleteBookmark = (id) => {
    if (window.confirm('Are you sure you want to delete this bookmark?')) {
      bookmarksService.deleteBookmark(id);
      setBookmarks(bookmarks.filter(bookmark => bookmark.id !== id));
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

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-content">
        <p className="welcome-message">Continue your learning journey with StudySync</p>

        <div className="dashboard-grid">
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

          <div className="dashboard-card recommendations">
            <div className="card-header">
              <h2>Recommended for You</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/search')}>View All</button>
            </div>
            <div className="card-content">
              <div className="recommendations-grid">
                {recommendations.map(item => (
                  <div key={item.id} className="recommendation-card">
                    <div className="recommendation-image">
                      <img src={item.image} alt={item.title} />
                      {item.duration && (
                        <span className="duration-badge">{item.duration}</span>
                      )}
                    </div>
                    <div className="recommendation-details">
                      <h3>{item.title}</h3>
                      <div className="recommendation-meta">
                        <span className="recommendation-type">{item.type}</span>
                        {item.channel && <span className="recommendation-channel">{item.channel}</span>}
                        {item.author && <span className="recommendation-author">{item.author}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-card saved-bookmarks">
            <div className="card-header">
              <h2>Saved Bookmarks</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/bookmarks')}>View All</button>
            </div>
            <div className="card-content">
              {bookmarks.length > 0 ? (
                <ul className="bookmarks-list">
                  {bookmarks.map(bookmark => (
                    <li key={bookmark.id} className="bookmark-item">
                      <div className="bookmark-content" onClick={() => handleOpenResource(bookmark.url)}>
                        <h3 className="bookmark-title">{bookmark.title}</h3>
                        <span className="bookmark-date">Added: {formatDate(bookmark.dateAdded)}</span>
                      </div>
                      <button 
                        className="delete-bookmark-button"
                        onClick={() => handleDeleteBookmark(bookmark.id)}
                        title="Delete bookmark"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-bookmarks">
                  <p>No bookmarks saved yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
