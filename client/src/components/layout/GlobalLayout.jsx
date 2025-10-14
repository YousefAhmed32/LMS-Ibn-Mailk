import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Navigation from './Navigation';
import AdminHeader from '../admin/AdminHeader';
import Footer from './Footer';

const GlobalLayout = ({ children, showAdminHeader = false }) => {
  const { user } = useAuth();
  
  // Determine which header to show
  const shouldShowAdminHeader = showAdminHeader || (user?.role === 'admin' && window.location.pathname.startsWith('/admin'));
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Unified Header */}
      {shouldShowAdminHeader ? (
        <AdminHeader />
      ) : (
        <Navigation />
      )}
      
      {/* Main Content */}
      <main className={`flex-1 ${shouldShowAdminHeader ? 'pt-20' : 'pt-16'}`}>
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default GlobalLayout;

