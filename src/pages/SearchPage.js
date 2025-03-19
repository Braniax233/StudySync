import React, { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';
import YouTubeSearch from '../components/YouTubeSearch';
import BooksSearch from '../components/BooksSearch';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('youtube');
  
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
              className={`tab ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              YouTube Videos
            </button>
            <button 
              className={`tab ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              Educational Books
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'youtube' ? (
              <YouTubeSearch />
            ) : (
              <BooksSearch />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
