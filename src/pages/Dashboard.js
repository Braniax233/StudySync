import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navigation/Navbar';
import StudySyncCalendar from '../components/Calendar/Calendar';
import { resourcesService, bookmarksService } from '../services/dataService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Load data from services
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load resources
        const loadedResources = await resourcesService.getResources();
        if (Array.isArray(loadedResources)) {
          setResources(loadedResources);
        } else {
          console.error('Resources data is not an array:', loadedResources);
          setResources([]);
        }
        
        // Load bookmarks
        const loadedBookmarks = await bookmarksService.getBookmarks();
        if (Array.isArray(loadedBookmarks)) {
          setBookmarks(loadedBookmarks);
        } else {
          console.error('Bookmarks data is not an array:', loadedBookmarks);
          setBookmarks([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setResources([]);
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

  return (
    <div className="dashboard-page">
      <Navbar />
      
      <div className="dashboard-content">
        <p className="welcome-message">Continue your learning journey with StudySync</p>

        <div className="dashboard-grid">
          <div className="dashboard-card recent-activity">
            <div className="card-header">
              <h2>Recent Activity</h2>
              <button className="view-all-button" onClick={() => handleNavigate('/locate')}>View All</button>
            </div>
            <div className="card-content">
              <ul className="activity-list">
                {resources.map(resource => (
                  <li key={resource.id} className="activity-item" onClick={() => handleOpenResource(resource.url)}>
                    <div className="activity-icon">
                      {resource.type === 'YouTube Course' && <div className="resource-icon youtube"></div>}
                      {resource.type === 'PDF' && <div className="resource-icon pdf"></div>}
                      {resource.type === 'Online Course' && <div className="resource-icon course"></div>}
                    </div>
                    <div className="activity-details">
                      <h3>{resource.title}</h3>
                      <div className="activity-meta">
                        <span className="activity-type">{resource.type}</span>
                        <span className="activity-date">{resource.date}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
