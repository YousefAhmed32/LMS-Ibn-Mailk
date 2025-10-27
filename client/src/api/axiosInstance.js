import axios from "axios";

// Get the base URL - in production it should be the domain root without /api
const getBaseURL = () => {
  // In production, use the full domain
  const prodBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (import.meta.env.PROD && prodBase) {
    // In production, baseURL should be just the domain (e.g., https://ibnmailku.cloud)
    // The API calls will add /api/ themselves
    return prodBase;
  }
  
  // In development, use localhost
  return "http://localhost:5000";
};

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced Token management utilities
const TokenManager = {
  getToken: () => {
    try {
      const token = localStorage.getItem('token');
      // console.log('🔐 TokenManager.getToken:', token ? 'Token found' : 'No token');
      return token;
    } catch (error) {
      console.error('❌ Error getting token from localStorage:', error);
      return null;
    }
  },
  
  setToken: (token) => {
    try {
      if (!token) {
        console.warn('⚠️ Attempting to set empty token');
        return false;
      }
      localStorage.setItem('token', token);
      console.log('✅ TokenManager.setToken: Token stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error setting token in localStorage:', error);
      return false;
    }
  },
  
  getRefreshToken: () => {
    try {
      return localStorage.getItem('refreshToken');
    } catch (error) {
      console.error('❌ Error getting refresh token:', error);
      return null;
    }
  },
  
  setRefreshToken: (refreshToken) => {
    try {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        console.log('✅ Refresh token stored successfully');
      }
      return true;
    } catch (error) {
      console.error('❌ Error setting refresh token:', error);
      return false;
    }
  },
  
  removeToken: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('previousRole');
      console.log('🗑️ All tokens and user data removed');
      return true;
    } catch (error) {
      console.error('❌ Error removing token from localStorage:', error);
      return false;
    }
  },
  
  isTokenExpired: (token) => {
    if (!token) {
      // console.log('🔐 TokenManager.isTokenExpired: No token provided');
      return true;
    }
    
    try {
      // Decode JWT without verification to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      // console.log('🔐 TokenManager.isTokenExpired:', {
      //   tokenProvided: !!token,
      //   expiresAt: new Date(payload.exp * 1000).toISOString(),
      //   currentTime: new Date(currentTime * 1000).toISOString(),
      //   isExpired
      // });
      
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking token expiration:', error);
      return true;
    }
  },
  
  // Get token info for debugging
  getTokenInfo: (token) => {
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
        isExpired: payload.exp < (Date.now() / 1000),
        type: payload.type || 'access'
      };
    } catch (error) {
      console.error('❌ Error parsing token:', error);
      return null;
    }
  }
};

// Request queue for handling concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    
    // Add token to request headers
    if (token && !TokenManager.isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        tokenExpired: TokenManager.isTokenExpired(token)
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with advanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details
    console.error('❌ Axios Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = TokenManager.getToken();
      
      // If no token exists, redirect to login
      if (!token) {
        console.warn('🔐 No token found - redirecting to login');
        TokenManager.removeToken();
        redirectToLogin();
        return Promise.reject(error);
      }
      
      // If token is expired, try to refresh or logout
      if (TokenManager.isTokenExpired(token)) {
        console.warn('🔐 Token expired - attempting refresh');
        
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
        
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
          // Attempt to refresh token by calling /api/auth/refresh
          const refreshResponse = await axiosInstance.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const newToken = refreshResponse.data.token;
          TokenManager.setToken(newToken);
          
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
          
        } catch (refreshError) {
          console.error('🔐 Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          
          // Refresh failed, logout user
          TokenManager.removeToken();
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Token exists but server rejected it - user might be deactivated
        console.warn('🔐 Token rejected by server - user might be deactivated');
        TokenManager.removeToken();
        redirectToLogin();
        return Promise.reject(error);
      }
    }
    
    // Handle other error types
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      console.error('🌐 Network error - server might be down');
      // Don't retry to prevent infinite loops
      console.log('🌐 Network error - not retrying to prevent infinite loops');
    } else if (error.response?.status >= 500) {
      console.error('🔥 Server error:', error.response.status, error.response.data);
    } else if (error.response?.status >= 400) {
      console.warn('⚠️ Client error:', error.response.status, error.response.data);
    }
    
    // Normalize error response for consistent handling
    const normalizedError = {
      ...error,
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status || 0,
      data: error.response?.data || null
    };
    
    return Promise.reject(normalizedError);
  }
);

// Helper function to redirect to login
const redirectToLogin = () => {
  // Only redirect if not already on login page and not in a protected route
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath === '/login' || currentPath === '/auth';
  const isPublicRoute = ['/', '/about', '/contact'].includes(currentPath);
  
  if (!isLoginPage && !isPublicRoute) {
    // Store the current path to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', currentPath);
    window.location.href = '/login';
  }
};

// Export token manager for use in AuthContext
export { TokenManager };

export default axiosInstance;