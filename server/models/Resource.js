const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a resource title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Please provide a resource type'],
    enum: ['YouTube Course', 'PDF', 'Online Course', 'Article', 'Book', 'Video', 'Other'],
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Please provide a resource URL'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

// Create index for text search
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', ResourceSchema);
