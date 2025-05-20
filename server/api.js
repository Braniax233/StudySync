// Serverless-compatible API handler for Vercel
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().catch(err => console.error('MongoDB connection error:', err));

// Route imports
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const eventRoutes = require('./routes/eventRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const googleBooksRoutes = require('./routes/googleBooksRoutes');
const placesRoutes = require('./routes/places');

// Initialize Express app
const app = express();

// Configure CORS - update with your production domain
const corsOptions = {
  origin: ['http://localhost:3000', 'https://studysync.vercel.app', process.env.FRONTEND_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware for requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to StudySync API' });
});

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/books', googleBooksRoutes);
app.use('/api/places', placesRoutes);

// Export the Express API
module.exports = app;
app.use('/api/places', placesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    details: err.message
  });
});

// Connect to MongoDB
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) return;
  
  try {
    await connectDB();
    isConnected = true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Serverless handler
module.exports = async (req, res) => {
  try {
    // Connect to database on first request
    await connectToDatabase();
    
    // Handle the request with Express
    return app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      details: error.message
    });
  }
};