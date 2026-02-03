import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const QUESTION_TYPES = [
  { value: 'mcq', label: 'اختيار من متعدد', icon: CheckCircle },
  { value: 'true_false', label: 'صح أو خطأ', icon: AlertCircle },
  { value: 'essay', label: 'مقالي', icon: FileText }
];

/**
 * FloatingActionButton - Fixed bottom-right FAB for adding questions.
 * Expands to show question type options on click.
 */
const FloatingActionButton = ({ onAdd, visible = true }) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const fabRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = e => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const handleAdd = type => {
    onAdd(type, null);
    setExpanded(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={fabRef}
      className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3"
      style={{ direction: 'rtl' }}
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 mb-2 rounded-xl shadow-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {QUESTION_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleAdd(value)}
                className="flex items-center gap-3 w-full px-5 py-3 text-right hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Icon className="w-5 h-5" style={{ color: colors.accent }} />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-shadow hover:shadow-xl"
        style={{
          backgroundColor: colors.accent,
          color: colors.text
        }}
        aria-label={expanded ? 'إغلاق' : 'إضافة سؤال'}
      >
        <motion.div
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus className="w-7 h-7" />
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;
