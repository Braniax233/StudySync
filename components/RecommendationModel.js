import * as tf from '@tensorflow/tfjs';
import { recentActivityService } from '../services/cacheService';
import { bookmarksService } from '../services/bookmarkService';

class RecommendationModel {
  constructor() {
    this.model = null;
    this.featureExtractor = null;
    this.contentTypes = ['video', 'article', 'book', 'course', 'documentation'];
    this.categories = new Set();
    this.tags = new Set();
  }

  // Extract features from user data
  extractFeatures(userData) {
    const {
      recentActivity,
      bookmarks,
      searchHistory
    } = userData;

    // Update categories and tags sets
    recentActivity.forEach(activity => {
      if (activity.category) this.categories.add(activity.category);
      if (activity.tags) activity.tags.forEach(tag => this.tags.add(tag));
    });

    bookmarks.forEach(bookmark => {
      if (bookmark.category) this.categories.add(bookmark.category);
      if (bookmark.tags) bookmark.tags.forEach(tag => this.tags.add(tag));
    });

    // Create feature vectors
    const categoryVector = Array.from(this.categories).map(cat => 
      recentActivity.some(a => a.category === cat) ? 1 : 0
    );
    
    const tagVector = Array.from(this.tags).map(tag =>
      recentActivity.some(a => a.tags?.includes(tag)) ? 1 : 0
    );

    // Add content type preferences
    const typeVector = this.contentTypes.map(type =>
      recentActivity.filter(a => a.type === type).length
    );

    // Combine all feature vectors
    return [...categoryVector, ...tagVector, ...typeVector];
  }

  // Create a more sophisticated neural network model
  createModel(inputShape) {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({
          inputShape: [inputShape],
          units: 128,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({
          units: 32,
          activation: 'relu',
          kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
        }),
        tf.layers.dense({
          units: this.contentTypes.length,
          activation: 'softmax'
        })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
  }

  // Train the model with user data
  async trainModel(userData) {
    try {
      // Extract features from user data
      const features = this.extractFeatures(userData);
      
      // Create training data
      const xs = tf.tensor2d([features]);
      
      // Create labels based on user preferences
      const labels = this.createLabels(userData);
      const ys = tf.tensor2d([labels]);

      // Initialize model if not already done
      if (!this.model) {
        this.createModel(features.length);
      }

      // Train the model
      await this.model.fit(xs, ys, {
        epochs: 50,
        batchSize: 32,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1} of 50`);
            console.log(`Loss: ${logs.loss.toFixed(4)}, Accuracy: ${logs.acc.toFixed(4)}`);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Error training recommendation model:', error);
      return false;
    }
  }

  // Create labels based on user preferences
  createLabels(userData) {
    const { recentActivity, bookmarks } = userData;
    
    // Create a preference vector based on content types
    const preferences = new Array(this.contentTypes.length).fill(0);
    
    // Count occurrences of each content type
    recentActivity.forEach(activity => {
      const typeIndex = this.contentTypes.indexOf(activity.type);
      if (typeIndex !== -1) {
        preferences[typeIndex]++;
      }
    });
    
    // Add bookmark preferences with higher weight
    bookmarks.forEach(bookmark => {
      const typeIndex = this.contentTypes.indexOf(bookmark.type);
      if (typeIndex !== -1) {
        preferences[typeIndex] += 2; // Bookmarks have higher weight
      }
    });
    
    // Normalize preferences
    const sum = preferences.reduce((a, b) => a + b, 0);
    return preferences.map(p => sum > 0 ? p / sum : 0);
  }

  // Get personalized recommendations
  async getRecommendations(userData) {
    try {
      // Extract features for current user
      const features = this.extractFeatures(userData);
      
      // Make prediction
      const input = tf.tensor2d([features]);
      const predictions = await this.model.predict(input).array();
      
      // Process predictions into recommendations
      const recommendations = predictions[0].map((score, index) => ({
        type: this.contentTypes[index],
        score: score
      }));
      
      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
}

export default RecommendationModel; 