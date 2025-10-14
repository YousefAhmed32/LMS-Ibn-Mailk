import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isInitialized } = useAuth();

  // Enhanced debugging
  console.log('🔐 ProtectedRoute: Checking access', {
    loading,
    isInitialized,
    hasUser: !!user,
    userRole: user?.role,
    allowedRoles,
    timestamp: new Date().toISOString()
  });

  // Show loading while authentication is being initialized
  if (loading || !isInitialized) {
    console.log('⏳ ProtectedRoute: Still loading or not initialized...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Enhanced role checking with case-insensitive comparison
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    console.log('🔍 ProtectedRoute: Role comparison', {
      userRole,
      normalizedAllowedRoles,
      isAllowed: normalizedAllowedRoles.includes(userRole)
    });

    if (!normalizedAllowedRoles.includes(userRole)) {
      console.log(`❌ ProtectedRoute: Access denied - User role '${user.role}' not in allowed roles:`, allowedRoles);
      
      // Redirect to role-specific dashboard instead of generic /dashboard
      const redirectPath = getRoleBasedRedirectPath(user.role);
      console.log(`🔄 ProtectedRoute: Redirecting to ${redirectPath}`);
      
      return <Navigate to={redirectPath} replace />;
    }
  }

  console.log('✅ ProtectedRoute: Access granted');
  return children;
};

// Helper function to determine redirect path based on user role
const getRoleBasedRedirectPath = (userRole) => {
  const role = userRole?.toLowerCase();
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'parent':
      return '/parent/dashboard';
    case 'student':
      return '/dashboard';
    default:
      console.warn(`⚠️ ProtectedRoute: Unknown role '${userRole}', redirecting to default dashboard`);
      return '/dashboard';
  }
};

export default ProtectedRoute;
