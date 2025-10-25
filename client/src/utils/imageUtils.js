import axiosInstance from '../api/axiosInstance';

/**
 * Get full image URL for any image path
 * Works in both development and production
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    console.log('✅ Full URL detected:', imagePath);
    return imagePath;
  }
  
  // Get base URL from axios instance or use current origin
  const baseURL = axiosInstance.defaults.baseURL || window.location.origin;
  
  // Ensure the path starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  const fullUrl = `${baseURL}${normalizedPath}`;
  
  console.log('🖼️ Image URL processed:', {
    original: imagePath,
    baseURL: baseURL,
    normalizedPath: normalizedPath,
    fullUrl: fullUrl,
    isGridFS: imagePath.startsWith('/api/image/'),
    isLocal: imagePath.startsWith('/uploads/')
  });
  
  return fullUrl;
};

/**
 * Get image URL with fallback handling
 * Returns the image URL or fallback if image fails
 */
export const getImageUrlWithFallback = (imagePath, fallbackType = 'group') => {
  if (!imagePath) return getFallbackImage(fallbackType);
  
  const imageUrl = getImageUrl(imagePath);
  return imageUrl || getFallbackImage(fallbackType);
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
 * Test if image URL is accessible
 */
export const testImageUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      console.log('✅ Image test successful:', url);
      resolve(true);
    };
    img.onerror = () => {
      console.log('❌ Image test failed:', url);
      resolve(false);
    };
    img.src = url;
  });
};

/**
 * Get fallback image for groups
 * Returns a default group icon or placeholder
 */
export const getGroupFallbackImage = () => {
  // Return a data URL for a simple group icon
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9IiNGRjkzMTYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTE3IDIxVjE5QzE3IDE3Ljg5IDE2LjEgMTcgMTUgMTdIOUM3Ljg5IDE3IDcgMTcuODkgNyAxOVYyMUg1VjE5QzUgMTYuNzkgNi43OSAxNSA5IDE1SDE1QzE3LjIxIDE1IDE5IDE2Ljc5IDE5IDE5VjIxSDE3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDEzQzE0LjIxIDEzIDE2IDExLjIxIDE2IDlDMTYgNi43OSAxNC4yMSA1IDEyIDVDOS43OSA1IDggNi43OSA4IDlDOCAxMS4yMSA5Ljc5IDEzIDEyIDEzWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=';
};

/**
 * Get fallback image for any entity
 * @param {string} type - Type of entity (group, course, user, etc.)
 */
export const getFallbackImage = (type = 'default') => {
  const fallbackImages = {
    group: getGroupFallbackImage(),
    course: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+Cg==',
    user: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9IiMxMEI5ODEiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDE0QzEwLjY3IDE0IDkuNDEgMTQuMzQgOC4zNCAxNC45M0M5LjI2IDE2LjE5IDEwLjU2IDE3IDEyIDE3QzEzLjQ0IDE3IDE0Ljc0IDE2LjE5IDE1LjY2IDE0LjkzQzE0LjU5IDE0LjM0IDEzLjMzIDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo=',
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTYiIGZpbGw9IiM2QjcyODAiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+Cg=='
  };
  
  return fallbackImages[type] || fallbackImages.default;
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
    console.log('📤 Starting image upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    let fileToUpload = file;
    
    // Compress image if requested and file is larger than 1MB
    if (compress && file.size > 1024 * 1024) {
      console.log('🔄 Compressing image before upload...');
      fileToUpload = await compressImage(file, 1920, 0.8);
      console.log(`📦 Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB, Compressed: ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    const formData = new FormData();
    formData.append('image', fileToUpload);
    
    console.log('📤 Sending upload request to /api/upload/image');
    const response = await axiosInstance.post('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout
    });
    
    console.log('📤 Upload response:', response.data);
    
    if (response.data.success) {
      const imageUrl = response.data.url || response.data.data?.url;
      console.log('✅ Image uploaded successfully:', imageUrl);
      
      // Test the uploaded image URL
      if (imageUrl) {
        console.log('🧪 Testing uploaded image URL:', imageUrl);
        testImageUrl(imageUrl).then(isAccessible => {
          console.log('📸 Uploaded image accessibility:', isAccessible);
        });
      }
      
      return imageUrl;
    }
    
    console.log('❌ Upload failed - no success response');
    return null;
  } catch (error) {
    console.error('❌ Error uploading image to GridFS:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return null;
  }
};