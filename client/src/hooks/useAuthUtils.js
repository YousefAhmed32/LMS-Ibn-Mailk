import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for authentication with additional utilities
 * Provides easy access to auth state and common auth operations
 */
export const useAuthUtils = () => {
  const auth = useAuth();
  
  // Additional utility functions
  const checkAuthStatus = () => {
    return auth.isAuthenticated && auth.user && !auth.loading;
  };
  
  const requireAuth = (redirectTo = '/login') => {
    if (!checkAuthStatus()) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  };
  
  const requireRole = (requiredRole, redirectTo = '/unauthorized') => {
    if (!checkAuthStatus()) {
      window.location.href = '/login';
      return false;
    }
    
    if (auth.user.role !== requiredRole) {
      window.location.href = redirectTo;
      return false;
    }
    
    return true;
  };
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  const isTokenExpired = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };
  
  return {
    ...auth,
    checkAuthStatus,
    requireAuth,
    requireRole,
    getAuthHeaders,
    isTokenExpired
  };
};

export default useAuthUtils;
