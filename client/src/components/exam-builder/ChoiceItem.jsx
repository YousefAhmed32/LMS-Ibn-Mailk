import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MIN_CHOICES = 2;

/**
 * ChoiceItem - Single MCQ choice with text input, radio, and delete.
 * Uses { id, text, isCorrect } structure.
 */
const ChoiceItem = React.memo(
  ({ choice, questionId, totalChoices, onUpdate, onDelete, onSetCorrect, isDarkMode }) => {
    const { colors, borderRadius } = useTheme();
    const canDelete = totalChoices > MIN_CHOICES;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={`
          flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200
          ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'}
          ${choice.isCorrect ? 'border-emerald-500' : isDarkMode ? 'border-gray-600' : 'border-gray-200'}
          ${choice.isCorrect && (isDarkMode ? 'bg-emerald-900/20' : 'bg-emerald-50/80')}
        `}
      >
        {/* Radio - correct answer selector */}
        <button
          type="button"
          onClick={() => onSetCorrect(questionId, choice.id)}
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center
            transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2
            ${choice.isCorrect ? 'border-emerald-500 bg-emerald-500' : isDarkMode ? 'border-gray-500' : 'border-gray-400'}
          `}
          aria-label={choice.isCorrect ? 'الإجابة الصحيحة' : 'تحديد كإجابة صحيحة'}
        >
          {choice.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
        </button>

        {/* Text input */}
        <input
          type="text"
          value={choice.text}
          onChange={e => onUpdate(questionId, choice.id, 'text', e.target.value)}
          placeholder={`الخيار ${choice.id.slice(-3)}`}
          className={`
            flex-1 px-3 py-2 rounded-lg border text-base
            transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50
            ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}
          `}
        />

        {/* Correct badge */}
        {choice.isCorrect && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            صحيح
          </span>
        )}

        {/* Delete */}
        {canDelete && (
          <button
            type="button"
            onClick={() => onDelete(questionId, choice.id)}
            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
            aria-label="حذف الخيار"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    );
  }
);

ChoiceItem.displayName = 'ChoiceItem';
export default ChoiceItem;
