import React, { useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const LuxuryNotification = ({ 
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  onClose,
  position = 'top-right'
}) => {
  const { colors, spacing, borderRadius, shadows, animations } = useTheme();

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  };

  const typeColors = {
    success: {
      background: colors.success,
      text: colors.background,
      icon: colors.background
    },
    error: {
      background: colors.error,
      text: colors.background,
      icon: colors.background
    },
    warning: {
      background: colors.warning,
      text: colors.background,
      icon: colors.background
    },
    info: {
      background: colors.info,
      text: colors.background,
      icon: colors.background
    }
  };

  const Icon = icons[type];
  const typeColor = typeColors[type];

  const positions = {
    'top-right': { top: spacing.lg, right: spacing.lg },
    'top-left': { top: spacing.lg, left: spacing.lg },
    'bottom-right': { bottom: spacing.lg, right: spacing.lg },
    'bottom-left': { bottom: spacing.lg, left: spacing.lg },
    'top-center': { top: spacing.lg, left: '50%', transform: 'translateX(-50%)' },
    'bottom-center': { bottom: spacing.lg, left: '50%', transform: 'translateX(-50%)' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: position.includes('right') ? 300 : -300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: animations.easing.easeOut }}
      style={{
        position: 'fixed',
        zIndex: 9999,
        ...positions[position],
        background: colors.surface,
        border: `2px solid ${typeColor.background}`,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        minWidth: '320px',
        maxWidth: '400px',
        boxShadow: shadows.xl,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
        <div
          style={{
            background: typeColor.background,
            borderRadius: borderRadius.full,
            padding: spacing.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={20} color={typeColor.icon} />
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {title && (
            <h4 style={{
              margin: 0,
              marginBottom: spacing.xs,
              color: colors.text,
              fontSize: '1rem',
              fontWeight: 600
            }}>
              {title}
            </h4>
          )}
          <p style={{
            margin: 0,
            color: colors.textSecondary,
            fontSize: '0.875rem',
            lineHeight: 1.5
          }}>
            {message}
          </p>
        </div>
        
        <button
          onClick={() => onClose(id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.textMuted,
            cursor: 'pointer',
            padding: spacing.xs,
            borderRadius: borderRadius.sm,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: `color ${animations.duration.fast} ${animations.easing.easeInOut}`,
            flexShrink: 0
          }}
          onMouseEnter={(e) => e.target.style.color = colors.text}
          onMouseLeave={(e) => e.target.style.color = colors.textMuted}
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

const NotificationContainer = ({ notifications, onClose, position = 'top-right' }) => {
  return (
    <AnimatePresence>
      {notifications.map((notification) => (
        <LuxuryNotification
          key={notification.id}
          {...notification}
          onClose={onClose}
          position={position}
        />
      ))}
    </AnimatePresence>
  );
};

export { LuxuryNotification, NotificationContainer };
