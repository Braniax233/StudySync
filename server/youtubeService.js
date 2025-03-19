const { google } = require('googleapis');

// Debug: Print all environment variables (excluding sensitive data)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  HAS_YOUTUBE_KEY: !!process.env.YOUTUBE_API_KEY,
  YOUTUBE_KEY_LENGTH: process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.length : 0
});

// Create YouTube API client
console.log('Creating YouTube API client with key length:', process.env.YOUTUBE_API_KEY ? process.env.YOUTUBE_API_KEY.length : 0);
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

async function searchYouTube(query) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      throw new Error('YouTube API key is not configured in environment variables');
    }

    console.log('Starting YouTube search with query:', query);
    console.log('Using API key with length:', process.env.YOUTUBE_API_KEY.length);
    
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      maxResults: 10,
      type: 'video'
    });

    console.log('YouTube API response received with', response.data.items.length, 'items');
    
    if (!response.data.items || response.data.items.length === 0) {
      console.log('No results found for query:', query);
      return [];
    }
    
    return response.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));
  } catch (error) {
    console.error('Error in searchYouTube:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
    throw error;
  }
}

module.exports = { searchYouTube };
