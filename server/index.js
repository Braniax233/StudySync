require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    details: err.message
  });
});

// Define port
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
