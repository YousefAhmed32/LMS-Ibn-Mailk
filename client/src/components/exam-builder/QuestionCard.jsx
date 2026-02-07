  import React, { useRef, useEffect } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { Trash2, Copy, Plus, CheckCircle, AlertCircle, FileText } from 'lucide-react';
  import { useTheme } from '../../contexts/ThemeContext';
  import ChoiceItem from './ChoiceItem';
  import AddQuestionButton from './AddQuestionButton';

  const QUESTION_TYPES = [
    { value: 'mcq', label: 'اختيار من متعدد', icon: CheckCircle },
    { value: 'true_false', label: 'صح أو خطأ', icon: AlertCircle },
    { value: 'essay', label: 'مقالي', icon: FileText }
  ];

  /**
   * QuestionCard - Standalone card for a single question.
   * Includes: type selector, text input, dynamic choices (MCQ), actions.
   */
  const QuestionCard = React.memo(
    ({
      question,
      index,
      isDarkMode,
      onUpdate,
      onRemove,
      onDuplicate,
      onAddChoice,
      onRemoveChoice,
      onUpdateChoice,
      onSetCorrectAnswer,
      onAddQuestion
    }) => {
      const { colors, borderRadius } = useTheme();
      const questionInputRef = useRef(null);

      // Auto-focus when card mounts (e.g. after add)
      useEffect(() => {
        questionInputRef.current?.focus();
      }, []);

      const choices = question.choices ?? [];

      return (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className={`
            rounded-2xl border overflow-hidden
            ${isDarkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white border-gray-200'}
            shadow-sm hover:shadow-md transition-shadow duration-200
          `}
        >
          <div className="p-6">
            {/* Header: number, type selector, actions */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: colors.accent + '25', color: colors.accent }}
                >
                  {index + 1}
                </div>
                <select
                  value={question.type}
                  onChange={e => onUpdate(question.id, 'type', e.target.value)}
                  className={`
                    px-3 py-2 rounded-xl text-sm font-medium border
                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}
                  `}
                >
                  {QUESTION_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDuplicate(question.id)}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  aria-label="تكرار السؤال"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(question.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="حذف السؤال"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question text */}
            <div className="mb-5">
              <textarea
                ref={questionInputRef}
                value={question.questionText}
                onChange={e => onUpdate(question.id, 'questionText', e.target.value)}
                rows={2}
                placeholder="أدخل نص السؤال هنا..."
                className={`
                  w-full px-4 py-3 rounded-xl border text-base resize-none
                  focus:outline-none focus:ring-2 focus:ring-offset-0
                  ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:ring-emerald-500/30'}
                `}
              />
            </div>

            {/* MCQ choices */}
            {question.type === 'mcq' && (
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    الخيارات
                  </span>
                </div>
                <AnimatePresence mode="popLayout">
                  {choices.map(choice => (
                    <ChoiceItem
                      key={choice.id}
                      choice={choice}
                      questionId={question.id}
                      totalChoices={choices.length}
                      onUpdate={onUpdateChoice}
                      onDelete={onRemoveChoice}
                      onSetCorrect={onSetCorrectAnswer}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </AnimatePresence>
                <motion.button
                  type="button"
                  onClick={() => onAddChoice(question.id)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`
                    flex items-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed
                    transition-colors duration-200
                    ${isDarkMode ? 'border-gray-600 text-gray-400 hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-900/10' : 'border-gray-300 text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}
                  `}
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">إضافة خيار</span>
                </motion.button>
              </div>
            )}

            {/* True/False */}
            {question.type === 'true_false' && (
              <div className="flex gap-4 mb-5">
                <button
                  type="button"
                  onClick={() => onUpdate(question.id, 'correctAnswer', true)}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-xl border-2 font-medium transition-all
                    ${question.correctAnswer === true
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                      : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}
                  `}
                >
                  <CheckCircle className="w-5 h-5" />
                  صح
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(question.id, 'correctAnswer', false)}
                  className={`
                    flex items-center gap-3 px-6 py-3 rounded-xl border-2 font-medium transition-all
                    ${question.correctAnswer === false
                      ? 'border-red-500 bg-red-500 text-white shadow-md'
                      : isDarkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-300 text-gray-600 hover:border-gray-400'}
                  `}
                >
                  <AlertCircle className="w-5 h-5" />
                  خطأ
                </button>
              </div>
            )}

            {/* Essay */}
            {question.type === 'essay' && (
              <div className={`py-4 px-4 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  سؤال مقالي - يحتاج تصحيح يدوي
                </p>
              </div>
            )}

            {/* Footer: marks + Add Question below */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>النقاط:</span>
                <input
                  type="number"
                  min={1}
                  value={question.marks}
                  onChange={e => onUpdate(question.id, 'marks', parseInt(e.target.value, 10) || 10)}
                  className={`
                    w-16 px-2 py-1.5 rounded-lg border text-sm
                    ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}
                  `}
                />
              </div>
              <AddQuestionButton
                onAdd={onAddQuestion}
                insertAfterId={question.id}
                variant="minimal"
              />
            </div>
          </div>
        </motion.div>
      );
    }
  );

  QuestionCard.displayName = 'QuestionCard';
  export default QuestionCard;
