import React, { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';
import '../styles/BookmarksPage.css';

const BookmarksPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample bookmarks data
  const bookmarksData = [
    { 
      id: 1, 
      title: 'Introduction to Machine Learning', 
      type: 'Video', 
      category: 'Computer Science',
      source: 'YouTube',
      dateAdded: '2025-02-15',
      tags: ['AI', 'ML', 'Beginner']
    },
    { 
      id: 2, 
      title: 'Advanced Data Structures and Algorithms', 
      type: 'PDF', 
      category: 'Computer Science',
      source: 'MIT OpenCourseWare',
      dateAdded: '2025-02-20',
      tags: ['DSA', 'Advanced', 'Programming']
    },
    { 
      id: 3, 
      title: 'Calculus Made Easy', 
      type: 'Book', 
      category: 'Mathematics',
      source: 'Project Gutenberg',
      dateAdded: '2025-01-10',
      tags: ['Math', 'Calculus', 'Beginner']
    },
    { 
      id: 4, 
      title: 'Web Development Fundamentals', 
      type: 'Course', 
      category: 'Web Development',
      source: 'Udemy',
      dateAdded: '2025-02-28',
      tags: ['HTML', 'CSS', 'JavaScript', 'Beginner']
    },
    { 
      id: 5, 
      title: 'React Hooks in Depth', 
      type: 'Article', 
      category: 'Web Development',
      source: 'Medium',
      dateAdded: '2025-03-01',
      tags: ['React', 'JavaScript', 'Intermediate']
    }
  ];

  // Filter bookmarks based on active tab and search query
  const filteredBookmarks = bookmarksData.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'videos') return bookmark.type === 'Video' && matchesSearch;
    if (activeTab === 'articles') return bookmark.type === 'Article' && matchesSearch;
    if (activeTab === 'books') return bookmark.type === 'Book' && matchesSearch;
    if (activeTab === 'courses') return bookmark.type === 'Course' && matchesSearch;
    return false;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRemoveBookmark = (id) => {
    // In a real app, this would remove the bookmark from the database
    console.log(`Removing bookmark with id: ${id}`);
  };

  const handleViewBookmark = (bookmark) => {
    // In a real app, this would navigate to the resource
    console.log(`Viewing bookmark: ${bookmark.title}`);
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
                className={`filter-tab ${activeTab === 'articles' ? 'active' : ''}`}
                onClick={() => handleTabChange('articles')}
              >
                Articles
              </button>
              <button 
                className={`filter-tab ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => handleTabChange('books')}
              >
                Books
              </button>
              <button 
                className={`filter-tab ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => handleTabChange('courses')}
              >
                Courses
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
          {filteredBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bookmark-item">
              <div className="bookmark-icon">
                {bookmark.type === 'Video' && <div className="resource-icon video"></div>}
                {bookmark.type === 'PDF' && <div className="resource-icon pdf"></div>}
                {bookmark.type === 'Book' && <div className="resource-icon book"></div>}
                {bookmark.type === 'Course' && <div className="resource-icon course"></div>}
                {bookmark.type === 'Article' && <div className="resource-icon article"></div>}
              </div>
              <div className="bookmark-details">
                <h3>{bookmark.title}</h3>
                <div className="bookmark-meta">
                  <span className="bookmark-type">{bookmark.type}</span>
                  <span className="bookmark-category">{bookmark.category}</span>
                </div>
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
                  onClick={() => handleRemoveBookmark(bookmark.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
