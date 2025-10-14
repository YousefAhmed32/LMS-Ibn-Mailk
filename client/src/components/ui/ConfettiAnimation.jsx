import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfettiAnimation = ({ 
  isActive, 
  onComplete, 
  duration = 3000,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']
}) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (isActive) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5
      }));
      
      setParticles(newParticles);

      // Clean up after animation
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete, colors]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              rotate: particle.rotation,
              scale: 0
            }}
            animate={{
              x: `${particle.x + (Math.random() - 0.5) * 20}vw`,
              y: '110vh',
              rotate: particle.rotation + 720,
              scale: [0, 1, 0.8, 0]
            }}
            transition={{
              duration: 3,
              delay: particle.delay,
              ease: "easeOut"
            }}
            exit={{ scale: 0 }}
            className="absolute"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size}px ${particle.color}`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiAnimation;
