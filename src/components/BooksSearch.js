import React, { useState } from 'react';
import axios from '../utils/axiosConfig';
import { booksSearchCache } from '../services/cacheService';
import '../styles/BooksSearch.css';

const BooksSearch = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Check cache first
      const cachedResults = booksSearchCache.get(query);
      
      if (cachedResults) {
        // Use cached results
        setBooks(cachedResults);
        setLoading(false);
        return;
      }
      
      // If not in cache, make API request
      console.log('Sending request to:', `/api/books/search?query=${encodeURIComponent(query)}`);
      const response = await axios.get(`/api/books/search?query=${encodeURIComponent(query)}`);
      console.log('Response received:', response);
      
      const bookResults = response.data.data;
      setBooks(bookResults);
      
      // Cache the results
      booksSearchCache.set(query, bookResults);
    } catch (error) {
      console.error('Search error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.details || error.response?.data?.error || 'Failed to search books';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClick = (book, linkType) => {
    // Add to recent activity when a book is clicked
    booksSearchCache.addToRecent(book);
    
    // Open the appropriate link in a new tab
    const url = linkType === 'preview' ? book.previewLink : book.infoLink;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="books-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for educational books..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <button
          type="submit"
          className="search-button"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="books-grid">
        {books.map((book) => (
          <div key={book.id} className="book-card">
            {book.thumbnail ? (
              <img 
                src={book.thumbnail} 
                alt={book.title} 
                className="book-thumbnail" 
                onClick={() => handleBookClick(book, 'info')}
              />
            ) : (
              <div 
                className="book-thumbnail-placeholder"
                onClick={() => handleBookClick(book, 'info')}
              >
                No Image
              </div>
            )}
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-authors">{book.authors.join(', ')}</p>
              <p className="book-description">
                {book.description ? (
                  book.description.length > 150 
                    ? `${book.description.substring(0, 150)}...` 
                    : book.description
                ) : 'No description available'}
              </p>
              <div className="book-details">
                <span>Published: {book.publishedDate}</span>
                {book.pageCount > 0 && <span> • {book.pageCount} pages</span>}
                {book.averageRating > 0 && (
                  <span> • Rating: {book.averageRating}/5 ({book.ratingsCount} reviews)</span>
                )}
              </div>
              <div className="book-links">
                {book.previewLink && (
                  <button
                    onClick={() => handleBookClick(book, 'preview')}
                    className="preview-button"
                  >
                    Preview
                  </button>
                )}
                {book.infoLink && (
                  <button
                    onClick={() => handleBookClick(book, 'info')}
                    className="info-button"
                  >
                    More Info
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksSearch;
