import React, { useState, useRef, useEffect } from 'react';
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
  const { colors } = useTheme();
  const [showTypes, setShowTypes] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowTypes(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = type => {
    if (typeof onAdd !== 'function') return;
    const newId = onAdd(type, insertAfterId);
    setShowTypes(false);
    return newId;
  };

  const handleTriggerClick = e => {
    e.stopPropagation();
    e.preventDefault();
    setShowTypes(prev => !prev);
  };

  const handleOptionClick = e => {
    e.stopPropagation();
    const type = e.currentTarget.dataset.type;
    if (type) handleAdd(type);
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
    <div ref={dropdownRef} className="relative inline-block">
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
        `}
        style={{
          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}DD)`,
          color: '#fff',
          ['--tw-ring-color']: colors.accent,
          boxShadow: `0 8px 24px ${colors.accent}30`
        }}
      >
        {showTypes && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
        <Plus className="w-5 h-5 relative z-10" />
        <span className="relative z-10">إضافة سؤال</span>
        <motion.div
          animate={{ rotate: showTypes ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {showTypes && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99]"
              onClick={() => setShowTypes(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onMouseDown={e => e.stopPropagation()}
              className="absolute bottom-full start-0 mb-3 py-2 rounded-2xl shadow-2xl border-2 min-w-[280px] z-[100] overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${colors.surfaceElevated}, ${colors.surface})`,
                borderColor: colors.border,
                boxShadow: `0 20px 60px ${colors.shadow}40`
              }}
            >
              {/* Decorative header */}
              <div className="px-4 py-3 border-b-2" style={{ borderColor: colors.border }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                    background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <Sparkles size={16} color={colors.accent} />
                  </div>
                  <span className="text-sm font-bold" style={{ color: colors.text }}>
                    اختر نوع السؤال
                  </span>
                </div>
              </div>

              {/* Options */}
              <div className="py-1">
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
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 w-full px-4 py-4 text-right transition-all duration-200 group/option relative overflow-hidden"
                    style={{
                      color: colors.text
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
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center relative z-10 flex-shrink-0 transition-transform duration-200 group-hover/option:scale-110"
                      style={{
                        background: bgColor,
                        border: `2px solid ${color}30`
                      }}
                    >
                      <Icon size={20} style={{ color }} />
                    </div>
                    
                    {/* Text */}
                    <div className="flex-1 relative z-10 text-right">
                      <div className="font-bold text-base mb-1" style={{ color: colors.text }}>
                        {label}
                      </div>
                      <div className="text-xs opacity-70" style={{ color: colors.textMuted }}>
                        {description}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div
                      className="relative z-10 opacity-0 group-hover/option:opacity-100 transition-opacity"
                    >
                      <ChevronDown 
                        size={16} 
                        className="rotate-[-90deg]"
                        style={{ color: colors.accent }}
                      />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddQuestionButton;
