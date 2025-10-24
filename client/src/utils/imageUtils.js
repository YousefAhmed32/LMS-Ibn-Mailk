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

/**
 * Upload image to GridFS backend
 * @param {File} file - The image file to upload
 * @returns {Promise<string|null>} - The image URL or null if upload failed
 */
export const uploadImageToGridFS = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axiosInstance.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success) {
      // Handle both old and new response formats
      return response.data.url || response.data.data?.url;
    }
    
    return null;
  } catch (error) {
    console.error('Error uploading image to GridFS:', error);
    return null;
  }
};