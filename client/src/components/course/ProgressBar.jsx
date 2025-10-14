import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { CheckCircle, Clock, Target } from 'lucide-react';

const ProgressBar = ({ 
  progress = 0, 
  total = 0, 
  completed = 0, 
  showDetails = true,
  size = 'md',
  variant = 'default' // 'default', 'compact', 'detailed'
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography } = theme;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          height: '4px',
          fontSize: typography.fontSize.xs,
          padding: spacing.xs
        };
      case 'lg':
        return {
          height: '12px',
          fontSize: typography.fontSize.md,
          padding: spacing.md
        };
      default:
        return {
          height: '8px',
          fontSize: typography.fontSize.sm,
          padding: spacing.sm
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="flex-1 rounded-full overflow-hidden"
          style={{
            height: sizeClasses.height,
            backgroundColor: colors.border + '30'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}CC)`
            }}
          />
        </div>
        <span 
          style={{ 
            color: colors.textMuted,
            fontSize: sizeClasses.fontSize,
            fontWeight: 'medium',
            minWidth: '35px'
          }}
        >
          {percentage}%
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div style={{ padding: sizeClasses.padding }}>
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={16} color={colors.accent} />
            <span style={{ 
              color: colors.text, 
              fontSize: typography.fontSize.sm,
              fontWeight: 'bold'
            }}>
              تقدم الدورة
            </span>
          </div>
          <span style={{ 
            color: colors.accent,
            fontSize: typography.fontSize.lg,
            fontWeight: 'bold'
          }}>
            {percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div 
          className="rounded-full overflow-hidden mb-3"
          style={{
            height: sizeClasses.height,
            backgroundColor: colors.border + '30'
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full relative"
            style={{
              background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}CC)`
            }}
          >
            {/* Animated shine effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: 'loop',
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          </motion.div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} color={colors.success} />
            <span style={{ 
              color: colors.textMuted,
              fontSize: typography.fontSize.xs
            }}>
              مكتمل: {completed}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={14} color={colors.textMuted} />
            <span style={{ 
              color: colors.textMuted,
              fontSize: typography.fontSize.xs
            }}>
              إجمالي: {total}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div style={{ padding: sizeClasses.padding }}>
      {showDetails && (
        <div className="flex items-center justify-between mb-2">
          <span style={{ 
            color: colors.text,
            fontSize: sizeClasses.fontSize,
            fontWeight: 'medium'
          }}>
            التقدم
          </span>
          <span style={{ 
            color: colors.accent,
            fontSize: sizeClasses.fontSize,
            fontWeight: 'bold'
          }}>
            {percentage}%
          </span>
        </div>
      )}
      
      <div 
        className="rounded-full overflow-hidden"
        style={{
          height: sizeClasses.height,
          backgroundColor: colors.border + '30'
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}CC)`
          }}
        />
      </div>
      
      {showDetails && total > 0 && (
        <div className="flex items-center justify-between mt-2 text-xs" style={{ color: colors.textMuted }}>
          <span>{completed} من {total} مكتمل</span>
          <span>{total - completed} متبقي</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;