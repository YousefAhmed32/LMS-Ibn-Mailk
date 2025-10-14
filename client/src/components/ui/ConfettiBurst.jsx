import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const ConfettiBurst = ({ 
  isActive = false, 
  duration = 2000,
  particleCount = 20,
  colors = null,
  onComplete = null
}) => {
  const theme = useTheme();
  const { colors: themeColors } = theme;
  const [particles, setParticles] = useState([]);

  // Memoize colors to prevent infinite re-renders
  const defaultColors = useMemo(() => {
    return colors || [
      themeColors.accent,
      themeColors.success,
      themeColors.warning,
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7'
    ];
  }, [colors, themeColors.accent, themeColors.success, themeColors.warning]);

  // Memoize onComplete callback to prevent unnecessary re-renders
  const handleComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Memoize particle generation function
  const generateParticles = useCallback(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: defaultColors[Math.floor(Math.random() * defaultColors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      delay: Math.random() * 0.5
    }));
  }, [particleCount, defaultColors]);

  useEffect(() => {
    if (isActive) {
      // Generate random particles
      const newParticles = generateParticles();
      setParticles(newParticles);

      // Clean up after duration
      const timer = setTimeout(() => {
        setParticles([]);
        handleComplete();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Clear particles when not active
      setParticles([]);
    }
  }, [isActive, duration, generateParticles, handleComplete]);

  // Cleanup effect to clear particles on unmount
  useEffect(() => {
    return () => {
      setParticles([]);
    };
  }, []);

  return (
    <AnimatePresence>
      {isActive && particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                opacity: 0,
                scale: 0,
                x: `${particle.x}%`,
                y: `${particle.y}%`,
                rotate: particle.rotation
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: `${particle.x + (Math.random() - 0.5) * 200}%`,
                y: `${particle.y + Math.random() * 100 + 50}%`,
                rotate: particle.rotation + 360
              }}
              transition={{ 
                duration: 2,
                delay: particle.delay,
                ease: "easeOut"
              }}
              className="absolute"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: '50%',
                boxShadow: `0 0 10px ${particle.color}50`
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiBurst;
