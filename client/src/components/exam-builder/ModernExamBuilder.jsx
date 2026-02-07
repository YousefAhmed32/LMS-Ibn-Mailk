import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExamBuilder } from '../../contexts/ExamBuilderContext';
import { useTheme } from '../../contexts/ThemeContext';
import { validateExamForSubmit } from '../../utils/examNormalization';
import { QuestionCard, AddQuestionButton, FloatingActionButton } from './index';
import { CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Checks if a single question is "complete" (has all required fields)
 */
const isQuestionComplete = (q) => {
  if (!q.questionText?.trim()) return false;
  if (q.type === 'mcq') {
    if (!q.choices || q.choices.length < 2) return false;
    if (q.choices.some(c => !c.text?.trim())) return false;
    if (!q.choices.some(c => c.isCorrect)) return false;
  }
  if (q.type === 'true_false') {
    if (q.correctAnswer === undefined || q.correctAnswer === null) return false;
  }
  return true;
};

/**
 * Gets validation status for a question
 */
const getQuestionStatus = (q) => {
  const issues = [];
  if (!q.questionText?.trim()) issues.push('نص السؤال مطلوب');
  if (q.type === 'mcq') {
    if (!q.choices || q.choices.length < 2) issues.push('خيارين على الأقل');
    else {
      if (q.choices.some(c => !c.text?.trim())) issues.push('بعض الخيارات فارغة');
      if (!q.choices.some(c => c.isCorrect)) issues.push('لم يتم تحديد الإجابة الصحيحة');
    }
  }
  if (q.type === 'true_false' && (q.correctAnswer === undefined || q.correctAnswer === null)) {
    issues.push('لم يتم تحديد الإجابة');
  }
  return { complete: issues.length === 0, issues };
};

/**
 * ModernExamBuilder - Professional question builder UI with step indicators.
 * Renders inside ExamBuilderProvider. Use within modal/panel.
 */
const ModernExamBuilder = ({
  onSave,
  onCancel,
  isDarkMode = false
}) => {
  const { examForm, setTitle, addQuestion, removeQuestion, updateQuestion, duplicateQuestion, addChoice, removeChoice, updateChoice, setCorrectAnswer, validate } = useExamBuilder();
  const { colors } = useTheme();
  const questionRefs = useRef({});
  const [scrollToQuestionId, setScrollToQuestionId] = useState(null);
  const [collapsedQuestions, setCollapsedQuestions] = useState(new Set());

  // Auto-scroll to newly added question
  useEffect(() => {
    if (!scrollToQuestionId) return;
    const el = questionRefs.current[scrollToQuestionId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(() => setScrollToQuestionId(null), 500);
    return () => clearTimeout(t);
  }, [scrollToQuestionId]);

  const handleAddQuestion = useCallback((type, insertAfterId) => {
    const newId = addQuestion(type, insertAfterId);
    if (newId) setScrollToQuestionId(newId);
    return newId;
  }, [addQuestion]);

  // Compute per-question status
  const questionStatuses = useMemo(() => {
    return examForm.questions.map(q => ({
      id: q.id,
      ...getQuestionStatus(q)
    }));
  }, [examForm.questions]);

  const completedCount = questionStatuses.filter(s => s.complete).length;
  const totalQuestions = examForm.questions.length;
  const totalMarks = examForm.questions.reduce((sum, q) => sum + (q.marks ?? 10), 0);

  // Check if form is ready to save
  const formValidation = useMemo(() => validateExamForSubmit(examForm), [examForm]);
  const canSave = formValidation.valid;

  // Toggle collapse for a question
  const toggleCollapse = useCallback((qId) => {
    setCollapsedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  }, []);

  // Progress percentage
  const progressPct = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Exam title & total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            } ${!examForm.title?.trim() ? 'border-red-400' : ''}`}
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

      {/* Progress bar */}
      {totalQuestions > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              تقدم إنشاء الأسئلة
            </span>
            <span className={`text-sm font-bold ${
              progressPct === 100 ? 'text-emerald-500' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {completedCount}/{totalQuestions} مكتمل
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: progressPct === 100 ? '#10b981' : '#f59e0b' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Step indicator pills */}
      {totalQuestions > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b" style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          {examForm.questions.map((q, i) => {
            const status = questionStatuses[i];
            const isComplete = status?.complete;
            const hasErrors = !isComplete && q.questionText?.trim(); // Started but incomplete
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  const el = questionRefs.current[q.id];
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  isComplete
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                    : hasErrors
                      ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-400 border-gray-600'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
                title={isComplete ? 'مكتمل' : status?.issues?.join(', ')}
              >
                {isComplete ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : hasErrors ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : null}
                س{i + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* Questions section */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            الأسئلة ({totalQuestions})
          </h3>
          <AddQuestionButton
            onAdd={handleAddQuestion}
            variant="default"
          />
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {examForm.questions.map((question, index) => {
              const status = questionStatuses[index];
              const isComplete = status?.complete;
              const isCollapsed = collapsedQuestions.has(question.id);

              return (
                <motion.div
                  key={question.id}
                  ref={el => { questionRefs.current[question.id] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`rounded-2xl border-2 transition-colors ${
                    isComplete
                      ? isDarkMode ? 'border-emerald-800/50' : 'border-emerald-200'
                      : status?.issues?.length > 0 && question.questionText?.trim()
                        ? isDarkMode ? 'border-amber-800/50' : 'border-amber-200'
                        : isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}
                >
                  {/* Collapsible header for completed questions */}
                  {isComplete && (
                    <button
                      type="button"
                      onClick={() => toggleCollapse(question.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
                        isDarkMode ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-emerald-600 hover:bg-emerald-50'
                      } ${isCollapsed ? 'rounded-2xl' : 'rounded-t-2xl border-b'}`}
                      style={{ borderColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>سؤال {index + 1}: {question.questionText?.slice(0, 50)}{question.questionText?.length > 50 ? '...' : ''}</span>
                        <span className="opacity-60">({question.marks ?? 10} نقطة)</span>
                      </div>
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                  )}

                  {/* Question card content */}
                  <AnimatePresence initial={false}>
                    {(!isComplete || !isCollapsed) && (
                      <motion.div
                        initial={isComplete ? { height: 0, opacity: 0 } : false}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add question at bottom */}
          {totalQuestions > 0 && (
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

      {/* Footer - Save/Cancel with validation feedback */}
      {(onSave || onCancel) && (
        <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {/* Validation errors summary */}
          {!canSave && formValidation.errors.length > 0 && totalQuestions > 0 && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${
              isDarkMode ? 'bg-red-900/20 text-red-400 border border-red-800/50' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-1 font-medium">
                <AlertCircle className="w-4 h-4" />
                يرجى إصلاح المشاكل التالية:
              </div>
              <ul className="list-disc list-inside space-y-0.5 mr-6">
                {formValidation.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {formValidation.errors.length > 5 && (
                  <li>...و {formValidation.errors.length - 5} أخطاء أخرى</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalQuestions} سؤال | {totalMarks} نقطة
              {totalQuestions > 0 && (
                <span className={`mr-2 ${canSave ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {canSave ? '✓ جاهز للحفظ' : `⚠ ${formValidation.errors.length} مشكلة`}
                </span>
              )}
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
                  disabled={!canSave}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    canSave
                      ? 'shadow-lg hover:shadow-xl active:scale-[0.98]'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    backgroundColor: canSave ? '#10b981' : isDarkMode ? '#374151' : '#d1d5db',
                    color: canSave ? '#fff' : isDarkMode ? '#6b7280' : '#9ca3af'
                  }}
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
