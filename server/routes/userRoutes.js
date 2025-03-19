const express = require('express');
const router = express.Router();
const {
  register,
  completeProfile,
  login,
  getProfile,
  updateProfile,
  updateStats
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/profile/setup', protect, completeProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/stats', protect, updateStats);

module.exports = router;
