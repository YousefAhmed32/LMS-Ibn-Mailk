import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GlobalLayout from '../components/layout/GlobalLayout';
import HeroSection from '../components/landing/HeroSection';
import AboutSection from '../components/landing/AboutSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ParentsSection from '../components/landing/ParentsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CallToActionSection from '../components/landing/CallToActionSection';

const LandingPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect admin users to admin dashboard
    if (!loading && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page for admin users (they will be redirected)
  if (user?.role === 'admin') {
    return null;
  }
  return (
    <GlobalLayout>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ParentsSection />
      <TestimonialsSection />
      <CallToActionSection />
    </GlobalLayout>
  );
};

export default LandingPage;
