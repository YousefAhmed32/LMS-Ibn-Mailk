import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder.jpg',
  loading = 'lazy',
  quality = 75,
  width,
  height,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Generate optimized image URL
  const getOptimizedUrl = (originalSrc) => {
    if (!originalSrc) return placeholder;
    
    // If it's already a full URL, return as is
    if (originalSrc.startsWith('http')) return originalSrc;
    
    // If it's a local path, add the server URL
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    return `${baseUrl}${originalSrc}`;
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(getOptimizedUrl(src));
              setIsLoading(false);
            };
            img.onerror = () => {
              setHasError(true);
              setIsLoading(false);
            };
            img.src = getOptimizedUrl(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
      {...props}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse flex items-center justify-center"
        >
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      {/* Error state */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
        >
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">فشل في تحميل الصورة</p>
          </div>
        </motion.div>
      )}

      {/* Actual image */}
      {!isLoading && !hasError && (
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={imageSrc}
          alt={alt}
          className="w-full h-full object-cover"
          loading={loading}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

