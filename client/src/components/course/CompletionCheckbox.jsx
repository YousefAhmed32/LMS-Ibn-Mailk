import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

const CompletionCheckbox = ({ 
  isCompleted, 
  onToggle, 
  disabled = false,
  loading = false,
  type = 'video', // 'video' or 'exam'
  size = 'default',
  showLabel = true,
  className = ''
}) => {
  const theme = useTheme();
  const { colors, spacing } = theme;

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
      onToggle();
    }
  };

  const labelText = isCompleted 
    ? (type === 'video' ? 'مكتمل' : 'مكتمل')
    : (type === 'video' ? 'ضع علامة كمكتمل' : 'ضع علامة كمكتمل');

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 transition-all duration-200 
        ${currentSize.padding} rounded-lg
        ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
        ${className}
      `}
      style={{
        backgroundColor: isCompleted 
          ? colors.success + '20' 
          : colors.background + '50',
        border: `1px solid ${isCompleted ? colors.success + '30' : colors.border}`
      }}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    >
      {/* Icon */}
      <div className="relative">
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
            {/* Success pulse effect */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.2
              }}
              className="absolute inset-0 rounded-full border-2 border-green-400"
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
          className={`${currentSize.text} font-medium transition-colors duration-200`}
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
          className="ml-auto"
        >
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: colors.success }}
          />
        </motion.div>
      )}
    </motion.button>
  );
};

export default CompletionCheckbox;
