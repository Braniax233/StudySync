# StudySync Frontend Integration Guide

This guide provides instructions for integrating the React frontend with the StudySync Node.js/Express backend API.

## Table of Contents
1. [API Service Setup](#api-service-setup)
2. [Authentication Integration](#authentication-integration)
3. [Protected Routes](#protected-routes)
4. [Data Services Integration](#data-services-integration)
5. [Error Handling](#error-handling)

## API Service Setup

Create a new file `src/services/api.js` to handle API requests:

```javascript
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Authentication Integration

Create an authentication context in `src/context/AuthContext.js`:

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on page load
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setCurrentUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.post('/users/register', userData);
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await api.post('/users/login', { email, password });
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      setCurrentUser(data.user);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      const { data } = await api.put('/users/profile', userData);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setCurrentUser(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

## Protected Routes

Create a protected route component in `src/components/ProtectedRoute.js`:

```javascript
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

Update your router configuration in `src/App.js`:

```javascript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
// ... other imports

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/notes" element={<NotesPage />} />
            {/* Add other protected routes here */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Data Services Integration

Replace the localStorage-based data services with API-based services:

### Notes Service

Create `src/services/notesService.js`:

```javascript
import api from './api';

export const notesService = {
  // Get all notes
  getNotes: async () => {
    const { data } = await api.get('/notes');
    return data;
  },

  // Get note by ID
  getNoteById: async (id) => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },

  // Create new note
  createNote: async (note) => {
    const { data } = await api.post('/notes', note);
    return data;
  },

  // Update note
  updateNote: async (id, note) => {
    const { data } = await api.put(`/notes/${id}`, note);
    return data;
  },

  // Delete note
  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    return id;
  },

  // Toggle share status
  toggleShareNote: async (id) => {
    const { data } = await api.put(`/notes/${id}/share`);
    return data;
  },

  // Search notes
  searchNotes: async (query) => {
    const { data } = await api.get(`/notes/search?query=${query}`);
    return data;
  }
};
```

### Events Service

Create `src/services/eventsService.js`:

```javascript
import api from './api';

export const eventsService = {
  // Get all events
  getEvents: async () => {
    const { data } = await api.get('/events');
    return data;
  },

  // Get events by date
  getEventsByDate: async (date) => {
    const { data } = await api.get(`/events/date/${date}`);
    return data;
  },

  // Get event by ID
  getEventById: async (id) => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },

  // Create new event
  createEvent: async (event) => {
    const { data } = await api.post('/events', event);
    return data;
  },

  // Update event
  updateEvent: async (id, event) => {
    const { data } = await api.put(`/events/${id}`, event);
    return data;
  },

  // Delete event
  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`);
    return id;
  }
};
```

### Resources Service

Create `src/services/resourcesService.js`:

```javascript
import api from './api';

export const resourcesService = {
  // Get all resources
  getResources: async () => {
    const { data } = await api.get('/resources');
    return data;
  },

  // Get resource by ID
  getResourceById: async (id) => {
    const { data } = await api.get(`/resources/${id}`);
    return data;
  },

  // Create new resource
  createResource: async (resource) => {
    const { data } = await api.post('/resources', resource);
    return data;
  },

  // Update resource
  updateResource: async (id, resource) => {
    const { data } = await api.put(`/resources/${id}`, resource);
    return data;
  },

  // Delete resource
  deleteResource: async (id) => {
    await api.delete(`/resources/${id}`);
    return id;
  },

  // Search resources
  searchResources: async (query) => {
    const { data } = await api.get(`/resources/search?query=${query}`);
    return data;
  }
};
```

### Bookmarks Service

Create `src/services/bookmarksService.js`:

```javascript
import api from './api';

export const bookmarksService = {
  // Get all bookmarks
  getBookmarks: async () => {
    const { data } = await api.get('/bookmarks');
    return data;
  },

  // Get bookmark by ID
  getBookmarkById: async (id) => {
    const { data } = await api.get(`/bookmarks/${id}`);
    return data;
  },

  // Create new bookmark
  createBookmark: async (bookmark) => {
    const { data } = await api.post('/bookmarks', bookmark);
    return data;
  },

  // Update bookmark
  updateBookmark: async (id, bookmark) => {
    const { data } = await api.put(`/bookmarks/${id}`, bookmark);
    return data;
  },

  // Delete bookmark
  deleteBookmark: async (id) => {
    await api.delete(`/bookmarks/${id}`);
    return id;
  }
};
```

## Error Handling

Create a reusable error handling component in `src/components/ErrorAlert.js`:

```javascript
import React from 'react';

const ErrorAlert = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Error: </strong>
      <span className="block sm:inline">{error}</span>
      {onClose && (
        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={onClose}>
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </span>
      )}
    </div>
  );
};

export default ErrorAlert;
```

Example usage in a component:

```javascript
import React, { useState, useEffect } from 'react';
import { notesService } from '../services/notesService';
import ErrorAlert from '../components/ErrorAlert';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        const data = await notesService.getNotes();
        setNotes(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      
      <ErrorAlert error={error} onClose={() => setError(null)} />
      
      {loading ? (
        <div className="loading">Loading notes...</div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <h2>{note.title}</h2>
              {/* Note content */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesPage;
```

## Migration Steps

1. Install required dependencies:
   ```bash
   npm install axios
   ```

2. Create the API service and authentication context

3. Update your components to use the API services instead of localStorage

4. Test the integration by running both the backend and frontend servers

5. Update environment variables in your frontend:
   Create a `.env` file in your React app root:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

6. For production deployment, update the API URL accordingly
