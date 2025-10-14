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
        // Initialize answers object
        const initialAnswers = {};
        response.exam.questions.forEach(question => {
          initialAnswers[question.id] = '';
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

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
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

  // Submit exam
  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate that all questions are answered
      const unansweredQuestions = exam.questions.filter(question => 
        !answers[question.id] || answers[question.id] === ''
      );
      
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

  // Results view
  if (showResults && examResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: colors.accent }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            تم إكمال الامتحان بنجاح!
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {exam.title}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <div className="p-6 rounded-xl border" style={{ 
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border 
          }}>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-3" style={{ color: colors.accent }} />
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>الدرجة</h3>
              <div className="text-3xl font-bold mb-1" style={{ color: colors.accent }}>
                {examResult.score}/{examResult.maxScore}
              </div>
              <div className="text-sm" style={{ color: colors.textMuted }}>
                {examResult.percentage}%
              </div>
            </div>
          </div>

          {/* Grade Card */}
          <div className="p-6 rounded-xl border" style={{ 
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border 
          }}>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-3" style={{ color: colors.accent }} />
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>التقدير</h3>
              <div className={`text-2xl font-bold px-4 py-2 rounded-lg border ${getGradeColor(examResult.grade)}`}>
                {examResult.grade}
              </div>
              <div className="text-sm mt-2" style={{ color: colors.textMuted }}>
                {examResult.level}
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="p-6 rounded-xl border" style={{ 
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border 
          }}>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: colors.accent }} />
              <h3 className="font-semibold mb-2" style={{ color: colors.text }}>وقت الإرسال</h3>
              <div className="text-lg font-semibold mb-1" style={{ color: colors.text }}>
                {new Date(examResult.submittedAt).toLocaleDateString('ar-SA')}
              </div>
              <div className="text-sm" style={{ color: colors.textMuted }}>
                {new Date(examResult.submittedAt).toLocaleTimeString('ar-SA')}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onBack && onBack()}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            العودة للدورة
          </button>
        </div>
      </motion.div>
    );
  }

  // Pre-exam instructions
  if (!examStarted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="text-center mb-8">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: colors.accent }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            {exam.title}
          </h2>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            امتحان الدورة التدريبية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-xl border" style={{ 
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border 
          }}>
            <FileText className="w-8 h-8 mb-3" style={{ color: colors.accent }} />
            <h3 className="font-semibold mb-2" style={{ color: colors.text }}>عدد الأسئلة</h3>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>
              {exam.totalQuestions}
            </p>
          </div>

          <div className="p-6 rounded-xl border" style={{ 
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border 
          }}>
            <Target className="w-8 h-8 mb-3" style={{ color: colors.accent }} />
            <h3 className="font-semibold mb-2" style={{ color: colors.text }}>إجمالي النقاط</h3>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>
              {exam.totalMarks}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-xl border mb-8" style={{ 
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border 
        }}>
          <h3 className="font-semibold mb-4" style={{ color: colors.text }}>تعليمات الامتحان</h3>
          <ul className="space-y-2 text-sm" style={{ color: colors.textMuted }}>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
              اقرأ كل سؤال بعناية قبل الإجابة
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
              يمكنك التنقل بين الأسئلة باستخدام الأسهم
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
              تأكد من الإجابة على جميع الأسئلة قبل الإرسال
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.accent }} />
              سيتم حساب الدرجة تلقائياً عند الإرسال
            </li>
          </ul>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => onBack && onBack()}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            العودة
          </button>
          <button
            onClick={handleStartExam}
            className="px-6 py-3 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.accent,
              color: colors.background
            }}
          >
            <Play className="w-4 h-4 inline mr-2" />
            بدء الامتحان
          </button>
        </div>
      </motion.div>
    );
  }

  // Main exam interface
  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBack && onBack()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: colors.textMuted }} />
          </button>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
              {exam.title}
            </h2>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              السؤال {currentQuestionIndex + 1} من {exam.questions.length}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium" style={{ color: colors.text }}>
            {exam.questions.filter(q => answers[q.id] && answers[q.id] !== '').length} / {exam.questions.length}
          </div>
          <div className="w-24 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: colors.accent,
                width: `${(exam.questions.filter(q => answers[q.id] && answers[q.id] !== '').length / exam.questions.length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {exam.questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => goToQuestion(index)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                index === currentQuestionIndex
                  ? 'text-white'
                  : answers[question.id] && answers[question.id] !== ''
                  ? 'text-green-600 bg-green-50 border border-green-200'
                  : 'text-gray-600 bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: index === currentQuestionIndex ? colors.accent : undefined
              }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question Content */}
      <div className="mb-8">
        <div className="p-6 rounded-xl border mb-6" style={{ 
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border 
        }}>
          <div className="flex items-start gap-4 mb-6">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                 style={{ backgroundColor: colors.accent }}>
              {currentQuestionIndex + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                {currentQuestion.questionText}
              </h3>
              
              <div className="text-sm mb-4" style={{ color: colors.textMuted }}>
                نوع السؤال: {currentQuestion.type === 'mcq' ? 'اختيار من متعدد' : 
                           currentQuestion.type === 'true_false' ? 'صح أو خطأ' : 'مقالي'} | 
                النقاط: {currentQuestion.marks}
              </div>

              {/* Answer Options */}
              {currentQuestion.type === 'mcq' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${currentQuestion.id}`}
                        value={option.id}
                        checked={answers[currentQuestion.id] === option.id}
                        onChange={() => handleAnswerSelect(currentQuestion.id, option.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span style={{ color: colors.text }}>
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === true ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === true}
                      onChange={() => handleAnswerSelect(currentQuestion.id, true)}
                      className="w-4 h-4 text-green-600"
                    />
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span style={{ color: colors.text }}>صح</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === false ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      checked={answers[currentQuestion.id] === false}
                      onChange={() => handleAnswerSelect(currentQuestion.id, false)}
                      className="w-4 h-4 text-red-600"
                    />
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span style={{ color: colors.text }}>خطأ</span>
                  </label>
                </div>
              )}

              {currentQuestion.type === 'essay' && (
                <div>
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerSelect(currentQuestion.id, e.target.value)}
                    placeholder="اكتب إجابتك هنا..."
                    rows={6}
                    className="w-full p-3 rounded-lg border resize-none"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.text
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={goToPreviousQuestion}
          disabled={isFirstQuestion}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isFirstQuestion ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{
            backgroundColor: isFirstQuestion ? colors.surface : colors.surface,
            color: isFirstQuestion ? colors.textMuted : colors.text,
            border: `1px solid ${colors.border}`
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          السابق
        </button>

        <div className="flex gap-2">
          {!isLastQuestion ? (
            <button
              onClick={goToNextQuestion}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: colors.accent,
                color: colors.background
              }}
            >
              التالي
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: colors.success,
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  إرسال الامتحان
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InternalExamInterface;
