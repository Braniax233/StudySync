const Event = require('../models/Event');

/**
 * @desc    Get all events for a user
 * @route   GET /api/events
 * @access  Private
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find({ user: req.user._id }).sort({ date: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get events for a specific date
 * @route   GET /api/events/date/:date
 * @access  Private
 */
exports.getEventsByDate = async (req, res) => {
  try {
    const dateParam = new Date(req.params.date);
    
    // Set time to beginning of day
    const startDate = new Date(dateParam);
    startDate.setHours(0, 0, 0, 0);
    
    // Set time to end of day
    const endDate = new Date(dateParam);
    endDate.setHours(23, 59, 59, 999);
    
    const events = await Event.find({
      user: req.user._id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ startTime: 1 });
    
    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get a single event
 * @route   GET /api/events/:id
 * @access  Private
 */
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns the event
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this event'
      });
    }
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a new event
 * @route   POST /api/events
 * @access  Private
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, date, startTime, endTime, description, location, isRecurring, recurrencePattern, reminderTime } = req.body;
    
    const event = await Event.create({
      title,
      date,
      startTime,
      endTime,
      description,
      location,
      isRecurring: isRecurring || false,
      recurrencePattern: recurrencePattern || '',
      reminderTime: reminderTime || 30,
      user: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/events/:id
 * @access  Private
 */
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns the event
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }
    
    // Update event
    const { title, date, startTime, endTime, description, location, isRecurring, recurrencePattern, reminderTime } = req.body;
    
    event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: title || event.title,
        date: date || event.date,
        startTime: startTime || event.startTime,
        endTime: endTime || event.endTime,
        description: description !== undefined ? description : event.description,
        location: location !== undefined ? location : event.location,
        isRecurring: isRecurring !== undefined ? isRecurring : event.isRecurring,
        recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : event.recurrencePattern,
        reminderTime: reminderTime !== undefined ? reminderTime : event.reminderTime
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/events/:id
 * @access  Private
 */
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user owns the event
    if (event.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }
    
    await event.deleteOne();
    
    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
