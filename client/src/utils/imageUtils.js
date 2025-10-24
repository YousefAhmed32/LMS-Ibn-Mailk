import axiosInstance from '../api/axiosInstance';

/**
 * Get full image URL for any image path
 * Works in both development and production
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // Get base URL from axios instance or use current origin
  const baseURL = axiosInstance.defaults.baseURL || window.location.origin;
  
  // Ensure the path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseURL}${normalizedPath}`;
};

/**
 * Get server base URL
 */
export const getServerBaseUrl = () => {
  return axiosInstance.defaults.baseURL || window.location.origin;
};

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
