/**
 * YouTube Video Controller
 * Handles course creation and updates with YouTube video processing
 */

const mongoose = require('mongoose');
const Course = require('../../models/Course');
const { sanitizeVideoInput, validateVideoInput } = require('../../utils/youtubeUtils');

/**
 * Process and sanitize video inputs
 * @param {Array} videos - Array of video input objects
 * @param {string} origin - Frontend origin for YouTube API
 * @returns {Array} - Array of sanitized video objects
 */
async function processVideoInputs(videos, origin = null) {
  if (!videos || !Array.isArray(videos)) {
    return [];
  }

  const processedVideos = [];

  for (let i = 0; i < videos.length; i++) {
    const videoInput = videos[i];
    
    try {
      // Validate input
      const validation = validateVideoInput(videoInput);
      if (!validation.isValid) {
        throw new Error(`Video ${i + 1}: ${validation.errors.join(', ')}`);
      }

      // Sanitize and process video
      const sanitizedVideo = sanitizeVideoInput({
        ...videoInput,
        origin
      });

      // Add order if not provided
      if (sanitizedVideo.order === undefined) {
        sanitizedVideo.order = i;
      }

      processedVideos.push(sanitizedVideo);
    } catch (error) {
      console.error(`Error processing video ${i + 1}:`, error.message);
      throw new Error(`Video ${i + 1}: ${error.message}`);
    }
  }

  return processedVideos;
}

/**
 * Create course with YouTube video processing
 */
const createCourseWithVideos = async (req, res) => {
  try {
    const {
      title,
      description,
      grade,
      term,
      subject,
      price,
      videos = [],
      level = 'beginner',
      duration = 0
    } = req.body;

    // Process videos if provided
    let processedVideos = [];
    if (videos && videos.length > 0) {
      try {
        processedVideos = await processVideoInputs(videos, process.env.FRONTEND_ORIGIN);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Video processing failed',
          details: error.message
        });
      }
    }

    // Create new course
    const newCourse = new Course({
      title,
      description,
      grade,
      term,
      subject,
      price: parseFloat(price) || 0,
      level,
      duration: parseInt(duration) || 0,
      videos: processedVideos,
      createdBy: req.user._id
    });

    await newCourse.save();

    // Populate creator info
    await newCourse.populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    return res.status(201).json({
      success: true,
      message: 'Course created successfully with YouTube videos',
      data: {
        course: newCourse,
        videosProcessed: processedVideos.length
      }
    });

  } catch (error) {
    console.error('Create course with videos error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while creating course',
      details: error.message
    });
  }
};

/**
 * Update course with YouTube video processing
 */
const updateCourseWithVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      grade,
      term,
      subject,
      price,
      videos = [],
      level,
      duration
    } = req.body;

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user has permission to update
    if (existingCourse.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this course'
      });
    }

    // Process videos if provided
    let processedVideos = existingCourse.videos; // Keep existing videos by default
    if (videos && videos.length > 0) {
      try {
        processedVideos = await processVideoInputs(videos, process.env.FRONTEND_ORIGIN);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Video processing failed',
          details: error.message
        });
      }
    }

    // Update course
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (grade !== undefined) updateData.grade = grade;
    if (term !== undefined) updateData.term = term;
    if (subject !== undefined) updateData.subject = subject;
    if (price !== undefined) updateData.price = parseFloat(price) || 0;
    if (level !== undefined) updateData.level = level;
    if (duration !== undefined) updateData.duration = parseInt(duration) || 0;
    if (videos && videos.length > 0) updateData.videos = processedVideos;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName secondName thirdName fourthName userEmail');

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: {
        course: updatedCourse,
        videosProcessed: processedVideos.length
      }
    });

  } catch (error) {
    console.error('Update course with videos error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while updating course',
      details: error.message
    });
  }
};

/**
 * Add video to existing course
 */
const addVideoToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const videoInput = req.body;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user has permission to update
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this course'
      });
    }

    // Process single video
    let processedVideo;
    try {
      const processedVideos = await processVideoInputs([videoInput], process.env.FRONTEND_ORIGIN);
      processedVideo = processedVideos[0];
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Video processing failed',
        details: error.message
      });
    }

    // Add video to course
    course.videos.push(processedVideo);
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Video added successfully',
      data: {
        video: processedVideo,
        totalVideos: course.videos.length
      }
    });

  } catch (error) {
    console.error('Add video to course error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while adding video',
      details: error.message
    });
  }
};

/**
 * Remove video from course
 */
const removeVideoFromCourse = async (req, res) => {
  try {
    const { id, videoId } = req.params;

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user has permission to update
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this course'
      });
    }

    // Find and remove video
    const videoIndex = course.videos.findIndex(video => video._id.toString() === videoId);
    if (videoIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Video not found in course'
      });
    }

    const removedVideo = course.videos.splice(videoIndex, 1)[0];
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Video removed successfully',
      data: {
        removedVideo,
        totalVideos: course.videos.length
      }
    });

  } catch (error) {
    console.error('Remove video from course error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while removing video',
      details: error.message
    });
  }
};

/**
 * Reorder videos in course
 */
const reorderCourseVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoIds } = req.body; // Array of video IDs in new order

    if (!Array.isArray(videoIds)) {
      return res.status(400).json({
        success: false,
        error: 'videoIds must be an array'
      });
    }

    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check if user has permission to update
    if (course.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this course'
      });
    }

    // Reorder videos
    const reorderedVideos = [];
    for (let i = 0; i < videoIds.length; i++) {
      const video = course.videos.find(v => v._id.toString() === videoIds[i]);
      if (video) {
        video.order = i;
        reorderedVideos.push(video);
      }
    }

    course.videos = reorderedVideos;
    await course.save();

    return res.status(200).json({
      success: true,
      message: 'Videos reordered successfully',
      data: {
        videos: course.videos
      }
    });

  } catch (error) {
    console.error('Reorder course videos error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while reordering videos',
      details: error.message
    });
  }
};

/**
 * Preview video without saving
 */
const previewVideo = async (req, res) => {
  try {
    const videoInput = req.body;

    // Process video for preview
    let processedVideo;
    try {
      const processedVideos = await processVideoInputs([videoInput], process.env.FRONTEND_ORIGIN);
      processedVideo = processedVideos[0];
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Video processing failed',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Video preview generated successfully',
      data: {
        video: processedVideo
      }
    });

  } catch (error) {
    console.error('Preview video error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error while generating preview',
      details: error.message
    });
  }
};

module.exports = {
  createCourseWithVideos,
  updateCourseWithVideos,
  addVideoToCourse,
  removeVideoFromCourse,
  reorderCourseVideos,
  previewVideo,
  processVideoInputs
};
