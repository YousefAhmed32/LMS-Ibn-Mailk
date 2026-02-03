import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import internalExamService from '../../services/internalExamService';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  Trophy,
  Target,
  Award,
  RotateCcw,
  Eye,
  EyeOff,
  Play
} from 'lucide-react';

const InternalExamInterface = ({ 
  courseId, 
  examId, 
  onExamComplete, 
  onBack 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // State management
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [error, setError] = useState(null);

  // Load exam data
  useEffect(() => {
    loadExam();
  }, [courseId, examId]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await internalExamService.getExamForTaking(courseId, examId);
      
      if (response.success) {
        setExam(response.exam);
        // Initialize answers: array for allowMultiple MCQ, single value otherwise
        const initialAnswers = {};
        response.exam.questions.forEach(question => {
          initialAnswers[question.id] = question.allowMultiple ? [] : '';
        });
        setAnswers(initialAnswers);
      } else {
        setError(response.message || 'Failed to load exam');
      }
    } catch (err) {
      console.error('Error loading exam:', err);
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle answer selection (single value or toggle in array for allowMultiple)
  const handleAnswerSelect = (questionId, answer, allowMultiple = false) => {
    setAnswers(prev => {
      const current = prev[questionId];
      if (allowMultiple) {
        const arr = Array.isArray(current) ? [...current] : [];
        const idx = arr.indexOf(answer);
        if (idx >= 0) arr.splice(idx, 1);
        else arr.push(answer);
        return { ...prev, [questionId]: arr };
      }
      return { ...prev, [questionId]: answer };
    });
  };

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate that all questions are answered (array length for allowMultiple, non-empty for single)
      const unansweredQuestions = exam.questions.filter(question => {
        const a = answers[question.id];
        if (question.allowMultiple) return !Array.isArray(a) || a.length === 0;
        return a == null || a === '';
      });
      
      if (unansweredQuestions.length > 0) {
        toast({
          title: 'أسئلة غير مجابة',
          description: `يرجى الإجابة على جميع الأسئلة (${unansweredQuestions.length} سؤال غير مجاب)`,
          variant: 'destructive'
        });
        return;
      }

      const response = await internalExamService.submitExam(courseId, examId, answers);
      
      if (response.success) {
        setExamResult(response.result);
        setShowResults(true);
        
        toast({
          title: 'تم إرسال الامتحان بنجاح',
          description: `درجتك: ${response.result.score}/${response.result.maxScore} (${response.result.percentage}%)`
        });
        
        if (onExamComplete) {
          onExamComplete(response.result);
        }
      } else {
        toast({
          title: 'خطأ في إرسال الامتحان',
          description: response.message || 'حدث خطأ أثناء إرسال الامتحان',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      toast({
        title: 'خطأ في إرسال الامتحان',
        description: err.response?.data?.message || 'حدث خطأ أثناء إرسال الامتحان',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start exam
  const handleStartExam = () => {
    setExamStarted(true);
    // Set timer if needed (you can add duration to exam model)
    // setTimeRemaining(exam.duration * 60);
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-50 border-green-200',
      'A': 'text-green-500 bg-green-50 border-green-200',
      'B+': 'text-blue-600 bg-blue-50 border-blue-200',
      'B': 'text-blue-500 bg-blue-50 border-blue-200',
      'C+': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'C': 'text-yellow-500 bg-yellow-50 border-yellow-200',
      'D+': 'text-orange-600 bg-orange-50 border-orange-200',
      'D': 'text-orange-500 bg-orange-50 border-orange-200',
      'F': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.accent }} />
          <p style={{ color: colors.textMuted }}>جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
          خطأ في تحميل الامتحان
        </h3>
        <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
          {error}
        </p>
        <button
          onClick={loadExam}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: colors.accent,
            color: colors.background
          }}
        >
          <RotateCcw className="w-4 h-4 inline mr-2" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  // Results view — فخم جداً + تفصيل لكل سؤال + شريط تقدم
  if (showResults && examResult) {
    const passingThreshold = examResult.passingScore ?? exam?.passingScore ?? 60;
    const isPassed = examResult.isPassed ?? (examResult.percentage != null && examResult.percentage >= passingThreshold);
    const isExcellent = (examResult.percentage || 0) >= 90;
    const questionResults = examResult.questionResults || [];
    const correctCount = questionResults.filter(q => q.isCorrect).length;
    const totalQuestions = questionResults.length || 1;
    const scoreProgressPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto p-4 sm:p-8"
        role="region"
        aria-label="نتيجة الامتحان"
      >
        {/* Hero result card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8 text-center"
          style={{
            background: isExcellent
              ? 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)'
              : isPassed
                ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)'
                : 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1)'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)]" aria-hidden="true" />
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
              aria-hidden="true"
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isExcellent ? 'أحسنت! تميز في الامتحان' : isPassed ? 'مبروك! نجحت في الامتحان' : 'تم إكمال الامتحان'}
            </h1>
            <p className="text-white/90 text-sm sm:text-base mb-8">{exam?.title}</p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex flex-col items-center"
            >
              <span className="text-5xl sm:text-7xl font-black text-white tracking-tight" aria-label={`النسبة ${examResult.percentage} بالمئة`}>
                {examResult.percentage}%
              </span>
              <span className="text-white/90 text-lg sm:text-xl font-semibold mt-1">
                {examResult.score} / {examResult.maxScore}
              </span>
              <div className="mt-4 px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xl font-bold text-white">{examResult.grade}</span>
                {examResult.level && (
                  <span className="text-white/90 text-sm mr-2"> — {examResult.level}</span>
                )}
              </div>
              <p className="text-white/80 text-sm mt-2">
                درجة النجاح {passingThreshold}% — {isPassed ? 'ناجح' : 'غير ناجح'}
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Progress bar: correct vs total questions */}
        {questionResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border p-5 mb-6"
            style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
            role="progressbar"
            aria-valuenow={correctCount}
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-label={`${correctCount} إجابة صحيحة من ${totalQuestions}`}
          >
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: colors.textMuted }}>الإجابات الصحيحة</span>
              <span className="font-semibold" style={{ color: colors.text }}>
                {correctCount} / {totalQuestions}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scoreProgressPercent}%` }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="h-full rounded-full"
                style={{ backgroundColor: isPassed ? colors.accent : '#ef4444' }}
              />
            </div>
          </motion.div>
        )}

        {/* Per-question breakdown: correct/incorrect visualization */}
        {questionResults.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="rounded-2xl border p-6 mb-8"
            style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
            aria-label="تفاصيل الأسئلة"
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
              تفاصيل الأسئلة
            </h2>
            <ul className="space-y-4">
              {questionResults.map((q, idx) => (
                <li
                  key={q.questionId || idx}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-colors ${
                    q.isCorrect ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-red-500/30 bg-red-50/30 dark:bg-red-900/10'
                  }`}
                >
                  <span
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      backgroundColor: q.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      color: q.isCorrect ? '#059669' : '#dc2626'
                    }}
                    aria-hidden="true"
                  >
                    {q.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2" style={{ color: colors.text }}>
                      {q.questionText || `سؤال ${idx + 1}`}
                    </p>
                    <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                      {q.earnedMarks} / {q.maxMarks} نقطة
                      {q.percentagePerQuestion != null && ` — ${q.percentagePerQuestion}%`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* Submission time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border p-6 mb-8"
          style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
        >
          <div className="flex items-center justify-between text-sm" style={{ color: colors.textMuted }}>
            <span>وقت الإرسال</span>
            <span className="font-medium" style={{ color: colors.text }}>
              {examResult.submittedAt
                ? new Date(examResult.submittedAt).toLocaleDateString('ar-SA', { dateStyle: 'long' }) +
                  ' — ' + new Date(examResult.submittedAt).toLocaleTimeString('ar-SA', { timeStyle: 'short' })
                : '—'}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex justify-center"
        >
          <button
            onClick={() => onBack && onBack()}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: colors.accent }}
            aria-label="العودة للدورة"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة للدورة
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Pre-exam instructions — واجهة فخمة
  if (!examStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 sm:p-8"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: colors.accent + '20', color: colors.accent }}
          >
            <BookOpen className="w-10 h-10" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: colors.text }}>
            {exam.title}
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            امتحان الدورة التدريبية
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-2xl border-2 text-center"
            style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
          >
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: colors.accent }} />
            <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>عدد الأسئلة</p>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>{exam.totalQuestions}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-2xl border-2 text-center"
            style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
          >
            <Target className="w-8 h-8 mx-auto mb-2" style={{ color: colors.accent }} />
            <p className="text-xs font-medium mb-1" style={{ color: colors.textMuted }}>إجمالي النقاط</p>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>{exam.totalMarks}</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border-2 mb-8"
          style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
        >
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>تعليمات الامتحان</h3>
          <ul className="space-y-3 text-sm" style={{ color: colors.textMuted }}>
            {['اقرأ كل سؤال بعناية قبل الإجابة', 'يمكنك التنقل بين الأسئلة باستخدام الأزرار أو أرقام الأسئلة', 'تأكد من الإجابة على جميع الأسئلة قبل الإرسال', 'سيتم حساب الدرجة تلقائياً عند الإرسال'].map((text, i) => (
              <li key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: colors.accent }} />
                {text}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => onBack && onBack()}
            className="px-6 py-4 rounded-2xl font-semibold transition-all border-2"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }}
          >
            <ArrowLeft className="w-5 h-5 inline ml-2" />
            العودة
          </button>
          <motion.button
            onClick={handleStartExam}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 rounded-2xl font-semibold text-white shadow-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: colors.accent }}
          >
            <Play className="w-5 h-5" />
            بدء الامتحان
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Main exam interface — واجهة أسئلة فخمة
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const answeredCount = exam.questions.filter(q => {
    const a = answers[q.id];
    if (q.allowMultiple) return Array.isArray(a) && a.length > 0;
    return a != null && a !== '';
  }).length;
  const progressPercent = (answeredCount / exam.questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-4 sm:p-6"
    >
      {/* Header — شريط التقدم والعنوان */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => onBack && onBack()}
            className="p-2.5 rounded-xl transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.surface, color: colors.textMuted }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
            {answeredCount} / {exam.questions.length} مُجابة
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
            style={{ backgroundColor: colors.accent }}
          />
        </div>
      </div>

      {/* تنقل الأسئلة */}
      <div className="flex flex-wrap gap-2 mb-6">
        {exam.questions.map((question, index) => (
          <button
            key={question.id}
            onClick={() => goToQuestion(index)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              index === currentQuestionIndex
                ? 'text-white shadow-md scale-105'
                : (question.allowMultiple ? (Array.isArray(answers[question.id]) && answers[question.id].length > 0) : (answers[question.id] != null && answers[question.id] !== ''))
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-2 border-emerald-300 dark:border-emerald-700'
                : 'border-2'
            }`}
            style={{
              backgroundColor: index === currentQuestionIndex ? colors.accent : undefined,
              borderColor: index === currentQuestionIndex ? colors.accent : colors.border
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {/* بطاقة السؤال */}
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 sm:p-8 rounded-2xl border-2 mb-8 shadow-sm"
        style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{ backgroundColor: colors.accent }}
          >
            {currentQuestionIndex + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: colors.text }}>
              {currentQuestion.questionText}
            </h3>
            <p className="text-sm mb-5" style={{ color: colors.textMuted }}>
              {currentQuestion.type === 'mcq' ? 'اختيار من متعدد' : currentQuestion.type === 'true_false' ? 'صح أو خطأ' : 'مقالي'}
              <span className="mx-2">•</span>
              <span>{currentQuestion.marks ?? currentQuestion.points ?? 10} نقطة</span>
            </p>

            {currentQuestion.type === 'mcq' && (
              <div className="space-y-3">
                {currentQuestion.allowMultiple && (
                  <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
                    يمكن اختيار أكثر من إجابة
                  </p>
                )}
                {(currentQuestion.options || []).map((option, index) => {
                  const optId = typeof option === 'object' ? option.id : index;
                  const optText = typeof option === 'object' ? (option.text ?? option.optionText) : option;
                  const multi = Boolean(currentQuestion.allowMultiple);
                  const selected = multi
                    ? (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(optId))
                    : (answers[currentQuestion.id] === optId || answers[currentQuestion.id] === index);
                  return (
                    <label
                      key={optId ?? index}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selected ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type={multi ? 'checkbox' : 'radio'}
                        name={multi ? undefined : `question_${currentQuestion.id}`}
                        value={optId}
                        checked={selected}
                        onChange={() => handleAnswerSelect(currentQuestion.id, optId, multi)}
                        className="w-5 h-5 text-emerald-600"
                      />
                      <span className="font-medium" style={{ color: colors.text }}>{optText}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'true_false' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  answers[currentQuestion.id] === true ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input type="radio" name={`question_${currentQuestion.id}`} checked={answers[currentQuestion.id] === true} onChange={() => handleAnswerSelect(currentQuestion.id, true)} className="w-5 h-5 text-emerald-600" />
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <span className="font-semibold" style={{ color: colors.text }}>صح</span>
                </label>
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  answers[currentQuestion.id] === false ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'
                }`}>
                  <input type="radio" name={`question_${currentQuestion.id}`} checked={answers[currentQuestion.id] === false} onChange={() => handleAnswerSelect(currentQuestion.id, false)} className="w-5 h-5 text-red-600" />
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <span className="font-semibold" style={{ color: colors.text }}>خطأ</span>
                </label>
              </div>
            )}

            {currentQuestion.type === 'essay' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                rows={6}
                className="w-full p-4 rounded-xl border-2 resize-none focus:outline-none focus:ring-2"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, color: colors.text, ['--tw-ring-color']: colors.accent }}
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* أزرار التنقل والإرسال */}
      <div className="flex justify-between items-center gap-4">
        <motion.button
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          whileHover={!isFirstQuestion ? { scale: 1.02 } : {}}
          whileTap={!isFirstQuestion ? { scale: 0.98 } : {}}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 transition-colors ${isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }}
        >
          <ArrowLeft className="w-5 h-5" />
          السابق
        </motion.button>

        {!isLastQuestion ? (
          <motion.button
            onClick={goToNextQuestion}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
            style={{ backgroundColor: colors.accent }}
          >
            التالي
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
            style={{ backgroundColor: isSubmitting ? colors.textMuted : '#059669' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                إرسال الامتحان
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default InternalExamInterface;
