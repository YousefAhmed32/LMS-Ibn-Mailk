/**
 * YouTube Video Utilities for Frontend
 * Handles YouTube URL parsing, video ID extraction, and embed URL generation
 */

// YouTube URL regex - supports watch, embed, shorts, youtu.be, and any query params
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
const IFRAME_REGEX = /<iframe[^>]*src=["']([^"']+)["'][^>]*>(?:<\/iframe>)?/i;

/**
 * Extract YouTube video ID from various URL formats
 * Supports: watch?v=, embed/, shorts/, youtu.be/, and URLs with &list, &si, etc.
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }
  const trimmed = url.trim();
  const match = trimmed.match(YT_REGEX);
  return match ? match[1] : null;
}

/**
 * Check if URL is a valid YouTube video URL (any supported format)
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
  return extractVideoId(url) !== null;
}

/**
 * Normalize any YouTube URL to canonical embed URL for storage/iframe
 * Rejects non-YouTube URLs (returns null)
 * @param {string} url - Any YouTube URL (watch, youtu.be, shorts, embed, with params)
 * @returns {string|null} - https://www.youtube.com/embed/VIDEO_ID or null
 */
export function getEmbedUrlFromAnyYouTubeUrl(url) {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  return toEmbedUrl(videoId, { controls: 1, rel: 0 });
}

/**
 * Extract video ID from iframe src attribute
 * @param {string} iframeSrc - iframe src URL
 * @returns {string|null} - Video ID or null if not found
 */
export function extractVideoIdFromIframe(iframeSrc) {
  if (!iframeSrc || typeof iframeSrc !== 'string') {
    return null;
  }

  // Check if it's already an embed URL
  if (iframeSrc.includes('/embed/')) {
    const match = iframeSrc.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  // Try to extract from regular YouTube URL in iframe src
  return extractVideoId(iframeSrc);
}

/**
 * Generate canonical YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @param {Object} options - Embed options
 * @returns {string} - Canonical embed URL
 */
export function toEmbedUrl(videoId, options = {}) {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('Valid video ID is required');
  }

  const {
    controls = 1,
    rel = 0,
    enablejsapi = 0,
    origin = null,
    autoplay = 0,
    loop = 0,
    start = 0,
    end = null
  } = options;

  const params = new URLSearchParams();
  params.set('controls', String(controls));
  params.set('rel', String(rel));
  
  if (enablejsapi) params.set('enablejsapi', '1');
  if (origin) params.set('origin', origin);
  if (autoplay) params.set('autoplay', '1');
  if (loop) params.set('loop', '1');
  if (start > 0) params.set('start', String(start));
  if (end) params.set('end', String(end));

  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Parse iframe HTML and extract attributes
 * @param {string} iframeHtml - Raw iframe HTML
 * @returns {Object} - Parsed iframe attributes
 */
export function parseIframe(iframeHtml) {
  if (!iframeHtml || typeof iframeHtml !== 'string') {
    throw new Error('Valid iframe HTML is required');
  }

  const srcMatch = iframeHtml.match(IFRAME_REGEX);
  if (!srcMatch) {
    throw new Error('Invalid iframe format');
  }

  const src = srcMatch[1];
  const videoId = extractVideoIdFromIframe(src);
  
  if (!videoId) {
    throw new Error('Could not extract video ID from iframe');
  }

  return {
    src,
    videoId
  };
}

/**
 * Detect input type (URL or iframe)
 * @param {string} input - User input
 * @returns {string} - 'url' or 'iframe'
 */
export function detectInputType(input) {
  if (!input || typeof input !== 'string') {
    return 'url';
  }

  const trimmed = input.trim();
  
  // Check if it looks like an iframe
  if (trimmed.startsWith('<iframe') && trimmed.includes('</iframe>')) {
    return 'iframe';
  }
  
  // Check if it's a YouTube URL
  if (extractVideoId(trimmed)) {
    return 'url';
  }
  
  return 'url'; // Default to URL
}

/**
 * Validate video input
 * @param {string} input - User input
 * @param {string} inputType - Input type ('url' or 'iframe')
 * @returns {Object} - Validation result
 */
export function validateVideoInput(input, inputType) {
  const errors = [];

  if (!input || typeof input !== 'string') {
    errors.push('Input is required');
    return { isValid: false, errors };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    errors.push('Input cannot be empty');
    return { isValid: false, errors };
  }

  if (inputType === 'url') {
    const videoId = extractVideoId(trimmed);
    if (!videoId) {
      errors.push('Invalid YouTube URL - could not extract video ID');
    }
  } else if (inputType === 'iframe') {
    try {
      parseIframe(trimmed);
    } catch (error) {
      errors.push(error.message);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality ('default', 'medium', 'high', 'standard', 'maxres')
 * @returns {string} - Thumbnail URL
 */
export function getYouTubeThumbnail(videoId, quality = 'hqdefault') {
  if (!videoId) {
    return null;
  }

  const qualities = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };

  const qualityKey = qualities[quality] || 'hqdefault';
  return `https://i.ytimg.com/vi/${videoId}/${qualityKey}.jpg`;
}

/**
 * Get YouTube video title (requires API call)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<string>} - Video title
 */
export async function getYouTubeVideoTitle(videoId) {
  if (!videoId) {
    return null;
  }

  try {
    // This would require YouTube Data API v3
    // For now, return a generic title
    return `YouTube Video ${videoId}`;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return `YouTube Video ${videoId}`;
  }
}

/**
 * Create video input object for API
 * @param {string} input - User input
 * @param {string} inputType - Input type
 * @param {string} title - Optional title
 * @param {boolean} enableJsApi - Enable JavaScript API
 * @returns {Object} - Video input object
 */
export function createVideoInputObject(input, inputType, title = null, enableJsApi = false) {
  return {
    inputType,
    input: input.trim(),
    title,
    enableJsApi
  };
}

/**
 * Preview video data (client-side only)
 * @param {string} input - User input
 * @param {string} inputType - Input type
 * @returns {Object|null} - Preview data or null
 */
export function previewVideoData(input, inputType) {
  try {
    let videoId;
    
    if (inputType === 'url') {
      videoId = extractVideoId(input);
    } else if (inputType === 'iframe') {
      const parsed = parseIframe(input);
      videoId = parsed.videoId;
    }

    if (!videoId) {
      return null;
    }

    return {
      videoId,
      embedSrc: toEmbedUrl(videoId, { controls: 1, rel: 0 }),
      thumbnail: getYouTubeThumbnail(videoId),
      title: `YouTube Video ${videoId}`
    };
  } catch (error) {
    console.error('Error creating preview:', error);
    return null;
  }
}

export {
  YT_REGEX,
  IFRAME_REGEX
};
