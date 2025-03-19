import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth object available to any
// child component that calls useAuth().
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Login function - in a real app, this would make an API call
  const login = async (credentials) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, create a mock user
      const user = {
        id: 'user-123',
        name: credentials.username || 'Demo User',
        email: credentials.email || 'demo@example.com',
        role: 'student',
        avatar: '/assets/avatar.jpg',
        joined: new Date().toISOString(),
      };
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  // Register function - in a real app, this would make an API call
  const register = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, create a user from registration data
      const user = {
        id: 'user-' + Math.floor(Math.random() * 1000),
        name: userData.fullName,
        email: userData.email,
        role: 'student',
        avatar: '/assets/avatar.jpg',
        joined: new Date().toISOString(),
      };
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Password reset request - in a real app, this would make an API call
  const requestPasswordReset = async (email) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Failed to send reset link' };
    }
  };

  // Update user profile - in a real app, this would make an API call
  const updateProfile = async (userData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user data
      const updatedUser = { ...currentUser, ...userData };
      
      // Save updated user to localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  };

  // Auth context value
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    requestPasswordReset,
    updateProfile,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
