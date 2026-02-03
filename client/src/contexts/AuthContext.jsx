import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginService, registerService } from '../services/authService';
import { getCurrentUserService } from '../services/index';
import axiosInstance, { TokenManager } from '../api/axiosInstance';
import socketService from '../services/socketService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Form data states for the auth/index.jsx component
  const [signInFormData, setSignInFormData] = useState({
    phoneNumber: '',
    password: ''
  });
  
  const [signUpFormData, setSignUpFormData] = useState({
    firstName: '',
    secondName: '',
    thirdName: '',
    fourthName: '',
    phoneNumber: '',
    password: '',
    phoneStudent: '',
    guardianPhone: '',
    governorate: '',
    grade: '',
    role: 'student' // Added role field
  });

  // Initialize authentication on app start
  const initializeAuth = useCallback(async () => {
    console.log('🚀 AuthContext: Starting authentication initialization...');
    
    let timeoutId;
    
    try {
      setLoading(true);
      setError(null);
      
      // Add timeout to prevent hanging
      timeoutId = setTimeout(() => {
        console.log('⏰ AuthContext: Initialization timeout, setting loading to false');
        setLoading(false);
        setIsInitialized(true);
      }, 10000); // 10 second timeout
      
      const token = TokenManager.getToken();
      const userData = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Initial state check:', {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenInfo: token ? TokenManager.getTokenInfo(token) : null
      });
      
      if (!token) {
        console.log('🔐 AuthContext: No token found - user not authenticated');
        setUser(null);
        setIsInitialized(true);
        setLoading(false);
        return;
      }
      
      // If we have user data in localStorage, use it immediately for better UX
      if (userData) {
        try {
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
          console.log('✅ AuthContext: Restored user from localStorage:', {
            userId: parsedUserData._id,
            role: parsedUserData.role,
            phoneNumber: parsedUserData.phoneNumber
          });
        } catch (error) {
          console.error('❌ AuthContext: Error parsing user data:', error);
          localStorage.removeItem('user');
        }
      }
      
      // Check if token is expired
      if (TokenManager.isTokenExpired(token)) {
        console.log('🔐 AuthContext: Token expired - attempting refresh...');
        
        // Try to refresh the token
        try {
          const refreshResponse = await axiosInstance.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (refreshResponse.data.success) {
            const newToken = refreshResponse.data.token;
            const newUserData = refreshResponse.data.user;
            
            console.log('✅ AuthContext: Token refresh successful:', {
              newTokenLength: newToken.length,
              userRole: newUserData.role
            });
            
            TokenManager.setToken(newToken);
            setUser(newUserData);
            localStorage.setItem('user', JSON.stringify(newUserData));
            
            // Connect to socket.io for real-time updates
            try {
              socketService.connect(newUserData._id);
            } catch (error) {
              console.warn('⚠️ Socket connection failed:', error);
            }
          } else {
            throw new Error('Token refresh failed: Invalid response');
          }
        } catch (refreshError) {
          console.error('❌ AuthContext: Token refresh failed:', refreshError);
          console.log('🗑️ AuthContext: Clearing all authentication data');
          TokenManager.removeToken();
          setUser(null);
          
          // Set error only if it's not a network issue
          if (refreshError.response?.status !== 0) {
            setError('Session expired. Please login again.');
          }
        }
      } else {
        console.log('✅ AuthContext: Token is still valid - validating with server...');
        
        // Token is still valid, validate with server
        try {
          const response = await getCurrentUserService();
          if (response.success && response.user) {
            console.log('✅ AuthContext: Server validation successful:', {
              userRole: response.user.role,
              userId: response.user._id
            });
            
            setUser(response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // Connect to socket.io for real-time updates
            try {
              socketService.connect(response.user._id);
            } catch (error) {
              console.warn('⚠️ Socket connection failed:', error);
            }
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('❌ AuthContext: Server validation failed:', error);
          const status = error.status ?? error.response?.status ?? 0;
          // Only clear auth when server explicitly says token is invalid (401). Network/5xx = keep user.
          if (status === 401) {
            TokenManager.removeToken();
            setUser(null);
            setError(null);
          } else if (status >= 500 || status === 0 || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
            setError('Server temporarily unavailable. Using last known session.');
            // Keep user from localStorage; do not clear token so UI still works when server recovers
            return;
          } else {
            setError('Session expired. Please login again.');
            TokenManager.removeToken();
            setUser(null);
          }
        }
      }
      
    } catch (error) {
      console.error('💥 AuthContext: Critical error during initialization:', error);
      const status = error.status ?? error.response?.status ?? 0;
      if (status === 401) {
        TokenManager.removeToken();
        setUser(null);
        setError(null);
      } else if (status === 0 || status >= 500 || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        setError('Connection issue. Using last known session.');
        // Keep user from localStorage; do not clear token
      } else {
        setError('Failed to initialize authentication');
        TokenManager.removeToken();
        setUser(null);
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsInitialized(true);
      console.log('🏁 AuthContext: Authentication initialization complete');
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    // Add a small delay to prevent race conditions
    const timer = setTimeout(() => {
      initializeAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [initializeAuth]);

  const login = useCallback(async (phoneNumber, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginService(phoneNumber, password);
      console.log('Login response:', response);
      
      if (response && response.success) {
        if (!response.user || !response.token) {
          throw new Error('Invalid response from server - missing user data or token');
        }
        
        const userData = response.user;
        const token = response.token;
        const refreshToken = response.refreshToken;
        
        console.log('✅ AuthContext: Login successful:', {
          userId: userData._id,
          role: userData.role,
          hasToken: !!token,
          hasRefreshToken: !!refreshToken,
          tokenLength: token ? token.length : 0
        });
        
        // Check if role has changed
        const previousRole = user?.role;
        const newRole = userData?.role;
        const roleChanged = previousRole && previousRole !== newRole;
        
        // Store tokens and user data
        const tokenStored = TokenManager.setToken(token);
        if (refreshToken) {
          TokenManager.setRefreshToken(refreshToken);
        }
        
        if (!tokenStored) {
          throw new Error('Failed to store authentication token');
        }
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Store role change for next login
        if (roleChanged) {
          localStorage.setItem('previousRole', previousRole);
          console.log(`Role changed from ${previousRole} to ${newRole}`);
        }
        
        // Connect to socket.io for real-time updates
        try {
          socketService.connect(userData._id);
        } catch (error) {
          console.warn('Socket connection failed:', error);
        }
        
        return { success: true, roleChanged };
      } else {
        throw new Error(response?.message || response?.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await registerService(userData);
      console.log('Register response:', response);
      
      if (response && response.success) {
        if (!response.data || !response.token) {
          throw new Error('Invalid response from server - missing user data or token');
        }
        
        const user = response.data;
        const token = response.token;
        
        // Store token and user data
        TokenManager.setToken(token);
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Connect to socket.io for real-time updates
        try {
          socketService.connect(user._id);
        } catch (error) {
          console.warn('Socket connection failed:', error);
        }
        
        return { success: true };
      } else {
        throw new Error(response?.message || response?.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = error.message || 'حدث خطأ أثناء التسجيل';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      // Clear local state and storage (no server-side logout needed)
      setUser(null);
      setError(null);
      TokenManager.removeToken();
      
      // Disconnect from socket.io
      socketService.disconnect();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    // Check if role has changed
    const previousRole = user?.role;
    const newRole = userData?.role;
    const roleChanged = previousRole && previousRole !== newRole;
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Store role change for next login
    if (roleChanged) {
      localStorage.setItem('previousRole', previousRole);
      console.log(`Role changed from ${previousRole} to ${newRole}`);
    }
  }, [user?.role]);

  const refreshUser = useCallback(async () => {
    try {
      const token = TokenManager.getToken();
      if (!token || TokenManager.isTokenExpired(token)) {
        console.log('No valid token for refresh');
        return null;
      }
      
      const response = await getCurrentUserService();
      if (response.success && response.user) {
        updateUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      
      // If refresh fails due to auth error, logout
      if (error.status === 401) {
        logout();
      }
    }
    return null;
  }, [updateUser, logout]);

  // Functions for auth/index.jsx component
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleLoginUser = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await login(signInFormData.phoneNumber, signInFormData.password);
      if (result.success) {
        const message = result.roleChanged 
          ? 'تم تسجيل الدخول بنجاح - تم تغيير نوع الحساب'
          : 'تم تسجيل الدخول بنجاح';
        return { success: true, message, roleChanged: result.roleChanged };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [login, signInFormData.phoneNumber, signInFormData.password]);

  const handleRegisterUser = useCallback(async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await register(signUpFormData);
      if (result.success) {
        const message = result.roleChanged 
          ? 'تم إنشاء الحساب بنجاح - تم تغيير نوع الحساب'
          : 'تم إنشاء الحساب بنجاح';
        return { success: true, message, roleChanged: result.roleChanged };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'حدث خطأ أثناء التسجيل';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [register, signUpFormData]);

  // Set up socket event listeners when user is logged in
  useEffect(() => {
    if (user && user._id) {
      // Listen for course enrollment events
      const handleCourseEnrolled = (data) => {
        console.log('🎉 Course enrolled:', data);
        // Refresh user data to get updated enrollments
        refreshUser();
        
        // Show success notification
        if (data.courseTitle) {
          console.log(`✅ Course "${data.courseTitle}" has been activated!`);
        }
      };

      socketService.onCourseEnrolled(handleCourseEnrolled);

      // Cleanup listener on unmount or user change
      return () => {
        socketService.offCourseEnrolled(handleCourseEnrolled);
      };
    }
  }, [user, refreshUser]);

  // Computed values
  const isAuthenticated = !!user && !!TokenManager.getToken() && !TokenManager.isTokenExpired(TokenManager.getToken());
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isParent = user?.role === 'parent';

  const value = {
    // State
    user,
    loading,
    error,
    isInitialized,
    
    // Authentication functions
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    
    // Computed values
    isAuthenticated,
    isAdmin,
    isStudent,
    isParent,
    
    // Form data states
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    
    // Handler functions
    handleLoginUser,
    handleRegisterUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};