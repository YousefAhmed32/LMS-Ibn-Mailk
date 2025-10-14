/**
 * Video utility functions for handling YouTube videos and thumbnails
 */

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - YouTube video ID or null if not found
 */
const extractYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  // Regular expressions for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, standard, maxres)
 * @returns {string} - YouTube thumbnail URL
 */
const getYouTubeThumbnail = (videoId, quality = 'hqdefault') => {
  if (!videoId) {
    return null;
  }

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };

  const thumbnailQuality = qualityMap[quality] || 'hqdefault';
  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
};

/**
 * Get video thumbnail URL (YouTube or fallback)
 * @param {string} videoUrl - Video URL
 * @param {string} customThumbnail - Custom thumbnail URL (optional)
 * @param {string} quality - YouTube thumbnail quality
 * @returns {string|null} - Thumbnail URL or null
 */
const getVideoThumbnail = (videoUrl, customThumbnail = null, quality = 'hqdefault') => {
  // Return custom thumbnail if provided
  if (customThumbnail) {
    return customThumbnail;
  }

  // Try to get YouTube thumbnail
  const videoId = extractYouTubeVideoId(videoUrl);
  if (videoId) {
    return getYouTubeThumbnail(videoId, quality);
  }

  // Return null if no thumbnail available
  return null;
};

/**
 * Check if URL is a YouTube video
 * @param {string} url - Video URL
 * @returns {boolean} - True if YouTube URL
 */
const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const youtubePatterns = [
    /youtube\.com\/watch\?v=/,
    /youtu\.be\//,
    /youtube\.com\/embed\//,
    /youtube\.com\/v\//
  ];

  return youtubePatterns.some(pattern => pattern.test(url));
};

/**
 * Get YouTube embed URL
 * @param {string} videoUrl - YouTube video URL
 * @returns {string|null} - YouTube embed URL or null
 */
const getYouTubeEmbedUrl = (videoUrl) => {
  const videoId = extractYouTubeVideoId(videoUrl);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

/**
 * Format video duration from seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
const formatVideoDuration = (seconds) => {
  if (!seconds || seconds < 0) {
    return '0:00';
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Format video duration from minutes to MM:SS or HH:MM:SS
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
const formatVideoDurationFromMinutes = (minutes) => {
  if (!minutes || minutes < 0) {
    return '0:00';
  }

  const seconds = Math.floor(minutes * 60);
  return formatVideoDuration(seconds);
};

module.exports = {
  extractYouTubeVideoId,
  getYouTubeThumbnail,
  getVideoThumbnail,
  isYouTubeUrl,
  getYouTubeEmbedUrl,
  formatVideoDuration,
  formatVideoDurationFromMinutes
};
