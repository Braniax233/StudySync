const Resource = require('../models/Resource');

/**
 * @desc    Get all resources for a user
 * @route   GET /api/resources
 * @access  Private
 */
exports.getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ user: req.user._id }).sort({ dateAdded: -1 });
    
    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get a single resource
 * @route   GET /api/resources/:id
 * @access  Private
 */
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    // Check if resource exists
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource
    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Create a new resource
 * @route   POST /api/resources
 * @access  Private
 */
exports.createResource = async (req, res) => {
  try {
    const { title, type, url, description, tags } = req.body;
    
    const resource = await Resource.create({
      title,
      type,
      url,
      description,
      tags: tags || [],
      user: req.user._id,
      dateAdded: new Date()
    });
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update a resource
 * @route   PUT /api/resources/:id
 * @access  Private
 */
exports.updateResource = async (req, res) => {
  try {
    let resource = await Resource.findById(req.params.id);
    
    // Check if resource exists
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource
    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this resource'
      });
    }
    
    // Update resource
    const { title, type, url, description, tags } = req.body;
    
    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      {
        title: title || resource.title,
        type: type || resource.type,
        url: url || resource.url,
        description: description !== undefined ? description : resource.description,
        tags: tags || resource.tags
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete a resource
 * @route   DELETE /api/resources/:id
 * @access  Private
 */
exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    // Check if resource exists
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }
    
    // Check if user owns the resource
    if (resource.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this resource'
      });
    }
    
    await resource.deleteOne();
    
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

/**
 * @desc    Search resources
 * @route   GET /api/resources/search
 * @access  Private
 */
exports.searchResources = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }
    
    const resources = await Resource.find({
      $and: [
        { user: req.user._id },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).sort({ dateAdded: -1 });
    
    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
