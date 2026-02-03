import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { ExamBuilderProvider } from '../../contexts/ExamBuilderContext';
import ModernExamBuilder from '../exam-builder/ModernExamBuilder';

// لوحة ألوان عصرية للـ Exam Builder — تباين واضح، تعمل في الوضعين
const getExamBuilderPalette = (isDark) => (isDark ? {
  bg: 'linear-gradient(180deg, #0f0f14 0%, #16161d 100%)',
  card: 'rgba(22, 22, 30, 0.95)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardHover: 'rgba(255,255,255,0.04)',
  accent: '#10b981',
  accentLight: 'rgba(16, 185, 129, 0.2)',
  accentGlow: '0 0 24px rgba(16, 185, 129, 0.35)',
  correct: '#34d399',
  correctBg: 'rgba(52, 211, 153, 0.18)',
  text: '#f4f4f5',
  textSoft: '#a1a1aa',
  textMuted: '#71717a',
  danger: '#f87171',
  dangerHover: 'rgba(248, 113, 113, 0.15)',
  modalBg: 'rgba(22, 22, 30, 0.98)',
  modalBorder: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.6)'
} : {
  bg: 'transparent',
  card: 'rgba(255, 255, 255, 0.98)',
  cardBorder: 'rgba(0,0,0,0.06)',
  cardHover: 'rgba(0,0,0,0.02)',
  accent: '#059669',
  accentLight: 'rgba(5, 150, 105, 0.12)',
  accentGlow: '0 0 24px rgba(5, 150, 105, 0.25)',
  correct: '#059669',
  correctBg: 'rgba(5, 150, 105, 0.12)',
  text: '#18181b',
  textSoft: '#52525b',
  textMuted: '#71717a',
  danger: '#dc2626',
  dangerHover: 'rgba(220, 38, 38, 0.1)',
  modalBg: 'rgba(255, 255, 255, 0.98)',
  modalBorder: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.4)'
});

const springTransition = { type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] };
const modalTransition = { type: 'tween', duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] };

