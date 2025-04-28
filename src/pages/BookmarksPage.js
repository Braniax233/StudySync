import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navigation/Navbar';
import { bookmarkService } from '../services/bookmarkService';
import '../styles/BookmarksPage.css';

const BookmarksPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  
  // Load bookmarks on component mount
  useEffect(() => {
    const loadBookmarks = () => {
      const allBookmarks = bookmarkService.getBookmarks();
      setBookmarks(allBookmarks);
    };
    
    loadBookmarks();
  }, []);

  // Filter bookmarks based on active tab and search query
  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (bookmark.description && bookmark.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'videos') return bookmark.type === 'youtube' && matchesSearch;
    if (activeTab === 'books') return bookmark.type === 'book' && matchesSearch;
    return false;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveBookmark = (bookmark) => {
    const success = bookmarkService.removeBookmark(bookmark.id, bookmark.type);
    if (success) {
      setBookmarks(bookmarks.filter(b => 
        !(b.id === bookmark.id && b.type === bookmark.type)
      ));
    }
  };

  const handleViewBookmark = (bookmark) => {
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bookmarks-page">
      <Navbar />
      
      <div className="bookmarks-content">
        <div className="bookmarks-header">
          <h1>Saved Bookmarks</h1>
          
          <div className="bookmarks-filter">
            <div className="filter-tabs">
              <button 
                className={`filter-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                All
              </button>
              <button 
                className={`filter-tab ${activeTab === 'videos' ? 'active' : ''}`}
                onClick={() => handleTabChange('videos')}
              >
                Videos
              </button>
              <button 
                className={`filter-tab ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => handleTabChange('books')}
              >
                Books
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search bookmarks..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button className="search-button">
                <i className="search-icon"></i>
              </button>
            </div>
          </div>
        </div>
        
        <div className="bookmarks-list">
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map(bookmark => (
              <div key={`${bookmark.id}-${bookmark.type}`} className="bookmark-item">
                <div className="bookmark-icon">
                  {bookmark.type === 'youtube' && <div className="resource-icon video"></div>}
                  {bookmark.type === 'book' && <div className="resource-icon book"></div>}
                </div>
                <div className="bookmark-details">
                  <h3>{bookmark.title}</h3>
                  <div className="bookmark-meta">
                    <span className="bookmark-type">
                      {bookmark.type === 'youtube' ? 'YouTube Video' : 'Book'}
                    </span>
                    <span className="bookmark-date">
                      Added: {new Date(bookmark.dateAdded).toLocaleDateString()}
                    </span>
                  </div>
                  {bookmark.description && (
                    <p className="bookmark-description">{bookmark.description}</p>
                  )}
                </div>
                <div className="bookmark-actions">
                  <button 
                    className="action-button view" 
                    onClick={() => handleViewBookmark(bookmark)}
                  >
                    View
                  </button>
                  <button 
                    className="action-button remove" 
                    onClick={() => handleRemoveBookmark(bookmark)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-bookmarks">
              <p>No bookmarks found</p>
              <p className="empty-bookmarks-hint">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Start by searching for videos or books to bookmark'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
