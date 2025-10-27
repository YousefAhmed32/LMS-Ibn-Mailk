import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header
const createAuthInstance = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds timeout
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Image upload service using GridFS
const imageUploadService = {
  // Upload single image
  uploadImage: async (file) => {
    try {
      console.log('📤 Uploading image to GridFS:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only jpg, jpeg, png, and webp are allowed.');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size too large. Maximum 5MB allowed.');
      }

      const token = getAuthToken();
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload/image`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });

      console.log('✅ Image uploaded successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Image upload error:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Upload failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Upload failed');
      }
    }
  },

  // Upload multiple images
  uploadImages: async (files) => {
    try {
      console.log('📤 Uploading multiple images to GridFS:', {
        count: files.length,
        files: Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type }))
      });

      // Validate all files
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type: ${file.name}. Only jpg, jpeg, png, and webp are allowed.`);
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File too large: ${file.name}. Maximum 5MB allowed.`);
        }
      }

      const token = getAuthToken();
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await axios.post(`${API_BASE_URL}/api/upload/images`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000
      });

      console.log('✅ Multiple images uploaded successfully:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ Multiple images upload error:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Upload failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error(error.message || 'Upload failed');
      }
    }
  },

  // Get image URL by ID
  getImageUrl: (imageId) => {
    if (!imageId) return null;
    
    // If it's already a full URL, return as is
    if (imageId.startsWith('http')) {
      return imageId;
    }
    
    // If it's a GridFS ObjectId, construct the URL
    return `${API_BASE_URL}/api/uploads/${imageId}`;
  },

  // Delete image (if needed in the future)
  deleteImage: async (imageId) => {
    try {
      const instance = createAuthInstance();
      const response = await instance.delete(`/api/upload/${imageId}`);
      console.log('✅ Image deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Image deletion error:', error);
      throw error;
    }
  },

  // Validate image file
  validateImageFile: (file) => {
    const errors = [];
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid file type. Only jpg, jpeg, png, and webp are allowed.');
    }
    
    // Check file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.push('File size too large. Maximum 5MB allowed.');
    }
    
    // Check if file is empty
    if (file.size === 0) {
      errors.push('File is empty.');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
};

export default imageUploadService;
