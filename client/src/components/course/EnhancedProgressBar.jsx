import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Trophy,
  Target,
  Sparkles,
  Zap
} from 'lucide-react';

const EnhancedProgressBar = ({ 
  progress, 
  showDetails = true, 
  variant = 'default',
  className = '',
  onProgressUpdate = null
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;
  
  const [previousProgress, setPreviousProgress] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  if (!progress) {
    return (
      <div className={`w-full ${className}`}>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full h-2"></div>
      </div>
    );
  }

  const {
    progressPercentage = 0,
    completedVideos = 0,
    completedExams = 0,
    totalVideos = 0,
    totalExams = 0,
    totalItems = 0,
    completedItems = 0,
    isCompleted = false
  } = progress;

  // Detect progress changes and trigger XP animation
  useEffect(() => {
    if (progressPercentage > previousProgress && previousProgress > 0) {
      const gained = Math.round(progressPercentage - previousProgress);
      setXpGained(gained);
      setShowXpAnimation(true);
      setIsAnimating(true);
      
      // Trigger progress update callback
      if (onProgressUpdate) {
        onProgressUpdate(gained, progressPercentage);
      }
      
      // Hide XP animation after 2 seconds
      setTimeout(() => {
        setShowXpAnimation(false);
        setIsAnimating(false);
      }, 2000);
    }
    setPreviousProgress(progressPercentage);
  }, [progressPercentage, previousProgress, onProgressUpdate]);

  const progressColor = isCompleted 
    ? colors.success || '#10B981'
    : progressPercentage >= 75 
      ? colors.warning || '#F59E0B'
      : colors.accent;

  const variants = {
    default: {
      container: 'w-full',
      bar: 'h-3',
      details: 'mt-3'
    },
    compact: {
      container: 'w-full',
      bar: 'h-2',
      details: 'mt-2'
    },
    large: {
      container: 'w-full',
      bar: 'h-4',
      details: 'mt-4'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <div className={`${currentVariant.container} ${className}`}>
      {/* Progress Bar */}
      <div className="relative">
        <div 
          className={`w-full ${currentVariant.bar} rounded-full overflow-hidden relative`}
          style={{ 
            backgroundColor: colors.border + '30',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              type: "spring",
              stiffness: 80,
              damping: 25
            }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${progressColor}, ${progressColor}CC, ${progressColor}99)`,
              boxShadow: `0 0 20px ${progressColor}40, inset 0 1px 0 rgba(255,255,255,0.3)`
            }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1.5
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
            />
            
            {/* Enhanced glow effect */}
            <motion.div
              animate={{ 
                opacity: isAnimating ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
                scale: isAnimating ? [1, 1.1, 1] : [1, 1.05, 1]
              }}
              transition={{ 
                duration: isAnimating ? 0.8 : 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${progressColor}80 0%, transparent 70%)`,
                filter: 'blur(3px)'
              }}
            />

            {/* Motivational spark effect */}
            <AnimatePresence>
              {isAnimating && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  >
                    <Sparkles 
                      size={16} 
                      color={colors.success}
                      fill={colors.success}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          {/* Enhanced progress glow overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progressPercentage > 0 ? 0.5 : 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              background: `linear-gradient(90deg, ${progressColor}30, transparent)`,
              filter: 'blur(10px)'
            }}
          />
        </div>
        
        {/* Progress percentage with enhanced styling */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.span 
            className="text-xs font-bold"
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.6 }}
            style={{ 
              color: progressPercentage > 50 ? 'white' : colors.text,
              textShadow: progressPercentage > 50 ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            {Math.round(progressPercentage)}%
          </motion.span>
        </div>

        {/* Floating XP Animation */}
        <AnimatePresence>
          {showXpAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -30, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 0.6,
                  repeat: 2,
                  ease: "easeInOut"
                }}
                className="flex items-center gap-1 px-3 py-1 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${colors.success}, ${colors.accent})`,
                  boxShadow: `0 4px 12px ${colors.success}50`
                }}
              >
                <Zap size={12} color="white" />
                <span className="text-xs font-bold text-white">
                  +{xpGained}%
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced Details */}
      {showDetails && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={currentVariant.details}
        >
          <div className="flex items-center justify-between text-sm">
            {/* Completion Status */}
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30
                  }}
                  className="flex items-center gap-2"
                >
                  <Trophy size={16} color={colors.success} />
                  <span style={{ color: colors.success, fontWeight: '600' }}>
                    مكتمل
                  </span>
                </motion.div>
              ) : (
                <>
                  <Target size={16} color={colors.textMuted} />
                  <span style={{ color: colors.textMuted }}>
                    {completedItems} من {totalItems} مكتمل
                  </span>
                </>
              )}
            </div>

            {/* Progress Stats */}
            <div className="flex items-center gap-4 text-xs" style={{ color: colors.textMuted }}>
              {totalVideos > 0 && (
                <div className="flex items-center gap-1">
                  <PlayCircle size={12} />
                  <span>{completedVideos}/{totalVideos}</span>
                </div>
              )}
              
              {totalExams > 0 && (
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  <span>{completedExams}/{totalExams}</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Progress Breakdown */}
          {totalItems > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-2 grid grid-cols-2 gap-2 text-xs"
            >
              <motion.div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.background + '50' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <PlayCircle size={14} color={colors.accent} />
                  <span style={{ color: colors.text, fontWeight: '500' }}>
                    الفيديوهات
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textMuted }}>
                    {completedVideos} مكتمل
                  </span>
                  <span style={{ color: colors.accent, fontWeight: '600' }}>
                    {totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0}%
                  </span>
                </div>
              </motion.div>

              <motion.div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.background + '50' }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={14} color={colors.accent} />
                  <span style={{ color: colors.text, fontWeight: '500' }}>
                    الامتحانات
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textMuted }}>
                    {completedExams} مكتمل
                  </span>
                  <span style={{ color: colors.accent, fontWeight: '600' }}>
                    {totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0}%
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedProgressBar;
