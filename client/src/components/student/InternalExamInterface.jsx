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
  const [previousSubmission, setPreviousSubmission] = useState(null);
  const [isEditable, setIsEditable] = useState(false);

  // Load exam data and previous submission
  useEffect(() => {
    loadExam();
  }, [courseId, examId]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load exam data
      const examResponse = await internalExamService.getExamForTaking(courseId, examId);
      
      if (examResponse.success) {
        setExam(examResponse.exam);
        
        // ✅ Check if exam is in review mode (already completed)
        const isReviewMode = examResponse.isReviewMode || examResponse.exam?.isCompleted;
        
        // ✅ Try to load previous submission
        try {
          const submissionResponse = await internalExamService.getExamSubmission(courseId, examId);
          
          if (submissionResponse.success && submissionResponse.submission) {
            const submission = submissionResponse.submission;
            setPreviousSubmission(submission);
            setIsEditable(submission.isEditable || false);
            
            // ✅ Pre-fill answers from previous submission
            const prefilledAnswers = {};
            if (submission.answers) {
              Object.keys(submission.answers).forEach(questionId => {
                const answerData = submission.answers[questionId];
                prefilledAnswers[questionId] = answerData.answer || '';
              });
            }
            setAnswers(prefilledAnswers);
            
            // If exam was already submitted and not editable, show results
            if (!submission.isEditable && submission.submittedAt) {
              setShowResults(true);
              setExamResult({
                score: submission.score,
                maxScore: submission.maxScore,
                percentage: submission.percentage,
                grade: submission.grade,
                level: submission.level,
                passed: submission.passed,
                submittedAt: submission.submittedAt,
                answers: submission.answersArray || submission.answers
              });
            }
          } else if (isReviewMode && examResponse.exam?.previousResult) {
            // If in review mode but no submission found, use previousResult from exam data
            const prevResult = examResponse.exam.previousResult;
            setShowResults(true);
            setExamResult({
              score: prevResult.score,
              maxScore: prevResult.maxScore,
              percentage: prevResult.percentage,
              grade: prevResult.grade,
              submittedAt: prevResult.submittedAt
            });
            setIsEditable(false);
          } else {
            // No previous submission - initialize empty answers
            const initialAnswers = {};
            examResponse.exam.questions.forEach(question => {
              initialAnswers[question.id] = '';
            });
            setAnswers(initialAnswers);
          }
        } catch (submissionError) {
          // If in review mode but submission fetch failed, try to use previousResult from exam
          if (isReviewMode && examResponse.exam?.previousResult) {
            const prevResult = examResponse.exam.previousResult;
            setShowResults(true);
            setExamResult({
              score: prevResult.score,
              maxScore: prevResult.maxScore,
              percentage: prevResult.percentage,
              grade: prevResult.grade,
              submittedAt: prevResult.submittedAt
            });
            setIsEditable(false);
          } else {
            // No submission found - initialize empty answers
            console.log('No previous submission found, starting fresh');
            const initialAnswers = {};
            examResponse.exam.questions.forEach(question => {
              initialAnswers[question.id] = '';
            });
            setAnswers(initialAnswers);
          }
        }
      } else {
        setError(examResponse.message || 'Failed to load exam');
      }
    } catch (err) {
      console.error('Error loading exam:', err);
      setError(err.response?.data?.message || 'Failed to load exam');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ SINGLE-CHOICE ONLY: Handle answer selection with type safety
  const handleAnswerSelect = (questionId, answer) => {
    // Find question to enforce type-safe answer
    const question = exam?.questions?.find(q => q.id === questionId);
    let safeAnswer = answer;

    if (question) {
      if (question.type === 'mcq' || question.type === 'multiple_choice') {
        // MCQ: answer must be option.id (string), never option text
        safeAnswer = typeof answer === 'string' ? answer : String(answer);
        // Assert: answer should match an option ID
        if (question.options && !question.options.some(o => o.id === safeAnswer)) {
          console.warn(`Answer "${safeAnswer}" is not a valid option.id for question ${questionId}. Available IDs:`, question.options.map(o => o.id));
        }
      } else if (question.type === 'true_false') {
        // True/False: normalize to boolean
        if (typeof answer === 'string') {
          safeAnswer = answer === 'true' || answer === 'صحيح';
        } else {
          safeAnswer = Boolean(answer);
        }
      }
      // Essay: keep as-is (string)
    }

    setAnswers(prev => ({
      ...prev,
      [questionId]: safeAnswer
    }));
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

  // Submit exam (handles both new submission and resubmission)
  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      // Check for unanswered questions -- warn but allow submission (they'll be marked as skipped)
      const unansweredQuestions = exam.questions.filter(question => {
        const a = answers[question.id];
        return a == null || a === '' || (Array.isArray(a) && a.length === 0);
      });
      
      if (unansweredQuestions.length > 0) {
        const confirmSubmit = window.confirm(
          `لديك ${unansweredQuestions.length} سؤال غير مجاب من أصل ${exam.questions.length}.\n\n` +
          `الأسئلة غير المجابة: ${unansweredQuestions.map((q, i) => `${exam.questions.indexOf(q) + 1}`).join(', ')}\n\n` +
          `هل تريد إرسال الامتحان على أي حال؟ الأسئلة غير المجابة ستحسب كتخطي.`
        );
        if (!confirmSubmit) {
          setIsSubmitting(false);
          // Navigate to first unanswered question
          const firstUnansweredIdx = exam.questions.findIndex(q => {
            const a = answers[q.id];
            return a == null || a === '' || (Array.isArray(a) && a.length === 0);
          });
          if (firstUnansweredIdx >= 0) setCurrentQuestionIndex(firstUnansweredIdx);
          return;
        }
      }

      // Convert answers to array format for backend
      const answersArray = exam.questions.map(question => ({
        questionId: question.id,
        answer: answers[question.id] ?? '' // Empty string for skipped
      }));

      const response = await internalExamService.submitExam(courseId, examId, answersArray);
      
      if (response.success) {
        // Extract result from response.data.result (backend returns { success, data: { result } })
        const result = response.data?.result || response.result || {};
        setExamResult(result);
        setShowResults(true);
        
        // Reload submission to get full data with answers
        try {
          const submissionResponse = await internalExamService.getExamSubmission(courseId, examId);
          if (submissionResponse.success && submissionResponse.submission) {
            setPreviousSubmission(submissionResponse.submission);
            setIsEditable(submissionResponse.submission.isEditable || false);
          }
        } catch (err) {
          console.log('Could not reload submission:', err);
        }
        
        toast({
          title: previousSubmission ? 'تم تحديث الإجابات بنجاح' : 'تم إرسال الامتحان بنجاح',
          description: `درجتك: ${result.score}/${result.maxScore} (${result.percentage}%) - ${result.grade}`
        });
        
        if (onExamComplete) {
          onExamComplete(result);
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

  // ═══════════════════════════════════════════════════════════════
  // RESULTS DASHBOARD — Animated, luxury design with per-question review
  // ═══════════════════════════════════════════════════════════════
  if (showResults && examResult) {
    const passingThreshold = examResult.passingScore ?? exam?.passingScore ?? 60;
    const isPassed = examResult.isPassed ?? examResult.passed ?? (examResult.percentage != null && examResult.percentage >= passingThreshold);
    const isExcellent = (examResult.percentage || 0) >= 90;
    // Use answers from submission or from examResult
    const answersList = examResult.answers || previousSubmission?.answersArray || [];
    const correctCount = examResult.correctAnswers ?? answersList.filter(q => q.isCorrect).length;
    const skippedCount = examResult.skippedAnswers ?? answersList.filter(q => q.skipped).length;
    const incorrectCount = (examResult.totalQuestions || answersList.length) - correctCount - skippedCount;
    const totalQ = examResult.totalQuestions || answersList.length || 1;
    const pct = examResult.percentage || 0;

    // Animated circular progress
    const circleSize = 180;
    const strokeWidth = 12;
    const radius = (circleSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    const circleColor = isExcellent ? '#10b981' : isPassed ? '#3b82f6' : '#ef4444';

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto p-4 sm:p-8"
        role="region"
        aria-label="نتيجة الامتحان"
      >
        {/* Hero section with animated circle */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 120 }}
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8 text-center"
          style={{
            background: isExcellent
              ? 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)'
              : isPassed
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
                : 'linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),transparent)]" />
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm"
            >
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {isExcellent ? 'ممتاز! أداء متميز' : isPassed ? 'مبروك! نجحت في الامتحان' : 'تم إكمال الامتحان'}
            </h1>
            <p className="text-white/80 text-sm mb-6">{exam?.title}</p>

            {/* Animated circular progress */}
            <div className="flex justify-center mb-4">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg width={circleSize} height={circleSize} className="transform -rotate-90">
                  <circle
                    cx={circleSize / 2} cy={circleSize / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={strokeWidth}
                  />
                  <motion.circle
                    cx={circleSize / 2} cy={circleSize / 2} r={radius}
                    fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    className="text-4xl sm:text-5xl font-black text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                  >
                    {pct}%
                  </motion.span>
                  <span className="text-white/80 text-sm font-medium">
                    {examResult.score}/{examResult.maxScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Grade badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-sm"
            >
              <Award className="w-6 h-6 text-white" />
              <span className="text-2xl font-black text-white">{examResult.grade}</span>
              {examResult.level && (
                <span className="text-white/90 text-sm font-medium">{examResult.level}</span>
              )}
            </motion.div>
            <p className="text-white/70 text-xs mt-3">
              درجة النجاح: {passingThreshold}% — {isPassed ? 'ناجح' : 'غير ناجح'}
            </p>
          </div>
        </motion.div>

        {/* Score breakdown cards */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
        >
          {[
            { label: 'صحيح', count: correctCount, color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '✓' },
            { label: 'خاطئ', count: incorrectCount, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '✗' },
            { label: 'تخطي', count: skippedCount, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '—' }
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="rounded-2xl border p-4 sm:p-5 text-center"
              style={{ backgroundColor: item.bg, borderColor: item.color + '30' }}
            >
              <div className="text-3xl sm:text-4xl font-black mb-1" style={{ color: item.color }}>
                {item.count}
              </div>
              <div className="text-xs sm:text-sm font-medium" style={{ color: item.color }}>
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Per-question review */}
        {answersList.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-2xl border p-5 sm:p-6 mb-8"
            style={{ backgroundColor: colors.surfaceCard, borderColor: colors.border }}
          >
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2" style={{ color: colors.text }}>
              <Eye className="w-5 h-5" />
              مراجعة تفصيلية
            </h2>
            <div className="space-y-4">
              {answersList.map((q, idx) => {
                const isCorrect = q.isCorrect === true;
                const isSkipped = q.skipped === true || (!q.answer && q.answer !== false);
                const borderColor = isSkipped ? '#f59e0b' : isCorrect ? '#10b981' : '#ef4444';
                const bgColor = isSkipped ? 'rgba(245,158,11,0.05)' : isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)';

                // Find option text for MCQ answers
                const getOptionText = (optionId) => {
                  const question = exam?.questions?.find(eq => eq.id === q.questionId);
                  if (question?.options) {
                    const opt = question.options.find(o => o.id === optionId);
                    return opt?.text || opt?.optionText || optionId;
                  }
                  return optionId;
                };

                const isMCQ = q.questionType === 'mcq' || q.questionType === 'multiple_choice';

                return (
                  <motion.div
                    key={q.questionId || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.05 }}
                    className="rounded-xl border-2 p-4 sm:p-5"
                    style={{ borderColor: borderColor + '40', backgroundColor: bgColor }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ backgroundColor: borderColor + '20', color: borderColor }}
                      >
                        {isSkipped ? '—' : isCorrect ? '✓' : '✗'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-relaxed" style={{ color: colors.text }}>
                          {q.questionText || `سؤال ${idx + 1}`}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: colors.textMuted }}>
                          <span>{q.earnedMarks || 0} / {q.maxMarks || 0} نقطة</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: borderColor + '15', color: borderColor }}>
                            {isSkipped ? 'تم التخطي' : isCorrect ? 'إجابة صحيحة' : 'إجابة خاطئة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Student answer vs correct answer */}
                    {!isSkipped && (
                      <div className="mr-11 space-y-2">
                        {/* Student's answer */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isCorrect ? 'bg-emerald-100/50' : 'bg-red-100/50'
                        }`}>
                          <span className="font-medium" style={{ color: colors.textMuted }}>إجابتك:</span>
                          <span className="font-semibold" style={{ color: isCorrect ? '#059669' : '#dc2626' }}>
                            {q.questionType === 'true_false'
                              ? (q.answer === true || q.answer === 'true' ? 'صحيح' : 'خطأ')
                              : isMCQ
                                ? getOptionText(q.answer)
                                : (String(q.answer || '').slice(0, 100) + (String(q.answer || '').length > 100 ? '...' : ''))
                            }
                          </span>
                        </div>

                        {/* Correct answer (only show if wrong) */}
                        {!isCorrect && q.correctAnswer != null && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100/50 text-sm">
                            <span className="font-medium" style={{ color: colors.textMuted }}>الإجابة الصحيحة:</span>
                            <span className="font-semibold text-emerald-600">
                              {q.questionType === 'true_false'
                                ? (q.correctAnswer === true || q.correctAnswer === 'true' ? 'صحيح' : 'خطأ')
                                : isMCQ
                                  ? getOptionText(q.correctAnswer)
                                  : String(q.correctAnswer)
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    {isSkipped && (
                      <p className="mr-11 text-xs italic" style={{ color: '#f59e0b' }}>
                        لم يتم الإجابة على هذا السؤال
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Submission time */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl border p-5 mb-8"
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
          {examResult.timeSpent > 0 && (
            <div className="flex items-center justify-between text-sm mt-2" style={{ color: colors.textMuted }}>
              <span>الوقت المستغرق</span>
              <span className="font-medium" style={{ color: colors.text }}>
                {Math.floor(examResult.timeSpent / 60)} دقيقة {examResult.timeSpent % 60} ثانية
              </span>
            </div>
          )}
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="flex justify-center"
        >
          <button
            onClick={() => onBack && onBack()}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: colors.accent }}
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
  // ✅ SINGLE-CHOICE ONLY: Count answered questions (single value only)
  const answeredCount = exam.questions.filter(q => {
    const a = answers[q.id];
    return a != null && a !== '' && !(Array.isArray(a) && a.length === 0);
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
                : (answers[question.id] != null && answers[question.id] !== '' && !(Array.isArray(answers[question.id]) && answers[question.id].length === 0))
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

            {currentQuestion.type === 'mcq' && (() => {
              // ✅ Show correctness if previous submission exists
              const answerData = previousSubmission?.answers?.[currentQuestion.id];
              const showCorrectness = previousSubmission && !isEditable && answerData;
              
              return (
                <div className="space-y-3">
                  {/* ✅ SINGLE-CHOICE ONLY: Radio buttons with correctness indicators */}
                  {(currentQuestion.options || []).map((option, index) => {
                    const optId = typeof option === 'object' ? option.id : index;
                    const optText = typeof option === 'object' ? (option.text ?? option.optionText) : option;
                    const selected = answers[currentQuestion.id] === optId || answers[currentQuestion.id] === index;
                    const isCorrectAnswer = answerData?.correctAnswer === optId;
                    const isStudentAnswer = selected && answerData;
                    
                    return (
                      <label
                        key={optId ?? index}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          showCorrectness && isCorrectAnswer
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : showCorrectness && isStudentAnswer && !answerData.isCorrect
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                            : selected
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQuestion.id}`}
                          value={optId}
                          checked={selected}
                          onChange={() => handleAnswerSelect(currentQuestion.id, optId)}
                          disabled={showCorrectness && !isEditable}
                          className="w-5 h-5 text-emerald-600"
                        />
                        <span className="font-medium flex-1" style={{ color: colors.text }}>{optText}</span>
                        {showCorrectness && isCorrectAnswer && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        {showCorrectness && isStudentAnswer && !answerData.isCorrect && (
                          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                  {/* Show correctness feedback */}
                  {showCorrectness && answerData && (
                    <div className={`mt-3 p-3 rounded-lg text-sm ${
                      answerData.isCorrect 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {answerData.isCorrect ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          إجابة صحيحة ({answerData.earnedMarks}/{answerData.maxMarks} نقطة)
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          إجابة خاطئة (0/{answerData.maxMarks} نقطة)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

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