const IntegratedExamBuilder = ({ exams = [], onExamsChange, isDarkMode }) => {
  const palette = getExamBuilderPalette(!!isDarkMode);

  // State
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);

  // Normalize modern builder format (choices with isCorrect) to backend format
  const normalizeModernQuestionsForSave = (questions) => {
    return questions.map((question) => {
      if (question.type === 'mcq' && question.choices) {
        const correctIndex = question.choices.findIndex((c) => c.isCorrect);
        return {
          ...question,
          correctAnswer: correctIndex >= 0 ? correctIndex : 0,
          options: question.choices.map((c) => c.text || ''),
        };
      }
      if (question.type === 'true_false') {
        return {
          ...question,
          correctAnswer: Boolean(question.correctAnswer),
        };
      }
      return question;
    });
  };

  // Edit exam — opens modal; ExamBuilderProvider gets initialExam from editingExam
  const editExam = (exam) => {
    setEditingExam(exam);
    setShowExamBuilder(true);
  };

  // Delete exam
  const deleteExam = (examId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      const updatedExams = exams.filter(exam => exam.id !== examId);
      onExamsChange(updatedExams);
      
      toast({
        title: 'تم حذف الامتحان',
        description: 'تم حذف الامتحان بنجاح'
      });
    }
  };

  // Save from Modern Exam Builder
  const handleSaveFromModernBuilder = (formFromContext) => {
    if (!formFromContext.title?.trim()) {
      toast({ title: 'خطأ في البيانات', description: 'يرجى إدخال عنوان الامتحان', variant: 'destructive' });
      return;
    }
    if (!formFromContext.questions?.length) {
      toast({ title: 'خطأ في البيانات', description: 'يرجى إضافة سؤال واحد على الأقل', variant: 'destructive' });
      return;
    }
    for (let i = 0; i < formFromContext.questions.length; i++) {
      const q = formFromContext.questions[i];
      if (!q.questionText?.trim()) {
        toast({ title: 'خطأ في البيانات', description: `يرجى إدخال نص السؤال ${i + 1}`, variant: 'destructive' });
        return;
      }
      if (q.type === 'mcq') {
        if (!q.choices?.length || q.choices.length < 2) {
          toast({ title: 'خطأ في البيانات', description: `السؤال ${i + 1} يجب أن يحتوي على خيارين على الأقل`, variant: 'destructive' });
          return;
        }
        if (!q.choices.some((c) => c.isCorrect)) {
          toast({ title: 'خطأ في البيانات', description: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}`, variant: 'destructive' });
          return;
        }
      }
    }
    const normalizedQuestions = normalizeModernQuestionsForSave(formFromContext.questions);
    const totalMarksValue = normalizedQuestions.reduce((s, q) => s + (q.marks ?? 10), 0);
    const examData = {
      id: editingExam?.id || `exam_${Date.now()}`,
      title: formFromContext.title,
      type: 'internal_exam',
      totalMarks: totalMarksValue,
      totalPoints: totalMarksValue,
      duration: 30,
      passingScore: 60,
      questions: normalizedQuestions,
      migratedFromGoogleForm: false,
      migrationNote: '',
      createdAt: editingExam?.createdAt || new Date().toISOString()
    };
    const updatedExams = editingExam
      ? exams.map((ex) => (ex.id === editingExam.id ? examData : ex))
      : [...exams, examData];
    onExamsChange(updatedExams);
    toast({ title: 'تم حفظ الامتحان', description: editingExam ? 'تم تحديث الامتحان بنجاح' : 'تم إضافة الامتحان بنجاح' });
    setShowExamBuilder(false);
    setEditingExam(null);
  };

  const openBuilder = () => {
    setEditingExam(null);
    setShowExamBuilder(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6" style={{ minHeight: 1 }}>
      {/* قائمة الامتحانات */}
      <div className="space-y-4">
        {exams.map((exam, index) => (
          <Motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: index * 0.03 }}
            className="rounded-2xl border overflow-hidden transition-all duration-300 ease-out"
            style={{
              background: palette.card,
              borderColor: palette.cardBorder,
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6 transition-colors duration-200"
              style={{ color: palette.text }}
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                <div
                  className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${palette.accent} 0%, #059669 100%)`,
                    color: '#fff',
                    boxShadow: palette.accentGlow
                  }}
                >
                  <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold truncate" style={{ color: palette.text }}>
                    {exam.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm" style={{ color: palette.textSoft }}>
                    <span>{exam.questions?.length ?? 0} سؤال</span>
                    <span>{exam.totalPoints ?? exam.totalMarks ?? 0} نقطة</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:opacity-80"
                  style={{ background: palette.cardHover, color: palette.textSoft }}
                  aria-label={expandedExam === exam.id ? 'طي' : 'عرض الأسئلة'}
                >
                  {expandedExam === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => editExam(exam)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:opacity-80"
                  style={{ background: palette.accentLight, color: palette.accent }}
                  aria-label="تعديل"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteExam(exam.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:opacity-80"
                  style={{ background: palette.dangerHover, color: palette.danger }}
                  aria-label="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {expandedExam === exam.id && (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={springTransition}
                  className="overflow-hidden"
                >
                  <div
                    className="border-t px-5 sm:px-6 py-5"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <div className="space-y-4">
                      {(exam.questions || []).map((question, qIndex) => (
                        <Motion.div
                          key={question.id ?? qIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={springTransition}
                          className="rounded-xl border p-4 sm:p-5 transition-all duration-200 hover:border-opacity-60"
                          style={{
                            background: palette.cardHover,
                            borderColor: palette.cardBorder
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.borderColor = palette.accent + '40';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = palette.cardHover;
                            e.currentTarget.style.borderColor = palette.cardBorder;
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{ background: palette.accentLight, color: palette.accent }}
                            >
                              {qIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base leading-snug" style={{ color: palette.text }}>
                                {question.questionText || '—'}
                              </p>
                              <div className="mt-3 space-y-2">
                                {question.type === 'mcq' && (question.options || []).map((option, optIndex) => {
                                  const optText = typeof option === 'string' ? option : (option?.text ?? option?.optionText ?? '');
                                  const isCorrect = typeof question.correctAnswer === 'number'
                                    ? question.correctAnswer === optIndex
                                    : question.correctAnswer === option?.id;
                                  return (
                                    <div
                                      key={option?.id ?? optIndex}
                                      className="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors"
                                      style={{
                                        background: isCorrect ? palette.correctBg : 'transparent'
                                      }}
                                    >
                                      <div
                                        className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                        style={{
                                          borderColor: isCorrect ? palette.correct : palette.cardBorder,
                                          backgroundColor: isCorrect ? palette.correct : 'transparent'
                                        }}
                                      />
                                      <span className="text-sm flex-1" style={{ color: isCorrect ? palette.correct : palette.textSoft }}>
                                        {optText || '—'}
                                      </span>
                                      {isCorrect && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: palette.correct }} />}
                                    </div>
                                  );
                                })}
                                {question.type === 'true_false' && (
                                  <div
                                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                                    style={{ background: palette.correctBg }}
                                  >
                                    <div
                                      className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                      style={{ borderColor: palette.correct, backgroundColor: palette.correct }}
                                    />
                                    <span className="text-sm font-medium" style={{ color: palette.correct }}>
                                      {question.correctAnswer ? 'صح' : 'خطأ'}
                                    </span>
                                    <CheckCircle className="w-4 h-4" style={{ color: palette.correct }} />
                                  </div>
                                )}
                                {(question.type === 'essay' || !question.type) && (
                                  <p className="text-sm" style={{ color: palette.textMuted }}>سؤال مقالي</p>
                                )}
                              </div>
                              <p className="mt-2 text-xs font-medium" style={{ color: palette.textMuted }}>
                                {question.marks ?? 10} نقطة
                              </p>
                            </div>
                          </div>
                        </Motion.div>
                      ))}
                    </div>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </Motion.div>
        ))}
      </div>

      {/* زر إضافة امتحان */}
      <Motion.button
        type="button"
        onClick={openBuilder}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={springTransition}
        className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 p-6 sm:p-8 rounded-2xl border-2 border-dashed min-h-[120px] sm:min-h-[100px] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:opacity-95"
        style={{
          borderColor: palette.accent + '80',
          background: palette.accentLight,
          color: palette.accent,
          boxShadow: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = palette.accentGlow;
          e.currentTarget.style.borderColor = palette.accent;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = palette.accent + '80';
        }}
      >
        <div
          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-200"
          style={{ background: palette.accent + '25' }}
        >
          <Plus className="w-7 h-7" style={{ color: palette.accent }} />
        </div>
        <div className="text-center sm:text-right">
          <span className="font-bold text-lg sm:text-xl block" style={{ color: palette.accent }}>إضافة امتحان جديد</span>
          <span className="text-sm block mt-0.5" style={{ color: palette.textSoft }}>أنشئ امتحاناً مع أسئلة متعددة</span>
        </div>
      </Motion.button>

      {/* Modal منشئ الامتحان — زجاجي، زوايا كبيرة، ظل، backdrop-blur */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showExamBuilder && (
              <Motion.div
                key="exam-builder-modal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={modalTransition}
                className="fixed inset-0 flex items-center justify-center z-[9999] p-3 sm:p-4 md:p-6"
                style={{
                  background: palette.overlay,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)'
                }}
                onClick={() => setShowExamBuilder(false)}
              >
                <Motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={modalTransition}
                  className="w-full max-w-4xl h-[85vh] sm:h-[88vh] md:h-[90vh] rounded-3xl flex flex-col overflow-hidden border shadow-2xl"
                  style={{
                    background: palette.modalBg,
                    borderColor: palette.modalBorder,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* رأس المودال */}
                  <div
                    className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b flex-shrink-0"
                    style={{ borderColor: palette.cardBorder }}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${palette.accent} 0%, #059669 100%)`,
                          color: '#fff',
                          boxShadow: palette.accentGlow
                        }}
                      >
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate" style={{ color: palette.text }}>
                          {editingExam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                        </h2>
                        <p className="text-sm mt-0.5 truncate" style={{ color: palette.textSoft }}>
                          أضف الأسئلة والإجابات للامتحان
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowExamBuilder(false)}
                      className="flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 active:opacity-80"
                      style={{ background: palette.dangerHover, color: palette.danger }}
                      aria-label="إغلاق"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* المحتوى — مساحة وافية */}
                  <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6">
                    <ExamBuilderProvider
                      key={editingExam ? editingExam.id : 'new'}
                      initialExam={
                        editingExam
                          ? {
                              title: editingExam.title,
                              totalMarks: editingExam.totalMarks,
                              questions: editingExam.questions || []
                            }
                          : { title: '', questions: [] }
                      }
                    >
                      <ModernExamBuilder
                        isDarkMode={!!isDarkMode}
                        onSave={handleSaveFromModernBuilder}
                        onCancel={() => setShowExamBuilder(false)}
                      />
                    </ExamBuilderProvider>
                  </div>
                </Motion.div>
              </Motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default IntegratedExamBuilder;

