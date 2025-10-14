import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

const LuxuryCard = ({ 
  children, 
  variant = 'default',
  hover = true,
  className = '',
  onClick,
  ...props 
}) => {
  const { colors, spacing, borderRadius, shadows, animations } = useTheme();

  const variants = {
    default: {
      background: colors.cardGradient,
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.md
    },
    elevated: {
      background: colors.cardGradient,
      border: `1px solid ${colors.borderLight}`,
      boxShadow: shadows.lg
    },
    glass: {
      background: `rgba(255, 255, 255, ${colors.background === '#FFFFFF' ? '0.1' : '0.05'})`,
      backdropFilter: 'blur(10px)',
      border: `1px solid ${colors.border}`,
      boxShadow: shadows.glow
    },
    accent: {
      background: colors.cardGradient,
      border: `2px solid ${colors.accent}`,
      boxShadow: colors.glow
    }
  };

  const cardStyle = {
    ...variants[variant],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    cursor: onClick ? 'pointer' : 'default',
    transition: `all ${animations.duration.normal} ${animations.easing.easeInOut}`,
    position: 'relative',
    overflow: 'hidden',
    ...props.style
  };

  const hoverEffects = hover ? {
    whileHover: { 
      scale: 1.02,
      boxShadow: shadows.xl,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  } : {};

  return (
    <motion.div
      style={cardStyle}
      className={className}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: animations.easing.easeOut }}
      {...hoverEffects}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default LuxuryCard;
