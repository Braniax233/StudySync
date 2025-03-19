import React, { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';
import YouTubeSearch from '../components/YouTubeSearch';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  
  // Sample popular search topics
  const popularTopics = [
    "Machine Learning for beginners",
    "Web Development fundamentals",
    "Data Structures and Algorithms",
    "Calculus tutorial",
    "Python programming"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search for resources
    console.log(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="search-page">
      <Navbar />
      
      <div className="search-content">
        <div className="search-hero">
          <h1>AI-Powered Academic Resource Finder</h1>
          <p className="search-subtitle">
            Find the best YouTube courses, PDFs, online textbooks, and physical books based on your interests
          </p>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              General Search
            </button>
            <button 
              className={`tab ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              YouTube Videos
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'general' ? (
              <>
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What would you like to learn today? (e.g., 'Machine Learning for beginners')"
                    className="search-input"
                  />
                  <button type="submit" className="search-button">
                    <i className="search-icon"></i>
                    Search
                  </button>
                </form>
                
                <div className="popular-topics-section">
                  <h2>Popular Search Topics</h2>
                  <div className="popular-topics-list">
                    {popularTopics.map((topic, index) => (
                      <div key={index} className="popular-topic-item">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <YouTubeSearch />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
