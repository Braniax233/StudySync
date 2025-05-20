import axios from 'axios';

// Configure axios to use the backend API URL from environment variables
const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default instance;
