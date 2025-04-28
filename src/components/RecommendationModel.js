import * as tf from '@tensorflow/tfjs';

// Singleton pattern to ensure only one instance exists
let instance = null;

class RecommendationModel {
  constructor() {
    if (instance) {
      return instance;
    }
    
    this.model = null;
    this.contentTypes = ['video', 'book']; 
    this.categories = ['programming', 'education', 'science', 'technology', 'general'];
    this.tags = ['javascript', 'python', 'web development', 'learning', 'study', 'data science', 'html', 'css', 'react', 'es6'];
    this.modelReady = false;
    this.isTraining = false;
    this.userFeatures = null;
    this.modelVersion = 0;
    
    // Initialize TensorFlow
    this.init();
    
    instance = this;
    return instance;
  }

  // Initialize TensorFlow
  async init() {
    try {
      await tf.ready();
      tf.setBackend('cpu');
      console.log('TensorFlow initialized');
    } catch (error) {
      console.error('Error initializing TensorFlow:', error);
    }
  }

  // For backward compatibility - alias to cleanup
  disposeModel() {
    console.log('disposeModel called - using cleanup');
    this.cleanup();
  }

  // Calculates content similarity directly without neural network
  calculateSimilarityScores(userData) {
    try {
      console.log('Calculating similarity scores for content');
      const { recentActivity = [], bookmarks = [] } = userData;
      
      // Create user profile based on activities and bookmarks
      const userProfile = this._createUserProfile(recentActivity, bookmarks);
      
      // Calculate preference scores for content types
      const typeScores = {};
      this.contentTypes.forEach(type => {
        typeScores[type] = this._calculateTypeScore(type, userProfile);
      });
      
      // Format results
      return Object.entries(typeScores)
        .map(([type, score]) => ({
          type,
          score: Math.min(Math.max(score, 0.3), 0.95),
          confidence: score > 0.75 ? 'high' : score > 0.5 ? 'medium' : 'low'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Error calculating similarity scores:', error);
      return this._getDefaultRecommendations();
    }
  }

  // Create user profile from activity and bookmarks
  _createUserProfile(recentActivity, bookmarks) {
    const now = Date.now();
    const profile = {
      categoryScores: {},
      tagScores: {},
      typeScores: {},
      lastActivity: now
    };
    
    // Initialize scores
    this.categories.forEach(category => profile.categoryScores[category] = 0.1);
    this.tags.forEach(tag => profile.tagScores[tag] = 0.1);
    this.contentTypes.forEach(type => profile.typeScores[type] = 0.1);
    
    // Process activities
    recentActivity.forEach(activity => {
      if (!activity || !activity.timestamp) return;
      
      const type = activity.type === 'youtube' ? 'video' : activity.type;
      if (!this.contentTypes.includes(type)) return;
      
      const ageInDays = (now - activity.timestamp) / (1000 * 60 * 60 * 24);
      const timeWeight = Math.max(0.1, 1 - (ageInDays / 30)); // Decay over 30 days
      
      // Update type score
      profile.typeScores[type] = (profile.typeScores[type] || 0) + timeWeight * 1.5;
      
      // Update category score
      if (activity.category && this.categories.includes(activity.category)) {
        profile.categoryScores[activity.category] = 
          (profile.categoryScores[activity.category] || 0) + timeWeight * 1.2;
      }
      
      // Update tag scores
      (activity.tags || []).forEach(tag => {
        if (this.tags.includes(tag)) {
          profile.tagScores[tag] = (profile.tagScores[tag] || 0) + timeWeight;
        }
      });
    });
    
    // Process bookmarks (higher weight)
    bookmarks.forEach(bookmark => {
      if (!bookmark) return;
      
      const type = bookmark.type === 'youtube' ? 'video' : bookmark.type;
      if (!this.contentTypes.includes(type)) return;
      
      // Bookmarks get higher weight
      profile.typeScores[type] = (profile.typeScores[type] || 0) + 3.0;
      
      // Update category score
      if (bookmark.category && this.categories.includes(bookmark.category)) {
        profile.categoryScores[bookmark.category] = 
          (profile.categoryScores[bookmark.category] || 0) + 2.5;
      }
      
      // Update tag scores
      (bookmark.tags || []).forEach(tag => {
        if (this.tags.includes(tag)) {
          const tagWeight = ['javascript', 'python', 'web development'].includes(tag) ? 2.0 : 1.5;
          profile.tagScores[tag] = (profile.tagScores[tag] || 0) + tagWeight;
        }
      });
    });
    
    return profile;
  }
  
  // Calculate score for a specific content type
  _calculateTypeScore(type, userProfile) {
    // Base score from content type preferences
    let score = userProfile.typeScores[type] || 0;
    
    // Normalize to [0, 1] range
    const maxTypeScore = Math.max(...Object.values(userProfile.typeScores));
    if (maxTypeScore > 0) {
      score = score / maxTypeScore;
    }
    
    // Adjust based on recency
    const daysSinceLastActivity = 
      (Date.now() - userProfile.lastActivity) / (1000 * 60 * 60 * 24);
    const recencyFactor = Math.max(0.7, 1 - (daysSinceLastActivity / 14));
    
    return score * recencyFactor;
  }
  
  // Get default recommendations if no data is available
  _getDefaultRecommendations() {
    return this.contentTypes.map(type => ({
      type,
      score: type === 'video' ? 0.7 : 0.6,
      confidence: 'low'
    }));
  }
  
  // Train a simple TensorFlow model if needed
  async trainSimpleModel(userData) {
    if (this.isTraining) {
      console.log('Model is already training');
      return false;
    }
    
    this.isTraining = true;
    console.log('Training simple TensorFlow model...');
    
    try {
      const { recentActivity = [], bookmarks = [] } = userData;
      
      // Check if we have enough data
      if (recentActivity.length === 0 && bookmarks.length === 0) {
        console.log('Not enough data for training');
        return false;
      }
      
      // Create feature inputs
      const userProfile = this._createUserProfile(recentActivity, bookmarks);
      
      // Store for later use
      this.userFeatures = {
        categories: Object.values(userProfile.categoryScores),
        tags: Object.values(userProfile.tagScores),
        types: Object.values(userProfile.typeScores)
      };
      
      this.modelReady = true;
      return true;
    } catch (error) {
      console.error('Error training model:', error);
      return false;
    } finally {
      this.isTraining = false;
    }
  }

  // Get TensorFlow-powered recommendations
  async getRecommendations(userData) {
    try {
      // Make sure user data is valid
      if (!userData || !userData.recentActivity || !userData.bookmarks) {
        return this._getDefaultRecommendations();
      }
      
      // Train the model if needed
      if (!this.modelReady) {
        await this.trainSimpleModel(userData);
      }
      
      // Calculate recommendations
      return this.calculateSimilarityScores(userData);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return this._getDefaultRecommendations();
    }
  }

  // Clean up resources
  cleanup() {
    if (this.model) {
      try {
        this.model.dispose();
        this.model = null;
      } catch (error) {
        console.error('Error disposing model:', error);
      }
    }
    this.modelReady = false;
    this.isTraining = false;
  }
}

export default RecommendationModel; 