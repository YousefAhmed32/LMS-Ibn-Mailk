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
  ChevronUp,
  ArrowLeft,
  Maximize2,
  Save,
  FileText
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import { ExamBuilderProvider } from '../../contexts/ExamBuilderContext';
import ModernExamBuilder from '../exam-builder/ModernExamBuilder';
import axiosInstance from '../../api/axiosInstance';
import { uiToServer } from '../../utils/examNormalization';

// لوحة ألوان فخمة
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
  modalBg: 'linear-gradient(135deg, #0f0f14 0%, #1a1a24 100%)',
  modalBorder: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.75)'
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
  modalBg: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  modalBorder: 'rgba(0,0,0,0.06)',
  overlay: 'rgba(0,0,0,0.5)'
});

const springTransition = { type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] };
const modalTransition = { type: 'spring', stiffness: 300, damping: 30 };

const IntegratedExamBuilder = ({ exams = [], onExamsChange, isDarkMode, courseId }) => {
  const palette = getExamBuilderPalette(!!isDarkMode);

  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const editExam = (exam) => {
    setEditingExam(exam);
    setShowExamBuilder(true);
  };

  const deleteExam = (examId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      const updatedExams = exams.filter(exam => exam.id !== examId);
      onExamsChange(updatedExams);
      toast({ title: 'تم حذف الامتحان', description: 'تم حذف الامتحان بنجاح' });
    }
  };

  const handleSaveDraft = async (formFromContext) => {
    if (!courseId) {
      const totalMarks = formFromContext.questions.reduce((sum, q) => sum + (q.marks || 10), 0);
      const examData = {
        id: editingExam?.id || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formFromContext.title?.trim() || 'امتحان بدون عنوان',
        type: 'internal_exam',
        status: 'draft',
        url: '',
        migratedFromGoogleForm: false,
        migrationNote: '',
        totalMarks: totalMarks,
        totalPoints: totalMarks,
        duration: formFromContext.duration || 30,
        passingScore: formFromContext.passingScore || 60,
        isActive: true,
        createdAt: editingExam?.createdAt || new Date().toISOString(),
        questions: formFromContext.questions.map((q, index) => {
          const question = {
            id: q.id || `q_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            questionText: q.questionText?.trim() || '',
            type: q.type,
            points: q.marks || 10,
            marks: q.marks || 10,
            order: index + 1
          };

          if (q.type === 'mcq') {
            question.options = (q.choices || []).map((choice) => ({
              id: choice.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: choice.text?.trim() || '',
              optionText: choice.text?.trim() || ''
            }));

            const correctChoiceIndex = q.choices.findIndex(c => c.isCorrect === true);
            if (correctChoiceIndex !== -1 && question.options[correctChoiceIndex]) {
              question.correctAnswer = question.options[correctChoiceIndex].id;
            } else {
              question.correctAnswer = null;
            }
          } else if (q.type === 'true_false') {
            question.options = [];
            question.correctAnswer = Boolean(q.correctAnswer);
          } else if (q.type === 'essay') {
            question.options = [];
            question.sampleAnswer = q.sampleAnswer || '';
          }

          return question;
        })
      };

      const updatedExams = editingExam
        ? exams.map((ex) => (ex.id === editingExam.id ? examData : ex))
        : [...exams, examData];

      onExamsChange(updatedExams);
      toast({ title: 'تم حفظ المسودة', description: 'سيتم حفظها في الدورة عند الإنشاء' });
      return;
    }

    setIsSavingDraft(true);
    try {
      const serverFormat = uiToServer(formFromContext, editingExam?.id);
      serverFormat.status = 'draft';

      const endpoint = editingExam?.id
        ? `/api/admin/courses/${courseId}/exams/${editingExam.id}/draft`
        : `/api/admin/courses/${courseId}/exams/draft`;

      const response = await axiosInstance.patch(endpoint, serverFormat);

      if (response.data.success) {
        const savedExam = response.data.exam;
        const updatedExams = editingExam
          ? exams.map((ex) => (ex.id === editingExam.id ? savedExam : ex))
          : [...exams, savedExam];

        onExamsChange(updatedExams);
        toast({ title: 'تم حفظ المسودة', description: 'تم حفظ المسودة بنجاح' });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل حفظ المسودة',
        variant: 'destructive'
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveFromModernBuilder = async (formFromContext) => {
    if (!courseId) {
      const totalMarks = formFromContext.questions.reduce((sum, q) => sum + (q.marks || 10), 0);
      const examData = {
        id: editingExam?.id || `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formFromContext.title.trim(),
        type: 'internal_exam',
        status: 'published',
        url: '',
        migratedFromGoogleForm: false,
        migrationNote: '',
        totalMarks: totalMarks,
        totalPoints: totalMarks,
        duration: formFromContext.duration || 30,
        passingScore: formFromContext.passingScore || 60,
        isActive: true,
        createdAt: editingExam?.createdAt || new Date().toISOString(),
        questions: formFromContext.questions.map((q, index) => {
          const question = {
            id: q.id || `q_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
            questionText: q.questionText?.trim() || '',
            type: q.type,
            points: q.marks || 10,
            marks: q.marks || 10,
            order: index + 1
          };

          if (q.type === 'mcq') {
            question.options = (q.choices || []).map((choice) => ({
              id: choice.id || `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              text: choice.text?.trim() || '',
              optionText: choice.text?.trim() || ''
            }));

            const correctChoiceIndex = q.choices.findIndex(c => c.isCorrect === true);
            if (correctChoiceIndex !== -1 && question.options[correctChoiceIndex]) {
              question.correctAnswer = question.options[correctChoiceIndex].id;
            } else {
              question.correctAnswer = null;
            }
          } else if (q.type === 'true_false') {
            question.options = [];
            question.correctAnswer = Boolean(q.correctAnswer);
          } else if (q.type === 'essay') {
            question.options = [];
            question.sampleAnswer = q.sampleAnswer || '';
          }

          return question;
        })
      };

      const updatedExams = editingExam
        ? exams.map((ex) => (ex.id === editingExam.id ? examData : ex))
        : [...exams, examData];

      onExamsChange(updatedExams);
      toast({ title: 'تم حفظ الامتحان', description: editingExam ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح' });
      setShowExamBuilder(false);
      setEditingExam(null);
      return;
    }

    if (!formFromContext.title?.trim()) {
      toast({ title: 'خطأ', description: 'يرجى إدخال عنوان الامتحان', variant: 'destructive' });
      return;
    }

    if (!formFromContext.questions || formFromContext.questions.length === 0) {
      toast({ title: 'خطأ', description: 'يرجى إضافة سؤال واحد على الأقل', variant: 'destructive' });
      return;
    }

    for (let i = 0; i < formFromContext.questions.length; i++) {
      const q = formFromContext.questions[i];
      
      if (!q.questionText?.trim()) {
        toast({ title: 'خطأ', description: `السؤال ${i + 1}: يرجى إدخال نص السؤال`, variant: 'destructive' });
        return;
      }
      
      if (q.type === 'mcq') {
        if (!q.choices || q.choices.length < 2) {
          toast({ title: 'خطأ', description: `السؤال ${i + 1}: يجب أن يحتوي على خيارين على الأقل`, variant: 'destructive' });
          return;
        }
        
        const emptyChoices = q.choices.filter(c => !c.text?.trim());
        if (emptyChoices.length > 0) {
          toast({ title: 'خطأ', description: `السؤال ${i + 1}: بعض الخيارات فارغة`, variant: 'destructive' });
          return;
        }
        
        const hasCorrectAnswer = q.choices.some(c => c.isCorrect === true);
        if (!hasCorrectAnswer) {
          toast({
            title: 'خطأ',
            description: `السؤال ${i + 1}: يرجى تحديد الإجابة الصحيحة`,
            variant: 'destructive',
            duration: 8000
          });
          return;
        }
      }
      
      if (q.type === 'true_false') {
        if (q.correctAnswer !== true && q.correctAnswer !== false) {
          toast({ title: 'خطأ', description: `السؤال ${i + 1}: يرجى تحديد الإجابة الصحيحة`, variant: 'destructive' });
          return;
        }
      }
    }

    setIsPublishing(true);
    try {
      const serverFormat = uiToServer(formFromContext, editingExam?.id);
      serverFormat.status = 'published';

      const endpoint = editingExam?.id
        ? `/api/admin/courses/${courseId}/exams/${editingExam.id}/publish`
        : `/api/admin/courses/${courseId}/exams/publish`;

      const response = await axiosInstance.patch(endpoint, serverFormat);

      if (response.data.success) {
        const savedExam = response.data.exam;
        const updatedExams = editingExam
          ? exams.map((ex) => (ex.id === editingExam.id ? savedExam : ex))
          : [...exams, savedExam];

        onExamsChange(updatedExams);
        toast({ title: 'تم نشر الامتحان', description: editingExam ? 'تم التحديث بنجاح' : 'تم الإضافة بنجاح' });
        setShowExamBuilder(false);
        setEditingExam(null);
      }
    } catch (error) {
      console.error('Error publishing exam:', error);
      toast({
        title: 'خطأ',
        description: error.response?.data?.message || 'فشل نشر الامتحان',
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const openBuilder = () => {
    setEditingExam(null);
    setShowExamBuilder(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* قائمة الامتحانات */}
      <div className="space-y-4">
        {exams.map((exam, index) => (
          <Motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...springTransition, delay: index * 0.03 }}
            className="rounded-2xl border overflow-hidden transition-all duration-300"
            style={{
              background: palette.card,
              borderColor: palette.cardBorder,
              boxShadow: '0 4px 20px rgba(255, 0, 0, 0.06)'
            }}
          >
            <div
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 sm:p-6"
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
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg sm:text-xl font-bold truncate">{exam.title}</h4>
                    {exam.status === 'draft' && (
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ 
                          backgroundColor: isDarkMode ? 'rgba(251, 191, 36, 0.15)' : 'rgba(251, 191, 36, 0.1)',
                          color: isDarkMode ? '#fbbf24' : '#d97706',
                          border: `1px solid ${isDarkMode ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.2)'}`
                        }}
                      >
                        <FileText className="w-3 h-3" />
                        مسودة
                      </span>
                    )}
                  </div>
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
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all"
                  style={{ background: palette.cardHover, color: palette.textSoft }}
                >
                  {expandedExam === exam.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => editExam(exam)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all"
                  style={{ background: palette.accentLight, color: palette.accent }}
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteExam(exam.id)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all"
                  style={{ background: palette.dangerHover, color: palette.danger }}
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
                  <div className="border-t px-5 sm:px-6 py-5" style={{ borderColor: palette.cardBorder }}>
                    <div className="space-y-4">
                      {(exam.questions || []).map((question, qIndex) => (
                        <div
                          key={question.id ?? qIndex}
                          className="rounded-xl border p-4 sm:p-5"
                          style={{ background: palette.cardHover, borderColor: palette.cardBorder }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                              style={{ background: palette.accentLight, color: palette.accent }}
                            >
                              {qIndex + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base">{question.questionText || '—'}</p>
                              <div className="mt-3 space-y-2">
                                {question.type === 'mcq' && (question.options || []).map((option, optIndex) => {
                                  const optText = typeof option === 'string' ? option : (option?.text ?? option?.optionText ?? '');
                                  const isCorrect = question.correctAnswer === option?.id;
                                  return (
                                    <div
                                      key={option?.id ?? optIndex}
                                      className="flex items-center gap-3 py-2 px-3 rounded-lg"
                                      style={{ background: isCorrect ? palette.correctBg : 'transparent' }}
                                    >
                                      <div
                                        className="w-4 h-4 rounded-full border-2"
                                        style={{
                                          borderColor: isCorrect ? palette.correct : palette.cardBorder,
                                          backgroundColor: isCorrect ? palette.correct : 'transparent'
                                        }}
                                      />
                                      <span className="text-sm flex-1" style={{ color: isCorrect ? palette.correct : palette.textSoft }}>
                                        {optText || '—'}
                                      </span>
                                      {isCorrect && <CheckCircle className="w-4 h-4" style={{ color: palette.correct }} />}
                                    </div>
                                  );
                                })}
                              </div>
                              <p className="mt-2 text-xs font-medium" style={{ color: palette.textMuted }}>
                                {question.marks ?? 10} نقطة
                              </p>
                            </div>
                          </div>
                        </div>
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
        className="w-full flex items-center justify-center gap-4 p-6 sm:p-8 rounded-2xl border-2 border-dashed min-h-[100px] transition-all"
        style={{
          borderColor: palette.accent + '80',
          background: palette.accentLight,
          color: palette.accent
        }}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: palette.accent + '25' }}>
          <Plus className="w-7 h-7" />
        </div>
        <div className="text-right">
          <span className="font-bold text-xl block">إضافة امتحان جديد</span>
          <span className="text-sm block mt-0.5" style={{ color: palette.textSoft }}>أنشئ امتحاناً مع أسئلة متعددة</span>
        </div>
      </Motion.button>

      {/* ✅ FULL-SCREEN Modal فخم جداً */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showExamBuilder && (
              <Motion.div
                key="exam-builder-fullscreen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 z-[9999] flex flex-col"
                style={{
                  background: palette.modalBg,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)'
                }}
              >
                {/* Header فخم */}
                <Motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                  className="flex-shrink-0 border-b backdrop-blur-xl"
                  style={{
                    borderColor: palette.modalBorder,
                    background: isDarkMode ? 'rgba(15, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)'
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setShowExamBuilder(false)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                          style={{ background: palette.cardHover, color: palette.textSoft }}
                        >
                          <ArrowLeft className="w-5 h-5" />
                          <span className="font-medium">رجوع</span>
                        </button>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${palette.accent} 0%, #059669 100%)`,
                            boxShadow: palette.accentGlow
                          }}
                        >
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: palette.text }}>
                            {editingExam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                          </h1>
                          <p className="text-sm mt-0.5" style={{ color: palette.textSoft }}>
                            قم بإنشاء امتحان احترافي بأسئلة متعددة
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowExamBuilder(false)}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                        style={{ background: palette.dangerHover, color: palette.danger }}
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </Motion.div>

                {/* Content — مساحة واسعة جداً */}
                <Motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        onSaveDraft={handleSaveDraft}
                        onCancel={() => setShowExamBuilder(false)}
                        isSavingDraft={isSavingDraft}
                        isPublishing={isPublishing}
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