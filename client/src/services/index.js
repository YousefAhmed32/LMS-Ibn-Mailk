import axiosInstance from "@/api/axiosInstance";

// Authentication Services
export async function registerService(formData) {
  try {
    const { data } = await axiosInstance.post("/api/auth/register", formData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function loginService(formData) {
  try {
    const { data } = await axiosInstance.post("/api/auth/login", formData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getCurrentUserService() {
  try {
    console.log('🔍 Frontend: Calling getCurrentUserService...');
    
    const { data } = await axiosInstance.get("/api/auth/me");
    
    console.log('✅ Frontend: getCurrentUserService success:', {
      success: data.success,
      hasUser: !!data.user,
      userRole: data.user?.role,
      userId: data.user?._id
    });
    
    return data;
  } catch (error) {
    console.error('❌ Frontend: getCurrentUserService error:', {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      hasResponse: !!error.response
    });
    
    // Return a structured error object
    throw {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to get user data',
      status: error.response?.status || 0
    };
  }
}

export async function updateProfileService(formData) {
  try {
    const { data } = await axiosInstance.put("/api/auth/update", formData);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Admin Services
export async function getAllUsersService(params = {}) {
  try {
    const { data } = await axiosInstance.get("/api/auth/users", { params });
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

export async function getUserByIdService(userId) {
  try {
    const { data } = await axiosInstance.get(`/api/auth/users/${userId}`);
    return data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}

// Utility function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Utility function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Utility function to remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('token');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// Re-export course services
export * from './courseService';