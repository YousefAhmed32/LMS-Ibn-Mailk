import axios from "axios";

// Get the base URL - in production it should be the domain root without /api
const getBaseURL = () => {
  // In production, use the full domain
  const prodBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  
  if (import.meta.env.PROD) {
    // In production, baseURL should be just the domain (e.g., https://ibnmailku.cloud)
    // If env var is not set, use window.location.origin as fallback
    const baseUrl = prodBase || window.location.origin;
    console.log('🌐 Production API Base URL:', baseUrl);
    return baseUrl;
  }
  
  // In development, use localhost
  const devUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  console.log('🔧 Development API Base URL:', devUrl);
  return devUrl;
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

// Retry config: only for network/timeout, limited retries
const RETRY_MAX = 2;
const RETRY_DELAY_MS = 1000;

const isRetryableNetworkError = (err) =>
  err.code === 'ECONNABORTED' ||
  err.code === 'ERR_NETWORK' ||
  err.message === 'Network Error' ||
  (err.response?.status === 0 && !err.config?.url?.includes('/auth/refresh'));

// Response interceptor with advanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};

    // Retry on network/timeout (GET and safe idempotent only, avoid auth refresh loop)
    if (originalRequest && isRetryableNetworkError(error)) {
      const method = (originalRequest.method || 'get').toLowerCase();
      const isIdempotent = ['get', 'head', 'options'].includes(method);
      const isAuthRefresh = originalRequest.url?.includes('/auth/refresh');
      const retryCount = (originalRequest._retryCount ?? 0) + 1;
      if (isIdempotent && !isAuthRefresh && retryCount <= RETRY_MAX) {
        originalRequest._retryCount = retryCount;
        const delay = RETRY_DELAY_MS * retryCount;
        await new Promise((r) => setTimeout(r, delay));
        return axiosInstance(originalRequest);
      }
    }

    if (import.meta.env.DEV) {
      console.error('❌ Axios Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      const token = TokenManager.getToken();

      if (!token) {
        TokenManager.removeToken();
        redirectToLogin();
        return Promise.reject(error);
      }

      if (TokenManager.isTokenExpired(token)) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }).catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshResponse = await axiosInstance.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const newToken = refreshResponse.data.token;
          TokenManager.setToken(newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Only clear session when server explicitly says token is invalid (401). Network/5xx = keep token.
          const status = refreshError.response?.status;
          if (status === 401 || status === undefined) {
            TokenManager.removeToken();
            redirectToLogin();
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Token not expired but server returned 401 (e.g. deactivated)
        TokenManager.removeToken();
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    const normalizedError = {
      ...error,
      message: error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred',
      status: error.response?.status ?? 0,
      data: error.response?.data || null,
      code: error.code
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