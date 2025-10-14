import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

const SmartDashboardRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Route based on user role
      switch (user.role) {
        case 'parent':
          navigate('/parent/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          // Default to student dashboard for unknown roles
          navigate('/student/dashboard');
          break;
      }
    } else {
      // If no user, redirect to login
      navigate('/login');
    }
  }, [user, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          جاري التوجيه...
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {user?.role === 'parent' && 'توجيهك إلى لوحة تحكم ولي الأمر'}
          {user?.role === 'student' && 'توجيهك إلى لوحة تحكم الطالب'}
          {user?.role === 'admin' && 'توجيهك إلى لوحة تحكم الإدارة'}
        </p>
      </div>
    </div>
  );
};

export default SmartDashboardRouter;
