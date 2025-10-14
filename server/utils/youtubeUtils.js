/**
 * YouTube Video Utilities
 * Handles YouTube URL parsing, video ID extraction, and embed URL generation
 */

// YouTube URL regex patterns
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i;
const IFRAME_REGEX = /<iframe[^>]*src=["']([^"']+)["'][^>]*>(?:<\/iframe>)?/i;

// Allowed YouTube domains
const ALLOWED_DOMAINS = [
  'www.youtube.com',
  'youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com'
];

// Whitelisted iframe attributes
const ALLOWED_IFRAME_ATTRIBUTES = [
  'src',
  'width',
  'height',
  'allow',
  'allowfullscreen',
  'title',
  'frameborder',
  'referrerpolicy'
];

/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
function extractVideoId(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const match = url.match(YT_REGEX);
  return match ? match[1] : null;
}

/**
 * Extract video ID from iframe src attribute
 * @param {string} iframeSrc - iframe src URL
 * @returns {string|null} - Video ID or null if not found
 */
function extractVideoIdFromIframe(iframeSrc) {
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
function toEmbedUrl(videoId, options = {}) {
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
function parseIframe(iframeHtml) {
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

  // Extract other attributes using regex
  const attributes = {};
  const attrRegex = /(\w+)=["']([^"']*)["']/g;
  let match;

  while ((match = attrRegex.exec(iframeHtml)) !== null) {
    const [, attr, value] = match;
    if (ALLOWED_IFRAME_ATTRIBUTES.includes(attr.toLowerCase())) {
      attributes[attr.toLowerCase()] = value;
    }
  }

  return {
    src,
    videoId,
    attributes
  };
}

/**
 * Validate if iframe src domain is allowed
 * @param {string} src - iframe src URL
 * @returns {boolean} - Whether domain is allowed
 */
function isAllowedDomain(src) {
  if (!src || typeof src !== 'string') {
    return false;
  }

  try {
    const url = new URL(src);
    return ALLOWED_DOMAINS.includes(url.hostname);
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize video input and return standardized video object
 * @param {Object} videoInput - Video input object
 * @returns {Object} - Sanitized video object
 */
function sanitizeVideoInput(videoInput) {
  const { inputType, input, title, enableJsApi = false, origin = null } = videoInput;

  if (!inputType || !input) {
    throw new Error('inputType and input are required');
  }

  if (!['url', 'iframe'].includes(inputType)) {
    throw new Error('inputType must be either "url" or "iframe"');
  }

  let videoId;
  let embedSrc;

  if (inputType === 'url') {
    videoId = extractVideoId(input);
    if (!videoId) {
      throw new Error('Invalid YouTube URL - could not extract video ID');
    }
  } else if (inputType === 'iframe') {
    const parsed = parseIframe(input);
    videoId = parsed.videoId;
    
    // Validate domain
    if (!isAllowedDomain(parsed.src)) {
      throw new Error('Iframe src domain is not allowed');
    }
  }

  // Generate canonical embed URL
  embedSrc = toEmbedUrl(videoId, {
    controls: 1,
    rel: 0,
    enablejsapi: enableJsApi ? 1 : 0,
    origin
  });

  return {
    provider: 'youtube',
    videoId,
    embedSrc,
    title: title || `YouTube Video ${videoId}`,
    width: '100%',
    height: '560',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    rawInputType: inputType,
    sanitizedAt: new Date(),
    enableJsApi: enableJsApi
  };
}

/**
 * Validate video input before processing
 * @param {Object} videoInput - Video input object
 * @returns {Object} - Validation result
 */
function validateVideoInput(videoInput) {
  const errors = [];

  if (!videoInput) {
    errors.push('Video input is required');
    return { isValid: false, errors };
  }

  if (!videoInput.inputType) {
    errors.push('inputType is required');
  } else if (!['url', 'iframe'].includes(videoInput.inputType)) {
    errors.push('inputType must be either "url" or "iframe"');
  }

  if (!videoInput.input) {
    errors.push('input is required');
  } else if (typeof videoInput.input !== 'string') {
    errors.push('input must be a string');
  }

  if (videoInput.title && typeof videoInput.title !== 'string') {
    errors.push('title must be a string');
  }

  if (videoInput.enableJsApi && typeof videoInput.enableJsApi !== 'boolean') {
    errors.push('enableJsApi must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  extractVideoId,
  extractVideoIdFromIframe,
  toEmbedUrl,
  parseIframe,
  isAllowedDomain,
  sanitizeVideoInput,
  validateVideoInput,
  YT_REGEX,
  IFRAME_REGEX,
  ALLOWED_DOMAINS,
  ALLOWED_IFRAME_ATTRIBUTES
};
