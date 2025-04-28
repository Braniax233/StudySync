import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import StudySyncCalendar from '../components/Calendar/Calendar';
import { bookmarkService } from '../services/bookmarkService';
import { recentActivityService } from '../services/cacheService';
import RecommendationModel from '../components/RecommendationModel';
import { populateTestData } from '../services/testData';
import '../styles/Dashboard.css';

// Create a singleton instance of the recommendation model
const recommendationModel = new RecommendationModel();

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to get content details for a specific type
  const getContentForType = (type, recentActivity, bookmarks) => {
    // Combine recent activity and bookmarks, with most recent items first
    const allContent = [...recentActivity, ...bookmarks]
      .filter(item => (item.type === 'youtube' && type === 'video') || item.type === type)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Return the first match if available
    return allContent.length > 0 ? allContent[0] : null;
  };
  
  // Load data from services
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard data...');

        // Load bookmarks
        const loadedBookmarks = await bookmarkService.getBookmarks();
        console.log('Loaded bookmarks:', loadedBookmarks);
        
        // Load recent activity from cache
        const activities = recentActivityService.getActivities(10);
        console.log('Loaded activities:', activities);

        // Transform data for the model
        const transformData = (activities, bookmarks) => {
          const transformedActivities = activities.map(activity => ({
            ...activity,
            type: activity.type === 'youtube' ? 'video' : activity.type,
            category: activity.category || 'general',
            tags: activity.tags || [],
            timestamp: activity.timestamp || Date.now()
          }));

          const transformedBookmarks = (bookmarks || []).map(bookmark => ({
            ...bookmark,
            type: bookmark.type === 'youtube' ? 'video' : bookmark.type,
            category: bookmark.category || 'general',
            tags: bookmark.tags || [],
            timestamp: new Date(bookmark.dateAdded).getTime() || Date.now()
          }));

          return {
            recentActivity: transformedActivities,
            bookmarks: transformedBookmarks
          };
        };

        // If no real data exists, populate with test data
        if (activities.length === 0 && (!loadedBookmarks || loadedBookmarks.length === 0)) {
          console.log('No real data found, populating test data...');
          populateTestData();
          
          // Wait for test data to be populated (all timeouts to complete)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Reload data
          const testActivities = recentActivityService.getActivities(10);
          const testBookmarks = await bookmarkService.getBookmarks();
          
          console.log('Loaded test activities:', testActivities);
          console.log('Loaded test bookmarks:', testBookmarks);
          
          setBookmarks(testBookmarks || []);
          setRecentActivity(testActivities);
          
          // Transform and train with test data
          const transformedData = transformData(testActivities, testBookmarks);
          console.log('Training model with test data:', transformedData);

          // Ensure we have enough data for training
          if (transformedData.recentActivity.length === 0 && transformedData.bookmarks.length === 0) {
            console.log('No data available for training');
            setRecommendations([]);
            return;
          }

          // Use the renamed method trainSimpleModel
          const trained = await recommendationModel.trainSimpleModel(transformedData);
          if (!trained) {
            console.warn('Could not train model with test data, using default recommendations');
          }
          
          const testRecommendations = await recommendationModel.getRecommendations(transformedData);
          console.log('Generated test recommendations:', testRecommendations);
          setRecommendations(testRecommendations);
        } else {
          // Use real data
          console.log('Using real data for recommendations');
          setBookmarks(loadedBookmarks || []);
          setRecentActivity(activities);

          // Transform and train with real data
          const transformedData = transformData(activities, loadedBookmarks);
          console.log('Training model with real data:', transformedData);

          // Ensure we have enough data for training
          if (transformedData.recentActivity.length === 0 && transformedData.bookmarks.length === 0) {
            console.log('No data available for training');
            setRecommendations([]);
            return;
          }

          // Use the renamed method trainSimpleModel instead of trainModel
          const trained = await recommendationModel.trainSimpleModel(transformedData);
          if (!trained) {
            console.warn('Could not train model with real data, using similarity-based recommendations');
          }
          
          const realRecommendations = await recommendationModel.getRecommendations(transformedData);
          console.log('Generated real recommendations:', realRecommendations);
          setRecommendations(realRecommendations);
        }

        setError(null);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError(error.message);
        setBookmarks([]);
        setRecommendations([]);
        recommendationModel.cleanup(); // Use cleanup instead of disposeModel
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    // Cleanup function
    return () => {
      recommendationModel.cleanup();
    };
  }, []);

  // Add effect to refresh recent activity periodically
  useEffect(() => {
    // Refresh recent activity every 2 seconds
    const intervalId = setInterval(() => {
      const activities = recentActivityService.getActivities(10);
      setRecentActivity(activities);
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };
  
  const handleOpenResource = (url) => {
    window.open(url, '_blank');
  };
  
  const handleDeleteBookmark = async (bookmark) => {
    try {
      await bookmarkService.removeBookmark(bookmark.id, bookmark.type);
      // Update the bookmarks state to remove the deleted bookmark
      setBookmarks(prevBookmarks => prevBookmarks.filter(b => 
        !(b.id === bookmark.id && b.type === bookmark.type)
      ));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      setError('Failed to delete bookmark');
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

  const RecommendationCard = ({ recommendation, recentActivity, bookmarks }) => {
    const { type, score } = recommendation;
    const matchingContent = getContentForType(type, recentActivity, bookmarks);
    const displayScore = Math.round(score * 100);
    
    const defaultThumbnails = {
      video: '/assets/video.jpg',
      article: '/assets/article.jpg',
      book: '/assets/book.jpg',
      course: '/assets/course.jpg',
      documentation: '/assets/documentation.jpg'
    };

    const handleClick = () => {
      if (matchingContent?.url) {
        window.open(matchingContent.url, '_blank', 'noopener,noreferrer');
      }
    };
    
    return (
      <div className="recommendation-card" onClick={handleClick}>
        {matchingContent ? (
          <>
            <div className="recommendation-thumbnail">
              <img 
                src={matchingContent.thumbnail || defaultThumbnails[type]} 
                alt={matchingContent.title}
                onError={(e) => {
                  e.target.src = defaultThumbnails[type];
                }}
              />
            </div>
            <div className="recommendation-content">
              <h3>{matchingContent.title}</h3>
              <p className="recommendation-type">{type.charAt(0).toUpperCase() + type.slice(1)}</p>
              <div className="recommendation-score">
                <div className="score-bar" style={{ width: `${displayScore}%` }}></div>
                <span>{displayScore}% Match</span>
              </div>
              {matchingContent.description && (
                <p className="recommendation-description">{matchingContent.description.slice(0, 100)}...</p>
              )}
              {matchingContent.tags && matchingContent.tags.length > 0 && (
                <div className="recommendation-tags">
                  {matchingContent.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="recommendation-content">
            <div className="recommendation-thumbnail">
              <img 
                src={defaultThumbnails[type]}
                alt={`New ${type} recommendation`}
              />
            </div>
            <h3>Recommended {type.charAt(0).toUpperCase() + type.slice(1)} Content</h3>
            <p className="recommendation-description">
              Based on your interests, we recommend exploring new {type} content.
            </p>
            <div className="recommendation-score">
              <div className="score-bar" style={{ width: `${displayScore}%` }}></div>
              <span>{displayScore}% Match</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (loading) {
      return <div className="loading">Loading recommendations...</div>;
    }

    if (error) {
      return <div className="error">{error}</div>;
    }

    if (!recommendations || recommendations.length === 0) {
      return <div className="no-recommendations">No recommendations available yet. Try exploring more content!</div>;
    }

    return (
      <div className="recommendations-grid">
        {recommendations.map((recommendation, index) => (
          <RecommendationCard 
            key={index}
            recommendation={recommendation}
            recentActivity={recentActivity}
            bookmarks={bookmarks}
          />
        ))}
      </div>
    );
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
              <button className="view-all-button" onClick={() => handleNavigate('/recommendations')}>View All</button>
            </div>
            <div className="card-content">
              {renderRecommendations()}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBookmark(bookmark);
                        }}
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
