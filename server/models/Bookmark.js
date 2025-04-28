const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a bookmark title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  url: {
    type: String,
    required: [true, 'Please provide a bookmark URL'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized'
  },
  notes: {
    type: String,
    trim: true
  },
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

module.exports = mongoose.model('Bookmark', BookmarkSchema);

