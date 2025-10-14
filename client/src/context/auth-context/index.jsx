import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { createContext, useState, useEffect, useContext } from "react";
import { 
  registerService, 
  loginService, 
  getCurrentUserService, 
  updateProfileService,
  setAuthToken,
  getAuthToken,
  removeAuthToken
} from "@/services";

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth token on mount
  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      setAuthToken(savedToken);
      fetchCurrentUser();
    }
  }, []);

  // Fetch current user when token changes
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setUser(null);
    }
  }, [token]);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentUserService();
      setUser(response.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.error === 'Invalid token' || error.error === 'Token expired') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Register user
  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await registerService(signUpFormData);
      
      if (response.success) {
        // Set token and user
        setToken(response.token);
        setAuthToken(response.token);
        setUser(response.user);
        
        // Reset form
        setSignUpFormData(initialSignUpFormData);
        
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.error || 'Registration failed');
      return { success: false, error: error.error || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  }

  // Login user
  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await loginService(signInFormData);
      
      if (response.success) {
        // Set token and user
        setToken(response.token);
        setAuthToken(response.token);
        setUser(response.user);
        
        // Reset form
        setSignInFormData(initialSignInFormData);
        
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.error || 'Login failed');
      return { success: false, error: error.error || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }

  // Update profile
  async function handleUpdateProfile(updateData) {
    try {
      setLoading(true);
      setError(null);
      
      const response = await updateProfileService(updateData);
      
      if (response.success) {
        setUser(response.user);
        return { success: true, message: response.message };
      }
    } catch (error) {
      setError(error.error || 'Profile update failed');
      return { success: false, error: error.error || 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  }

  // Logout user
  const logout = () => {
    setUser(null);
    setToken(null);
    removeAuthToken();
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Check if user is student
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        // Form data
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        
        // User state
        user,
        token,
        loading,
        error,
        
        // Authentication functions
        handleRegisterUser,
        handleLoginUser,
        handleUpdateProfile,
        logout,
        clearError,
        
        // Utility functions
        isAuthenticated,
        isAdmin,
        isStudent,
        fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
