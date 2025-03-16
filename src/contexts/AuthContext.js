import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/apiService';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const user = authAPI.getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Error checking authentication status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register a new user
  const register = async (userData) => {
    setError(null);
    try {
      const response = await authAPI.register(userData);
      if (response.data.success) {
        setCurrentUser(response.data.user);
        localStorage.setItem('studysync_token', response.data.token);
        localStorage.setItem('studysync_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (credentials) => {
    setError(null);
    try {
      const response = await authAPI.login(credentials);
      if (response.data.success) {
        setCurrentUser(response.data.user);
        localStorage.setItem('studysync_token', response.data.token);
        localStorage.setItem('studysync_user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('studysync_token');
    localStorage.removeItem('studysync_user');
    setCurrentUser(null);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const response = await authAPI.updateProfile(profileData);
      setCurrentUser(response.data);
      localStorage.setItem('studysync_user', JSON.stringify(response.data));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Profile update failed');
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      const response = await authAPI.resetPassword(email);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    }
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    resetPassword,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
