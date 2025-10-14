import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const LuxuryButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = '',
  type = 'button',
  ...props 
}) => {
  const { colors, typography, spacing, borderRadius, shadows, animations } = useTheme();

  const variants = {
    primary: {
      background: colors.buttonGradient,
      color: colors.background,
      border: 'none',
      boxShadow: colors.glow,
      '&:hover': {
        boxShadow: colors.glowStrong,
        transform: 'translateY(-2px)'
      }
    },
    secondary: {
      background: 'transparent',
      color: colors.accent,
      border: `2px solid ${colors.accent}`,
      '&:hover': {
        background: colors.accent,
        color: colors.background,
        boxShadow: colors.glow
      }
    },
    ghost: {
      background: 'transparent',
      color: colors.text,
      border: 'none',
      '&:hover': {
        background: colors.surface,
        color: colors.accent
      }
    },
    danger: {
      background: colors.error,
      color: colors.background,
      border: 'none',
      '&:hover': {
        background: '#FF5252',
        boxShadow: `0 0 20px rgba(255, 107, 107, 0.3)`
      }
    }
  };

  const sizes = {
    sm: {
      padding: `${spacing.sm} ${spacing.md}`,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.md
    },
    md: {
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize.base,
      borderRadius: borderRadius.lg
    },
    lg: {
      padding: `${spacing.lg} ${spacing.xl}`,
      fontSize: typography.fontSize.lg,
      borderRadius: borderRadius.xl
    },
    xl: {
      padding: `${spacing.xl} ${spacing['2xl']}`,
      fontSize: typography.fontSize.xl,
      borderRadius: borderRadius['2xl']
    }
  };

  const buttonStyle = {
    ...variants[variant],
    ...sizes[size],
    fontFamily: typography.fontFamily.body,
    fontWeight: typography.fontWeight.semibold,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    textDecoration: 'none',
    outline: 'none',
    ...props.style
  };

  const LoadingSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '16px',
        height: '16px',
        border: `2px solid transparent`,
        borderTop: `2px solid currentColor`,
        borderRadius: '50%'
      }}
    />
  );

  return (
    <motion.button
      type={type}
      style={buttonStyle}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { 
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={!disabled && !loading ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: animations.easing.easeOut }}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </motion.button>
  );
};

export default LuxuryButton;
