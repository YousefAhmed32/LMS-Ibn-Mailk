import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckCircle, Circle, Loader2, Sparkles, Zap } from 'lucide-react';

const EnhancedCompletionCheckbox = ({ 
  isCompleted, 
  onToggle, 
  disabled = false,
  loading = false,
  type = 'video', // 'video' or 'exam'
  size = 'default',
  showLabel = true,
  className = '',
  onCompletion = null
}) => {
  const theme = useTheme();
  const { colors, spacing } = theme;
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizes = {
    small: {
      icon: 16,
      text: 'text-xs',
      padding: 'p-1'
    },
    default: {
      icon: 20,
      text: 'text-sm',
      padding: 'p-2'
    },
    large: {
      icon: 24,
      text: 'text-base',
      padding: 'p-3'
    }
  };

  const currentSize = sizes[size] || sizes.default;

  const handleClick = () => {
    if (!disabled && !loading && onToggle) {
      // Trigger completion animation if marking as completed
      if (!isCompleted) {
        setIsAnimating(true);
        setShowConfetti(true);
        
        // Trigger completion callback
        if (onCompletion) {
          onCompletion(type);
        }
        
        // Hide confetti after animation
        setTimeout(() => {
          setShowConfetti(false);
          setIsAnimating(false);
        }, 2000);
      }
      
      onToggle();
    }
  };

  const labelText = isCompleted 
    ? (type === 'video' ? 'مكتمل' : 'مكتمل')
    : (type === 'video' ? 'ضع علامة كمكتمل' : 'ضع علامة كمكتمل');

  return (
    <div className="relative">
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-8 -left-4 z-10 pointer-events-none"
          >
            <motion.div
              animate={{ 
                y: [-20, -40, -60],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 0.8]
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut"
              }}
            >
              <Sparkles 
                size={20} 
                color={colors.success}
                fill={colors.success}
              />
            </motion.div>
            
            {/* Additional sparkles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (i - 1) * 20],
                  y: [-10, -30, -50]
                }}
                transition={{ 
                  duration: 1.2,
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <Zap 
                  size={12} 
                  color={colors.accent}
                  fill={colors.accent}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled || loading}
        className={`
          flex items-center gap-2 transition-all duration-200 
          ${currentSize.padding} rounded-lg relative overflow-hidden
          ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
          ${className}
        `}
        style={{
          backgroundColor: isCompleted 
            ? colors.success + '20' 
            : colors.background + '50',
          border: `2px solid ${isCompleted ? colors.success + '30' : colors.border}`,
          boxShadow: isAnimating 
            ? `0 0 20px ${colors.success}50` 
            : isCompleted 
              ? `0 4px 12px ${colors.success}30`
              : 'none'
        }}
        whileHover={!disabled && !loading ? { 
          scale: 1.02,
          boxShadow: `0 6px 16px ${colors.accent}30`
        } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      >
        {/* Glow effect during animation */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(circle, ${colors.success}30 0%, transparent 70%)`,
                filter: 'blur(8px)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <div className="relative z-10">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 
                size={currentSize.icon} 
                color={colors.accent}
              />
            </motion.div>
          ) : isCompleted ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                duration: 0.6
              }}
              className="relative"
            >
              <CheckCircle 
                size={currentSize.icon} 
                color={colors.success}
                fill={colors.success + '20'}
              />
              
              {/* Enhanced success pulse effect */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ 
                  duration: 1, 
                  ease: "easeOut",
                  delay: 0.2
                }}
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: colors.success }}
              />
              
              {/* Additional pulse rings */}
              <motion.div
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ 
                  duration: 1.2, 
                  ease: "easeOut",
                  delay: 0.4
                }}
                className="absolute inset-0 rounded-full border border-green-400"
              />
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Circle 
                size={currentSize.icon} 
                color={colors.textMuted}
                strokeWidth={2}
              />
            </motion.div>
          )}
        </div>

        {/* Label */}
        {showLabel && (
          <span 
            className={`${currentSize.text} font-medium transition-colors duration-200 relative z-10`}
            style={{ 
              color: isCompleted ? colors.success : colors.textMuted 
            }}
          >
            {labelText}
          </span>
        )}

        {/* Completion indicator */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="ml-auto relative z-10"
          >
            <motion.div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: colors.success }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}

        {/* Motivational glow effect */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${colors.success}20, ${colors.accent}20)`,
                boxShadow: `0 0 30px ${colors.success}60`
              }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default EnhancedCompletionCheckbox;
