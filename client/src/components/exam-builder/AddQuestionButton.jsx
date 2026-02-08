import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, AlertCircle, FileText, ChevronDown, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const QUESTION_TYPES = [
  { 
    value: 'mcq', 
    label: 'اختيار من متعدد', 
    icon: CheckCircle, 
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    description: 'سؤال باختيارات متعددة'
  },
  { 
    value: 'true_false', 
    label: 'صح أو خطأ', 
    icon: AlertCircle, 
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    description: 'سؤال بصح أو خطأ'
  },
  { 
    value: 'essay', 
    label: 'مقالي', 
    icon: FileText, 
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    description: 'سؤال مقالي مفتوح'
  }
];

/**
 * AddQuestionButton - Contextual add button with optional type dropdown.
 * Renders as: inline button, or compact with dropdown.
 */
const AddQuestionButton = ({
  onAdd,
  insertAfterId = null,
  variant = 'default', // 'default' | 'compact' | 'minimal'
  className = ''
}) => {
  const { colors, isDarkMode } = useTheme();
  const [showTypes, setShowTypes] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setShowTypes(false);
      }
    };
    
    if (showTypes) {
      document.addEventListener('mousedown', handleClickOutside);
      // Calculate dropdown position with smart positioning for mobile/tablet
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        
        // For mobile, use full width minus padding (centered)
        // For desktop, use button width or minimum 320px
        const dropdownWidth = isMobile 
          ? Math.min(viewportWidth - 32, 400)
          : Math.min(Math.max(rect.width, 320), viewportWidth - 32);
        
        const estimatedHeight = 280; // Approximate dropdown height
        
        // Calculate left position - ensure it doesn't go off screen
        let left;
        
        if (isMobile) {
          // Center horizontally on mobile
          left = (viewportWidth - dropdownWidth) / 2;
        } else {
          // For desktop, align to button
          left = rect.left;
          
          // If dropdown would go off right edge, align to right
          if (left + dropdownWidth > viewportWidth - 16) {
            left = viewportWidth - dropdownWidth - 16;
          }
          
          // If dropdown would go off left edge, align to left
          if (left < 16) {
            left = 16;
          }
        }
        
        // Calculate top position - if not enough space below, show above
        let top = rect.bottom + 8;
        if (top + estimatedHeight > viewportHeight - 16) {
          // Show above button instead
          top = rect.top - estimatedHeight - 8;
          // If still not enough space, center vertically
          if (top < 16) {
            top = Math.max(16, (viewportHeight - estimatedHeight) / 2);
          }
        }
        
        setDropdownPosition({
          top,
          left,
          width: dropdownWidth
        });
      }
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTypes]);

  const handleAdd = (type) => {
    if (typeof onAdd !== 'function') {
      console.warn('AddQuestionButton: onAdd prop is not a function');
      return;
    }
    try {
      const newId = onAdd(type, insertAfterId);
      setShowTypes(false);
      return newId;
    } catch (error) {
      console.error('Error adding question:', error);
      setShowTypes(false);
    }
  };

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (variant === 'minimal') {
      // For minimal variant, directly add MCQ
      handleAdd('mcq');
    } else {
      // For other variants, toggle dropdown
      setShowTypes(prev => !prev);
    }
  };

  const handleOptionClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const type = e.currentTarget.dataset.type;
    if (type) {
      handleAdd(type);
    }
  };

  if (variant === 'minimal') {
    return (
      <motion.button
        type="button"
        onClick={e => {
          e.stopPropagation();
          handleAdd('mcq');
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center justify-center gap-2 py-3 px-4 rounded-xl
          border-2 border-dashed transition-all duration-200
          hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          group relative overflow-hidden
          ${className}
        `}
        style={{
          borderColor: colors.accent + '60',
          backgroundColor: colors.accent + '08',
          color: colors.accent,
          ['--tw-ring-color']: colors.accent
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.5 }}
        />
        <Plus className="w-5 h-5 relative z-10" />
        <span className="font-semibold relative z-10">إضافة سؤال</span>
      </motion.button>
    );
  }

  return (
    <>
      <div ref={buttonRef} className="relative inline-block">
        <motion.button
          type="button"
          onClick={handleTriggerClick}
          onMouseDown={e => e.stopPropagation()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 py-3 px-5 rounded-xl font-semibold
            transition-all duration-200 shadow-lg hover:shadow-xl
            focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
            relative overflow-hidden group
            ${variant === 'compact' ? 'py-2 px-4 text-sm' : 'text-base'}
            ${className}
            ${showTypes ? 'ring-2 ring-offset-2' : ''}
          `}
          style={{
            background: showTypes 
              ? `linear-gradient(135deg, ${colors.accent}EE, ${colors.accent}CC)`
              : `linear-gradient(135deg, ${colors.accent}, ${colors.accent}DD)`,
            color: '#fff',
            ['--tw-ring-color']: colors.accent,
            boxShadow: showTypes 
              ? `0 12px 32px ${colors.accent}50`
              : `0 8px 24px ${colors.accent}30`
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ opacity: showTypes ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          <Plus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">إضافة سؤال</span>
          {variant !== 'minimal' && (
            <motion.div
              animate={{ rotate: showTypes ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showTypes && variant !== 'minimal' && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px]"
                onClick={() => setShowTypes(false)}
              />
              
              {/* Dropdown Menu */}
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ 
                  duration: 0.2, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: 'spring',
                  stiffness: 300,
                  damping: 25
                }}
                onMouseDown={e => e.stopPropagation()}
                className="fixed py-2 rounded-2xl shadow-2xl border-2 overflow-hidden z-[9999]"
                style={{
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  maxWidth: 'calc(100vw - 32px)',
                  maxHeight: 'calc(100vh - 32px)',
                  overflowY: 'auto',
                  background: colors.surfaceElevated || colors.surface || (isDarkMode ? '#1f2937' : '#ffffff'),
                  borderColor: colors.border || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                  boxShadow: isDarkMode
                    ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
                    : '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)'
                }}
              >
                {/* Decorative header */}
                <div 
                  className="px-4 py-3 border-b flex items-center gap-2" 
                  style={{ 
                    borderColor: colors.border || (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                    background: isDarkMode 
                      ? 'rgba(255,255,255,0.02)' 
                      : 'rgba(0,0,0,0.02)'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `1px solid ${colors.accent}30`
                    }}
                  >
                    <Sparkles size={16} color={colors.accent} />
                  </div>
                  <span 
                    className="text-sm font-bold" 
                    style={{ color: colors.text || (isDarkMode ? '#f4f4f5' : '#18181b') }}
                  >
                    اختر نوع السؤال
                  </span>
                </div>

                {/* Options */}
                <div className="py-2">
                  {QUESTION_TYPES.map(({ value, label, icon: Icon, color, bgColor, description }, index) => (
                    <motion.button
                      key={value}
                      type="button"
                      data-type={value}
                      onClick={handleOptionClick}
                      onMouseDown={e => e.stopPropagation()}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ 
                        x: 4, 
                        backgroundColor: isDarkMode 
                          ? 'rgba(255,255,255,0.05)' 
                          : bgColor 
                      }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-4 w-full px-4 py-3.5 text-right transition-all duration-200 group/option relative overflow-hidden"
                      style={{
                        color: colors.text || (isDarkMode ? '#f4f4f5' : '#18181b')
                      }}
                    >
                      {/* Hover background */}
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover/option:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${bgColor}, transparent)`
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      {/* Icon */}
                      <motion.div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 flex-shrink-0 transition-all duration-200"
                        whileHover={{ scale: 1.15, rotate: 5 }}
                        style={{
                          background: bgColor,
                          border: `2px solid ${color}40`,
                          boxShadow: `0 4px 12px ${color}20`
                        }}
                      >
                        <Icon size={20} style={{ color }} />
                      </motion.div>
                      
                      {/* Text */}
                      <div className="flex-1 relative z-10 text-right">
                        <div 
                          className="font-bold text-base mb-0.5" 
                          style={{ color: colors.text || (isDarkMode ? '#f4f4f5' : '#18181b') }}
                        >
                          {label}
                        </div>
                        <div 
                          className="text-xs opacity-70" 
                          style={{ color: colors.textMuted || (isDarkMode ? '#a1a1aa' : '#71717a') }}
                        >
                          {description}
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <motion.div
                        className="relative z-10 opacity-0 group-hover/option:opacity-100 transition-opacity"
                        whileHover={{ x: -2 }}
                      >
                        <ChevronDown 
                          size={16} 
                          className="rotate-[-90deg]"
                          style={{ color: colors.accent }}
                        />
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default AddQuestionButton;
