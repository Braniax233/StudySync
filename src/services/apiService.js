/**
 * API Service for StudySync
 * Handles all HTTP requests to the backend API
 */

import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studysync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('studysync_token');
      localStorage.removeItem('studysync_user');
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.success) {
      localStorage.setItem('studysync_token', response.data.token);
      localStorage.setItem('studysync_user', JSON.stringify(response.data.user));
    }
    return response;
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem('studysync_user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  },
  
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.success) {
      localStorage.setItem('studysync_token', response.data.token);
      localStorage.setItem('studysync_user', JSON.stringify(response.data.user));
    }
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('studysync_token');
    localStorage.removeItem('studysync_user');
  },
  
  updateProfile: async (profileData) => {
    const token = getAuthToken();
    return await api.put('/users/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  
  resetPassword: async (email) => {
    return await api.post('/users/reset-password', { email });
  }
};

// Profile API endpoints
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    if (response.data.success) {
      // Update stored user data
      localStorage.setItem('studysync_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  updateStats: async (statsData) => {
    const response = await api.put('/users/stats', statsData);
    return response;
  }
};

// Notes API
export const notesAPI = {
  getNotes: async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Getting notes with token:', token ? 'Token available' : 'No token');
      const response = await api.get('/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error('API Error - getNotes:', error);
      throw error;
    }
  },
  
  getNote: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.get(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error(`API Error - getNote ${id}:`, error);
      throw error;
    }
  },
  
  createNote: async (note) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('API createNote - token available:', !!token);
      console.log('API createNote - note data:', note);
      
      const response = await api.post('/notes', note, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API createNote - response:', response);
      return response;
    } catch (error) {
      console.error('API Error - createNote:', error);
      console.error('API Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  updateNote: async (id, note) => {
    try {
      console.log('Updating note with ID:', id);
      console.log('Note data being sent:', note);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      if (!id) {
        throw new Error('Note ID is required for update');
      }
      
      const response = await api.put(`/notes/${id}`, note, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error(`API Error - updateNote ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  deleteNote: async (id) => {
    try {
      console.log('Deleting note with ID:', id);
      
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      if (!id) {
        throw new Error('Note ID is required for deletion');
      }
      
      const response = await api.delete(`/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error(`API Error - deleteNote ${id}:`, error);
      console.error('Error details:', error.response?.data || error.message);
      throw error;
    }
  },
  
  shareNote: async (id) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.put(`/notes/${id}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error(`API Error - shareNote ${id}:`, error);
      throw error;
    }
  },
  
  searchNotes: async (query) => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await api.get(`/notes/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response;
    } catch (error) {
      console.error(`API Error - searchNotes "${query}":`, error);
      throw error;
    }
  }
};

// Events API
export const eventsAPI = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  getEventsByDate: async (date) => {
    const response = await api.get(`/events/date/${date}`);
    return response.data;
  },
  
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },
  
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },
  
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

// Resources API
export const resourcesAPI = {
  getResources: async () => {
    const response = await api.get('/resources');
    return response.data;
  },
  
  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  
  createResource: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },
  
  updateResource: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },
  
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};

// Bookmarks API
export const bookmarksAPI = {
  getBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data;
  },
  
  getBookmark: async (id) => {
    const response = await api.get(`/bookmarks/${id}`);
    return response.data;
  },
  
  createBookmark: async (bookmarkData) => {
    const response = await api.post('/bookmarks', bookmarkData);
    return response.data;
  },
  
  updateBookmark: async (id, bookmarkData) => {
    const response = await api.put(`/bookmarks/${id}`, bookmarkData);
    return response.data;
  },
  
  deleteBookmark: async (id) => {
    const response = await api.delete(`/bookmarks/${id}`);
    return response.data;
  },
};

const getAuthToken = () => {
  return localStorage.getItem('studysync_token');
}

// Create an api service object
const apiService = {
  api,
  authAPI,
  profileAPI,
  notesAPI,
  eventsAPI,
  resourcesAPI,
  bookmarksAPI
};

export default apiService;
