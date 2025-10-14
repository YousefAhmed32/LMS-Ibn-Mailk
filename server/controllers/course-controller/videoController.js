/**
 * Video Controller - Simplified version for URL and iframe inputs
 * Handles course video processing with security validation
 */

const mongoose = require('mongoose');
const Course = require('../../models/Course');

// YouTube URL regex patterns
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
const IFRAME_REGEX = /<iframe[^>]*src=["']([^"']+)["'][^>]*>(?:<\/iframe>)?/i;

// Allowed domains for iframe src
const ALLOWED_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com'
];

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(YT_REGEX);
  return match ? match[1] : null;
}

/**
 * Extract video ID from iframe src
 */
function extractVideoIdFromIframe(iframeSrc) {
  if (!iframeSrc || typeof iframeSrc !== 'string') return null;
  
  if (iframeSrc.includes('/embed/')) {
    const match = iframeSrc.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }
  
  return extractVideoId(iframeSrc);
}

/**
 * Generate safe embed URL
 */
function generateEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0`;
}

/**
 * Parse iframe HTML and extract src
 */
function parseIframe(iframeHtml) {
  if (!iframeHtml || typeof iframeHtml !== 'string') return null;
  
  const srcMatch = iframeHtml.match(IFRAME_REGEX);
  if (!srcMatch) return null;
  
  return srcMatch[1];
}

/**
 * Validate if domain is allowed
 */
function isAllowedDomain(src) {
  if (!src || typeof src !== 'string') return false;
  
  try {
    const url = new URL(src);
    return ALLOWED_DOMAINS.includes(url.hostname);
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize iframe HTML - only allow safe attributes
 */
function sanitizeIframe(iframeHtml) {
  if (!iframeHtml || typeof iframeHtml !== 'string') return null;
  
  // Extract src from iframe
  const src = parseIframe(iframeHtml);
  if (!src || !isAllowedDomain(src)) return null;
  
  // Extract video ID
  const videoId = extractVideoIdFromIframe(src);
  if (!videoId) return null;
  
  // Generate safe embed URL
  const embedSrc = generateEmbedUrl(videoId);
  
  return {
    videoId,
    embedSrc,
    originalSrc: src
  };
}

/**
 * Process video input (URL or iframe)
 */
function processVideoInput(videoData) {
  const { videoUrl, videoEmbed, title, duration } = videoData;
  
  let videoId = null;
  let embedSrc = null;
  let inputType = null;
  let originalInput = '';
  
  // Process URL input
  if (videoUrl && videoUrl.trim()) {
    videoId = extractVideoId(videoUrl.trim());
    if (videoId) {
      embedSrc = generateEmbedUrl(videoId);
      inputType = 'url';
      originalInput = videoUrl.trim();
    } else {
      throw new Error('Invalid YouTube URL format');
    }
  }
  // Process iframe input
  else if (videoEmbed && videoEmbed.trim()) {
    const sanitized = sanitizeIframe(videoEmbed.trim());
    if (sanitized) {
      videoId = sanitized.videoId;
      embedSrc = sanitized.embedSrc;
      inputType = 'iframe';
      originalInput = videoEmbed.trim();
    } else {
      throw new Error('Invalid iframe code or unsupported domain');
    }
  }
  // No input provided
  else {
    throw new Error('Either videoUrl or videoEmbed must be provided');
  }
  
  if (!videoId || !embedSrc) {
    throw new Error('Could not extract video information');
  }
  
  return {
    // Legacy fields for backward compatibility
    title: title?.trim() || `Video ${videoId}`,
    url: originalInput,
    duration: parseInt(duration) || 0,
    order: 0,
    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    
    // New YouTube fields
    provider: 'youtube',
    videoId,
    embedSrc,
    width: '100%',
    height: '560',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    rawInputType: inputType,
    sanitizedAt: new Date(),
    enableJsApi: false
  };
}

/**
 * Create course with videos
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
      level = 'beginner',
      duration = 0,
      videos = []
    } = req.body;

    // Process videos
    const processedVideos = [];
    for (let i = 0; i < videos.length; i++) {
      try {
        const processedVideo = processVideoInput({
          ...videos[i],
          order: i
        });
        processedVideos.push(processedVideo);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Video ${i + 1}: ${error.message}`
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
      message: 'Course created successfully',
      data: {
        course: newCourse,
        videosProcessed: processedVideos.length
      }
    });

  } catch (error) {
    console.error('Create course error:', error);
    
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
 * Update course with videos
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
      level,
      duration,
      videos = []
    } = req.body;

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Check permissions
    if (existingCourse.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this course'
      });
    }

    // Process videos if provided
    let processedVideos = existingCourse.videos;
    if (videos && videos.length > 0) {
      processedVideos = [];
      for (let i = 0; i < videos.length; i++) {
        try {
          const processedVideo = processVideoInput({
            ...videos[i],
            order: i
          });
          processedVideos.push(processedVideo);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: `Video ${i + 1}: ${error.message}`
          });
        }
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
    console.error('Update course error:', error);
    
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
 * Preview video (for frontend validation)
 */
const previewVideo = async (req, res) => {
  try {
    const { videoUrl, videoEmbed, title, duration } = req.body;

    const processedVideo = processVideoInput({
      videoUrl,
      videoEmbed,
      title,
      duration
    });

    return res.status(200).json({
      success: true,
      message: 'Video preview generated successfully',
      data: {
        video: processedVideo
      }
    });

  } catch (error) {
    console.error('Preview video error:', error);
    
    return res.status(400).json({
      success: false,
      error: 'Video processing failed',
      details: error.message
    });
  }
};

module.exports = {
  createCourseWithVideos,
  updateCourseWithVideos,
  previewVideo,
  processVideoInput,
  extractVideoId,
  extractVideoIdFromIframe,
  generateEmbedUrl,
  sanitizeIframe
};
