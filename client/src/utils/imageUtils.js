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
 * Compress image before upload to reduce file size
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} quality - Compression quality 0-1 (default: 0.8)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, maxWidth = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw compressed image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with compressed data
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Upload image to GridFS backend with compression
 * @param {File} file - The image file to upload
 * @param {boolean} compress - Whether to compress the image first (default: true)
 * @returns {Promise<string|null>} - The image URL or null if upload failed
 */
export const uploadImageToGridFS = async (file, compress = true) => {
  try {
    let fileToUpload = file;
    
    // Compress image if requested and file is larger than 1MB
    if (compress && file.size > 1024 * 1024) {
      console.log('🔄 Compressing image before upload...');
      fileToUpload = await compressImage(file, 1920, 0.8);
      console.log(`📦 Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    const formData = new FormData();
    formData.append('image', fileToUpload);
    
    const response = await axiosInstance.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout
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