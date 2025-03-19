const axios = require('axios');

// Google Books API base URL
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Search for books using the Google Books API
 * @param {string} query - The search query
 * @param {number} maxResults - Maximum number of results to return (default: 10)
 * @returns {Promise<Array>} - Array of book objects
 */
async function searchBooks(query, maxResults = 10) {
  try {
    console.log('Starting Google Books search with query:', query);
    
    // Prepare request parameters - simplified query for better results
    const params = {
      q: query,
      maxResults,
      printType: 'books',
    };
    
    // Add API key if available
    if (process.env.GOOGLE_BOOKS_API_KEY) {
      console.log('Using Google Books API key');
      params.key = process.env.GOOGLE_BOOKS_API_KEY;
    } else {
      console.log('No Google Books API key found, using public access');
    }
    
    const response = await axios.get(GOOGLE_BOOKS_API_URL, { params });

    console.log('Google Books API response received with', response.data.items?.length || 0, 'items');
    
    if (!response.data.items || response.data.items.length === 0) {
      console.log('No results found for query:', query);
      return [];
    }
    
    // Map the response to a more usable format
    return response.data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors || ['Unknown Author'],
      description: item.volumeInfo.description || 'No description available',
      thumbnail: item.volumeInfo.imageLinks?.thumbnail || '',
      previewLink: item.volumeInfo.previewLink || '',
      infoLink: item.volumeInfo.infoLink || '',
      publishedDate: item.volumeInfo.publishedDate || 'Unknown',
      publisher: item.volumeInfo.publisher || 'Unknown Publisher',
      pageCount: item.volumeInfo.pageCount || 0,
      categories: item.volumeInfo.categories || [],
      averageRating: item.volumeInfo.averageRating || 0,
      ratingsCount: item.volumeInfo.ratingsCount || 0
    }));
  } catch (error) {
    console.error('Error in searchBooks:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    throw error;
  }
}

module.exports = { searchBooks };
