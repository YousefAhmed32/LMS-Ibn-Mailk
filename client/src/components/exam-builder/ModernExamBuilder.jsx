import React, { useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamBuilder } from '../../contexts/ExamBuilderContext';
import { useTheme } from '../../contexts/ThemeContext';
import { QuestionCard, AddQuestionButton, FloatingActionButton } from './index';

/**
 * ModernExamBuilder - Professional question builder UI.
 * Renders inside ExamBuilderProvider. Use within modal/panel.
 */
const ModernExamBuilder = ({
  onSave,
  onCancel,
  isDarkMode = false
}) => {
  const { examForm, setTitle, addQuestion, removeQuestion, updateQuestion, duplicateQuestion, addChoice, removeChoice, updateChoice, setCorrectAnswer } = useExamBuilder();
  const { colors } = useTheme();
  const questionRefs = useRef({});
  const [scrollToQuestionId, setScrollToQuestionId] = React.useState(null);

  // Auto-scroll to newly added question and clear after
  useEffect(() => {
    if (!scrollToQuestionId) return;
    const el = questionRefs.current[scrollToQuestionId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    const t = setTimeout(() => setScrollToQuestionId(null), 500);
    return () => clearTimeout(t);
  }, [scrollToQuestionId]);

  const handleAddQuestion = useCallback((type, insertAfterId) => {
    const newId = addQuestion(type, insertAfterId);
    if (newId) setScrollToQuestionId(newId);
    return newId;
  }, [addQuestion]);

  const totalMarks = examForm.questions.reduce((sum, q) => sum + (q.marks ?? 10), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Exam title & total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            عنوان الامتحان *
          </label>
          <input
            type="text"
            value={examForm.title}
            onChange={e => setTitle(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
              isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
            placeholder="أدخل عنوان الامتحان"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            إجمالي النقاط
          </label>
          <div className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between ${
            isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <span className="font-bold text-lg" style={{ color: colors.accent }}>{totalMarks}</span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              محسوب تلقائياً
            </span>
          </div>
        </div>
      </div>

      {/* Questions section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            الأسئلة ({examForm.questions.length})
          </h3>
          <AddQuestionButton
            onAdd={handleAddQuestion}
            variant="default"
          />
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {examForm.questions.map((question, index) => (
              <div
                key={question.id}
                ref={el => { questionRefs.current[question.id] = el; }}
              >
                <QuestionCard
                  question={question}
                  index={index}
                  isDarkMode={isDarkMode}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onDuplicate={duplicateQuestion}
                  onAddChoice={addChoice}
                  onRemoveChoice={removeChoice}
                  onUpdateChoice={updateChoice}
                  onSetCorrectAnswer={setCorrectAnswer}
                  onAddQuestion={handleAddQuestion}
                />
              </div>
            ))}
          </AnimatePresence>

          {/* Add question at bottom */}
          {examForm.questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-4"
            >
              <AddQuestionButton
                onAdd={handleAddQuestion}
                insertAfterId={examForm.questions[examForm.questions.length - 1]?.id}
                variant="minimal"
                className="w-full"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onAdd={handleAddQuestion}
        visible={true}
      />

      {/* Footer - Save/Cancel - rendered by parent if needed */}
      {(onSave || onCancel) && (
        <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {examForm.questions.length} سؤال | {totalMarks} نقطة
            </span>
            <div className="flex gap-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className={`px-6 py-3 rounded-xl font-medium border transition-colors ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  إلغاء
                </button>
              )}
              {onSave && (
                <button
                  type="button"
                  onClick={() => onSave(examForm)}
                  disabled={examForm.questions.length === 0}
                  className="px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.accent, color: colors.text }}
                >
                  حفظ الامتحان
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernExamBuilder;
