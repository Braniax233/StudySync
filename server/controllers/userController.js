const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// Register a new user - Step 1: Basic Registration
exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    
    // Split name into firstName and lastName
    let firstName = name;
    let lastName = '';
    
    if (name && name.includes(' ')) {
      const nameParts = name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }

    // Create new user with basic info
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      stats: {
        resourcesAccessed: 0,
        bookmarks: 0,
        studyHours: 0,
        completedCourses: 0
      }
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Complete user profile - Step 2: Profile Setup
exports.completeProfile = async (req, res) => {
  try {
    const { bio, interests, education } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile information
    user.bio = bio || '';
    user.interests = interests || [];
    user.education = education || [];
    user.lastActive = new Date();

    await user.save();

    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      interests: user.interests,
      education: user.education,
      stats: user.stats,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      message: 'Profile setup completed successfully',
      user: userData
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete profile setup'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email });

    // Find user by email
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Login successful for user:', email);

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      interests: user.interests,
      education: user.education,
      stats: user.stats,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      interests: user.interests,
      education: user.education,
      stats: user.stats,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, interests, education } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (interests) user.interests = interests;
    if (education) user.education = education;

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    const userData = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      username: user.username,
      email: user.email,
      bio: user.bio,
      interests: user.interests,
      education: user.education,
      stats: user.stats,
      createdAt: user.createdAt,
      lastActive: user.lastActive
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Update user stats
exports.updateStats = async (req, res) => {
  try {
    const { resourcesAccessed, bookmarks, studyHours, completedCourses } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update stats if provided
    if (resourcesAccessed !== undefined) user.stats.resourcesAccessed = resourcesAccessed;
    if (bookmarks !== undefined) user.stats.bookmarks = bookmarks;
    if (studyHours !== undefined) user.stats.studyHours = studyHours;
    if (completedCourses !== undefined) user.stats.completedCourses = completedCourses;

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Stats updated successfully',
      stats: user.stats
    });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stats'
    });
  }
};
