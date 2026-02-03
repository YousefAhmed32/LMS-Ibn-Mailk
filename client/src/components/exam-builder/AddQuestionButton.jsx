import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'اختيار من متعدد', icon: CheckCircle, color: 'text-blue-600' },
  { value: 'true_false', label: 'صح أو خطأ', icon: AlertCircle, color: 'text-emerald-600' },
  { value: 'essay', label: 'مقالي', icon: FileText, color: 'text-amber-600' }
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
      <button
        type="button"
        onClick={e => {
          e.stopPropagation();
          handleAdd('mcq');
        }}
        className={`
          flex items-center justify-center gap-2 py-3 px-4 rounded-xl
          border-2 border-dashed transition-all duration-200
          hover:scale-[1.02] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${className}
        `}
        style={{
          borderColor: colors.accent + '60',
          backgroundColor: colors.accent + '08',
          color: colors.accent,
          ['--tw-ring-color']: colors.accent
        }}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">إضافة سؤال</span>
      </button>
    );
  }

  return (
    // <div ref={dropdownRef} className="relative inline-block">
    //   <motion.button
    //     type="button"
    //     onClick={handleTriggerClick}
    //     onMouseDown={e => e.stopPropagation()}
    //     whileHover={{ scale: 1.02 }}
    //     whileTap={{ scale: 0.98 }}
    //     className={`
    //       flex items-center gap-2 py-3 px-5 rounded-xl font-medium
    //       transition-all duration-200 shadow-md hover:shadow-lg
    //       focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    //       ${variant === 'compact' ? 'py-2 px-4 text-sm' : ''}
    //       ${className}
    //     `}
    //     style={{
    //       backgroundColor: colors.accent,
    //       color: '#fff',
    //       ['--tw-ring-color']: colors.accent
    //     }}
    //   >
    //     <Plus className="w-5 h-5" />
    //     <span>إضافة سؤال</span>
    //   </motion.button>

    //   <AnimatePresence>
    //     {showTypes && (
    //       <motion.div
    //         initial={{ opacity: 0, y: 8, scale: 0.96 }}
    //         animate={{ opacity: 1, y: 0, scale: 1 }}
    //         exit={{ opacity: 0, y: 8, scale: 0.96 }}
    //         transition={{ duration: 0.2 }}
    //         onMouseDown={e => e.stopPropagation()}
    //         className="absolute bottom-full start-0 mb-2 py-1.5 rounded-xl shadow-xl border-2 min-w-[220px] z-[100]"
    //         style={{
    //           background: 'var(--exam-builder-card, #fff)',
    //           borderColor: 'var(--exam-builder-border, rgba(0,0,0,0.08))'
    //         }}
    //       >
    //         {QUESTION_TYPES.map(({ value, label, icon: Icon, color }) => (
    //           <button
    //             key={value}
    //             type="button"
    //             data-type={value}
    //             onClick={handleOptionClick}
    //             onMouseDown={e => e.stopPropagation()}
    //             className="flex items-center gap-3 w-full px-4 py-3 text-right transition-colors first:rounded-t-[10px] last:rounded-b-[10px] hover:bg-emerald-50 dark:hover:bg-gray-700/80 focus:outline-none focus-visible:bg-emerald-50 dark:focus-visible:bg-gray-700/80"
    //           >
    //             <Icon className={`w-5 h-5 shrink-0 ${color}`} />
    //             <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
    //           </button>
    //         ))}
    //       </motion.div>
    //     )}
    //   </AnimatePresence>
    // </div>
    <div></div>
  );
};

export default AddQuestionButton;
