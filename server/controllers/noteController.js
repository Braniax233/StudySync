const Note = require('../models/Note');
const User = require('../models/User');

/**
 * @desc    Get all notes for a user
 * @route   GET /api/notes
 * @access  Private
 */
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ dateModified: -1 });
    
    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get a single note
 * @route   GET /api/notes/:id
 * @access  Private
 */
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user owns the note or if note is shared
    if (note.user.toString() !== req.user._id.toString() && !note.isShared) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this note'
      });
    }
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, isShared } = req.body;
    
    // Create the note
    const note = await Note.create({
      title: title || 'Untitled Note',
      content: content || '', 
      tags: tags || [],
      isShared: isShared || false,
      user: req.user._id,
      dateCreated: new Date(),
      dateModified: new Date()
    });
    
    // Add the note to the user's notes array
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { notes: note._id } },
      { new: true }
    );
    
    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      console.log('Note ID is required');
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }

    console.log('Updating note with ID:', id);
    console.log('Update data:', req.body);
    
    let note = await Note.findById(id);
    
    if (!note) {
      console.log('Note not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    if (note.user.toString() !== req.user._id.toString()) {
      console.log('User not authorized:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this note'
      });
    }

    const { title, content, tags, isShared } = req.body;
    
    note = await Note.findByIdAndUpdate(
      id,
      {
        title: title || note.title,
        content: content || note.content,
        tags: tags || note.tags,
        isShared: isShared !== undefined ? isShared : note.isShared,
        dateModified: new Date()
      },
      { new: true, runValidators: true }
    );
    
    console.log('Updated note:', note);
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating note'
    });
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting note with ID:', id);
    
    if (!id) {
      console.log('Note ID is required');
      return res.status(400).json({
        success: false,
        message: 'Note ID is required'
      });
    }
    
    const note = await Note.findById(id);
    
    // Check if note exists
    if (!note) {
      console.log('Note not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      console.log('User not authorized:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this note'
      });
    }
    
    try {
      // Check if the user has the note in their notes array
      const user = await User.findById(req.user._id);
      console.log('User found:', user._id);
      
      if (user && user.notes && user.notes.length > 0) {
        // Check if the note is in the user's notes array
        const noteIndex = user.notes.findIndex(noteId => 
          noteId.toString() === note._id.toString()
        );
        
        if (noteIndex !== -1) {
          console.log('Note found in user notes array at index:', noteIndex);
          // Remove note from user's notes array
          await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { notes: note._id } }
          );
          console.log('Note removed from user notes array');
        } else {
          console.log('Note not found in user notes array');
        }
      } else {
        console.log('User has no notes or notes array is empty');
      }
    } catch (userUpdateError) {
      console.error('Error updating user:', userUpdateError);
      // Continue with note deletion even if user update fails
    }
    
    console.log('Deleting note from database:', note._id);
    await note.deleteOne();
    
    console.log('Note deleted successfully');
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting note'
    });
  }
};

/**
 * @desc    Toggle sharing status of a note
 * @route   PUT /api/notes/:id/share
 * @access  Private
 */
exports.toggleShareNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    
    // Check if note exists
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }
    
    // Check if user owns the note
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to share this note'
      });
    }
    
    // Toggle sharing status
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { isShared: !note.isShared },
      { new: true }
    );
    
    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Search notes
 * @route   GET /api/notes/search
 * @access  Private
 */
exports.searchNotes = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    // Search notes using text index
    const notes = await Note.find({
      $and: [
        { user: req.user._id },
        { $text: { $search: query } }
      ]
    }).sort({ score: { $meta: 'textScore' } });
    
    res.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
