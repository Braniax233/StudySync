# StudySync Frontend-Backend Integration Guide

This guide will help you integrate the StudySync frontend with the new Node.js backend API.

## Setup

1. Make sure both the frontend and backend servers are running:
   - Frontend: `npm start` in the root directory
   - Backend: `npm run dev` in the server directory

2. The backend API is available at `http://localhost:5000`

## API Service Integration

Create a new API service in your frontend to replace the localStorage-based data service:

```javascript
// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.user.token) {
      localStorage.setItem('token', response.data.user.token);
    }
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.user.token) {
      localStorage.setItem('token', response.data.user.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data.user;
    } catch (error) {
      return null;
    }
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

// Notes services
export const notesService = {
  getNotes: async () => {
    const response = await api.get('/notes');
    return response.data.data;
  },
  
  getNote: async (id) => {
    const response = await api.get(`/notes/${id}`);
    return response.data.data;
  },
  
  createNote: async (note) => {
    const response = await api.post('/notes', note);
    return response.data.data;
  },
  
  updateNote: async (note) => {
    const response = await api.put(`/notes/${note._id}`, note);
    return response.data.data;
  },
  
  deleteNote: async (id) => {
    await api.delete(`/notes/${id}`);
    return id;
  },
  
  toggleShareNote: async (id) => {
    const response = await api.put(`/notes/${id}/share`);
    return response.data.data;
  },
  
  searchNotes: async (query) => {
    const response = await api.get(`/notes/search?query=${query}`);
    return response.data.data;
  }
};

// Events services
export const eventsService = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data.data;
  },
  
  getEventsByDate: async (date) => {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    const response = await api.get(`/events/date/${formattedDate}`);
    return response.data.data;
  },
  
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data.data;
  },
  
  createEvent: async (event) => {
    const response = await api.post('/events', event);
    return response.data.data;
  },
  
  updateEvent: async (event) => {
    const response = await api.put(`/events/${event._id}`, event);
    return response.data.data;
  },
  
  deleteEvent: async (id) => {
    await api.delete(`/events/${id}`);
    return id;
  }
};

// Resources services
export const resourcesService = {
  getResources: async () => {
    const response = await api.get('/resources');
    return response.data.data;
  },
  
  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data.data;
  },
  
  createResource: async (resource) => {
    const response = await api.post('/resources', resource);
    return response.data.data;
  },
  
  updateResource: async (resource) => {
    const response = await api.put(`/resources/${resource._id}`, resource);
    return response.data.data;
  },
  
  deleteResource: async (id) => {
    await api.delete(`/resources/${id}`);
    return id;
  },
  
  searchResources: async (query) => {
    const response = await api.get(`/resources/search?query=${query}`);
    return response.data.data;
  }
};

// Bookmarks services
export const bookmarksService = {
  getBookmarks: async () => {
    const response = await api.get('/bookmarks');
    return response.data.data;
  },
  
  getBookmark: async (id) => {
    const response = await api.get(`/bookmarks/${id}`);
    return response.data.data;
  },
  
  createBookmark: async (bookmark) => {
    const response = await api.post('/bookmarks', bookmark);
    return response.data.data;
  },
  
  updateBookmark: async (bookmark) => {
    const response = await api.put(`/bookmarks/${bookmark._id}`, bookmark);
    return response.data.data;
  },
  
  deleteBookmark: async (id) => {
    await api.delete(`/bookmarks/${id}`);
    return id;
  }
};
```

## Authentication Context

Create an authentication context to manage user state:

```javascript
// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (credentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  };
  
  const register = async (userData) => {
    const response = await authService.register(userData);
    setUser(response.user);
    return response;
  };
  
  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const updateProfile = async (userData) => {
    const response = await authService.updateProfile(userData);
    setUser(response.user);
    return response;
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Protected Routes

Create a component to handle protected routes:

```javascript
// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;
```

## Login and Register Components

Create login and register components:

```javascript
// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };
  
  return (
    <div className="login-container">
      <h2>Login to StudySync</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>
  );
};

export default Login;
```

## Update App.js

Update your App.js to include authentication and protected routes:

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navigation/Navbar';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import Login from './pages/Login';
import Register from './pages/Register';
// Import other components

import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes" 
                element={
                  <ProtectedRoute>
                    <NotesPage />
                  </ProtectedRoute>
                } 
              />
              {/* Add other protected routes */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

## Component Updates

Update your components to use the new API services instead of the localStorage services. For example, update the Notes component:

```javascript
// src/pages/NotesPage.js
import React, { useState, useEffect } from 'react';
import { notesService } from '../services/apiService';
// Import other components

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await notesService.getNotes();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotes();
  }, []);
  
  const handleCreateNote = async (noteData) => {
    try {
      const newNote = await notesService.createNote(noteData);
      setNotes([newNote, ...notes]);
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };
  
  const handleUpdateNote = async (noteData) => {
    try {
      const updatedNote = await notesService.updateNote(noteData);
      setNotes(notes.map(note => note._id === updatedNote._id ? updatedNote : note));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };
  
  const handleDeleteNote = async (id) => {
    try {
      await notesService.deleteNote(id);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };
  
  // Rest of the component
};

export default NotesPage;
```

## Testing

1. Start both the frontend and backend servers
2. Register a new user
3. Login with the user credentials
4. Test all CRUD operations for notes, events, resources, and bookmarks

## Error Handling

Add proper error handling in your components to handle API errors:

```javascript
try {
  // API call
} catch (error) {
  // Check for specific error types
  if (error.response) {
    // Server responded with an error status
    console.error('Server error:', error.response.data.message);
  } else if (error.request) {
    // Request was made but no response received
    console.error('Network error - no response received');
  } else {
    // Something else went wrong
    console.error('Error:', error.message);
  }
}
```

## Deployment

When deploying your application:

1. Set up environment variables for API URLs
2. Configure CORS on the backend to allow requests from your frontend domain
3. Set up proper error logging and monitoring
