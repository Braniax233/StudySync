import React, { useState } from 'react';
import Navbar from '../components/Navigation/Navbar';
import '../styles/ResourceLocator.css';

const ResourceLocator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample popular books
  const popularBooks = [
    "Introduction to Algorithms",
    "Clean Code",
    "Design Patterns",
    "Artificial Intelligence",
    "The Pragmatic Programmer"
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would search for books
    console.log(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="resource-locator-page">
      <Navbar />
      
      <div className="locator-content">
        <div className="locator-hero">
          <h1>Resource Locator</h1>
          <p className="locator-subtitle">
            Find physical books in nearby libraries and bookstores with real-time availability
          </p>
          
          <form onSubmit={handleSearch} className="locator-search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a book by title, author, or ISBN"
              className="search-input"
            />
            <button type="submit" className="search-button">
              <i className="search-icon"></i>
              Search
            </button>
          </form>
        </div>
        
        <div className="popular-books-section">
          <h2>Popular Books</h2>
          <div className="popular-books-list">
            {popularBooks.map((book, index) => (
              <div key={index} className="popular-book-item">
                {book}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceLocator;
