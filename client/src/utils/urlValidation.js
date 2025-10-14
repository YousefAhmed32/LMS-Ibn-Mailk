/**
 * Validates if a URL is a valid external URL (HTTP/HTTPS)
 * @param {string} value - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidExternalUrl = (value) => {
  if (!value) return false;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL, false otherwise
 */
export const validateYouTubeUrl = (url) => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
};

/**
 * Sanitizes a URL by trimming whitespace and ensuring it's a valid URL
 * @param {string} url - The URL to sanitize
 * @returns {string|null} - Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (!url) return null;
  
  const trimmed = url.trim();
  if (!isValidExternalUrl(trimmed)) return null;
  
  return trimmed;
};
