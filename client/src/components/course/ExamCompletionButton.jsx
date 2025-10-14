import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

const ExamCompletionButton = ({ 
  examId,
  isCompleted, 
  onToggle, 
  disabled = false,
  loading = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onToggle) {
      onToggle(examId);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${disabled || loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
        ${isCompleted 
          ? 'bg-green-100 text-green-700 border border-green-300' 
          : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
        }
        ${className}
      `}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      aria-pressed={isCompleted}
      aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
    >
      {/* Icon */}
      <div className="relative">
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={16} className="text-blue-500" />
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
            <CheckCircle size={16} className="text-green-600" />
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
            <Circle size={16} className="text-gray-500" strokeWidth={2} />
          </motion.div>
        )}
      </div>

      {/* Label */}
      <span className="text-sm font-medium">
        {isCompleted ? 'Completed' : 'Mark as Completed'}
      </span>
    </motion.button>
  );
};

export default ExamCompletionButton;
