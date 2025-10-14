import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Trophy,
  Target,
  Clock
} from 'lucide-react';

const CourseProgressBar = ({ 
  progress, 
  showDetails = true, 
  variant = 'default',
  className = '' 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;

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
              duration: 0.8, 
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
              damping: 20
            }}
            className="h-full rounded-full relative overflow-hidden"
            style={{ 
              background: `linear-gradient(90deg, ${progressColor}, ${progressColor}CC)`,
              boxShadow: `0 0 20px ${progressColor}40, inset 0 1px 0 rgba(255,255,255,0.3)`
            }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 1
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            />
            
            {/* Glow effect */}
            <motion.div
              animate={{ 
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 rounded-full"
              style={{ 
                background: `radial-gradient(circle, ${progressColor}60 0%, transparent 70%)`,
                filter: 'blur(2px)'
              }}
            />
          </motion.div>
          
          {/* Progress glow overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progressPercentage > 0 ? 0.4 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ 
              background: `linear-gradient(90deg, ${progressColor}20, transparent)`,
              filter: 'blur(8px)'
            }}
          />
        </div>
        
        {/* Progress percentage */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span 
            className="text-xs font-semibold"
            style={{ 
              color: progressPercentage > 50 ? 'white' : colors.text,
              textShadow: progressPercentage > 50 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>

      {/* Details */}
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
                <>
                  <Trophy size={16} color={colors.success} />
                  <span style={{ color: colors.success, fontWeight: '600' }}>
                    مكتمل
                  </span>
                </>
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

          {/* Progress Breakdown */}
          {totalItems > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.background + '50' }}
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
              </div>

              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: colors.background + '50' }}
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
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CourseProgressBar;
