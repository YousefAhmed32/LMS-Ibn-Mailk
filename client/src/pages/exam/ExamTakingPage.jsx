import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import axiosInstance from '../../api/axiosInstance';
import {
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Send,
  AlertCircle,
  Trophy,
  Target,
  Loader2,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';

const ExamTakingPage = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  const { user } = useAuth();
  
  // State management
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [error, setError] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  // Load exam data
  useEffect(() => {
    if (courseId && examId) {
      loadExam();
    }
  }, [courseId, examId]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (examStarted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, timeRemaining]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading exam:', { courseId, examId });
      
      const response = await axiosInstance.get(`/api/exams/${courseId}/${examId}`);
      
      if (response.data.success) {
        const { exam: examData, course: courseData } = response.data.data;
        setExam(examData);
        setCourse(courseData);
        
        // Initialize answers
        const initialAnswers = {};
        examData.questions?.forEach((question, index) => {
          initialAnswers[question.id || index] = '';
        });
        setAnswers(initialAnswers);
        
        // Set timer
        if (examData.duration) {
          setTimeRemaining(examData.duration * 60); // Convert minutes to seconds
        }
        
        console.log('Exam loaded successfully:', examData);
      } else {
        throw new Error(response.data.message || 'Failed to load exam');
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load exam');
      
      // Check if exam already completed
      if (error.response?.data?.data?.existingResult) {
        setExamResult(error.response.data.data.existingResult);
        setShowResults(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    toast({
      title: 'تم بدء الامتحان',
      description: 'حظاً سعيداً!',
      variant: 'default'
    });
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    try {
      setIsSubmitting(true);
      
      // Convert answers to array format
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }));
      
      console.log('Submitting exam:', { courseId, examId, answers: answersArray });
      
      const response = await axiosInstance.post(`/api/exams/${courseId}/${examId}/submit`, {
        answers: answersArray,
        timeSpent: timeSpent
      });
      
      if (response.data.success) {
        const result = response.data.data?.result || response.data.result;
        setExamResult(result);
        setShowResults(true);
        
        toast({
          title: 'تم إرسال الامتحان بنجاح',
          description: `درجتك: ${result.percentage}%`,
          variant: 'default'
        });
      } else {
        throw new Error(response.data.message || 'Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'خطأ في إرسال الامتحان',
        description: error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال الامتحان',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': '#10B981',
      'A': '#10B981',
      'B+': '#3B82F6',
      'B': '#3B82F6',
      'C+': '#F59E0B',
      'C': '#F59E0B',
      'D+': '#EF4444',
      'D': '#EF4444',
      'F': '#EF4444'
    };
    return colors[grade] || '#6B7280';
  };

  const renderQuestion = (question, index) => {
    const questionId = question.id || index;
    const currentAnswer = answers[questionId] || '';

    return (
      <motion.div
        key={questionId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        style={{ border: `1px solid ${colors.border}` }}
      >
        {/* Question Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: colors.primary }}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
              {question.points || 1} نقطة
            </span>
          </div>
          <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
            {question.type === 'mcq' || question.type === 'multiple_choice' ? 'اختيار من متعدد' :
             question.type === 'true_false' ? 'صح أو خطأ' :
             question.type === 'essay' ? 'مقالي' : 'سؤال'}
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
          {question.questionText}
        </h3>

        {/* Answer Options */}
        {question.type === 'mcq' || question.type === 'multiple_choice' ? (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <label
                key={option.id || optionIndex}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                style={{ 
                  backgroundColor: currentAnswer === option.text ? colors.primary + '10' : 'transparent',
                  border: `1px solid ${currentAnswer === option.text ? colors.primary : colors.border}`
                }}
              >
                <input
                  type="radio"
                  name={`question_${questionId}`}
                  value={option.text}
                  checked={currentAnswer === option.text}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <span style={{ color: colors.text }}>
                  {option.text || option.optionText}
                </span>
              </label>
            ))}
          </div>
        ) : question.type === 'true_false' ? (
          <div className="space-y-3">
            {[
              { value: 'true', label: 'صح' },
              { value: 'false', label: 'خطأ' }
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                style={{ 
                  backgroundColor: currentAnswer === option.value ? colors.primary + '10' : 'transparent',
                  border: `1px solid ${currentAnswer === option.value ? colors.primary : colors.border}`
                }}
              >
                <input
                  type="radio"
                  name={`question_${questionId}`}
                  value={option.value}
                  checked={currentAnswer === option.value}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  className="w-4 h-4"
                  style={{ accentColor: colors.primary }}
                />
                <span style={{ color: colors.text }}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        ) : question.type === 'essay' ? (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full p-3 rounded-lg border-2 resize-none"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
              minHeight: '120px'
            }}
            rows={4}
          />
        ) : null}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: colors.primary }} />
          <p style={{ color: colors.text }}>جاري تحميل الامتحان...</p>
        </div>
      </div>
    );
  }

  if (error && !showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>خطأ في تحميل الامتحان</h2>
          <p className="mb-4" style={{ color: colors.textMuted }}>{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            العودة للدورات
          </button>
        </div>
      </div>
    );
  }

  if (showResults && examResult) {
    // Debug: Log exam result data
    console.log('🔍 معلومات نتائج الامتحان:', {
      'النتيجة الكاملة': examResult,
      'النسبة المئوية': examResult.percentage,
      'الدرجة': examResult.grade,
      'النجاح': examResult.passed,
      'درجة النجاح المطلوبة': exam?.passingScore || 60,
      'يجب أن ينجح': examResult.percentage >= (exam?.passingScore || 60)
    });
    
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Trophy className="w-16 h-16 mx-auto mb-4" style={{ color: getGradeColor(examResult.grade) }} />
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              تم إكمال الامتحان
            </h1>
            <p className="text-lg" style={{ color: colors.textMuted }}>
              {course?.title} - {exam?.title}
            </p>
          </div>

          {/* Results Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-6"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: getGradeColor(examResult.grade) }}>
                  {examResult.percentage}%
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  النسبة المئوية
                </p>
              </div>

              {/* Grade */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: getGradeColor(examResult.grade) }}>
                  {examResult.grade}
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  التقدير
                </p>
              </div>

              {/* Points */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
                  {examResult.score}/{examResult.maxScore}
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  النقاط
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-6 text-center">
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-800 rounded-lg text-sm text-white border border-gray-600">
                <p className="text-yellow-300 font-bold mb-2">🔍 معلومات التصحيح:</p>
                <div className="space-y-1 text-gray-200">
                  <p>النسبة المئوية: <span className="text-blue-300 font-semibold">{examResult.percentage}%</span></p>
                  <p>الدرجة: <span className="text-green-300 font-semibold">{examResult.grade}</span></p>
                  <p>النجاح: <span className={`font-semibold ${examResult.passed ? 'text-green-300' : 'text-red-300'}`}>
                    {examResult.passed ? 'نعم' : 'لا'}
                  </span></p>
                  <p>درجة النجاح: <span className="text-purple-300 font-semibold">{exam?.passingScore || 60}%</span></p>
                </div>
              </div>
              
              {(() => {
                // Fix: Ensure high grades are always considered passed
                const isPassed = examResult.passed || 
                                examResult.grade === 'A+' || 
                                examResult.grade === 'A' || 
                                examResult.grade === 'B+' ||
                                examResult.percentage >= 90;
                
                return isPassed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">نجح في الامتحان</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">لم ينجح في الامتحان</span>
                  </div>
                );
              })()}
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="px-6 py-3 rounded-lg text-white font-medium flex items-center gap-2"
              style={{ backgroundColor: colors.primary }}
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للدورة
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              style={{ 
                backgroundColor: 'transparent',
                border: `2px solid ${colors.border}`,
                color: colors.text
              }}
            >
              <BookOpen className="w-5 h-5" />
              جميع الدورات
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: colors.error }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: colors.text }}>لم يتم العثور على الامتحان</h2>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: colors.primary }}
          >
            العودة للدورات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b" style={{ borderColor: colors.border }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" style={{ color: colors.text }} />
              </button>
              <div>
                <h1 className="text-xl font-bold" style={{ color: colors.text }}>
                  {exam.title}
                </h1>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {course?.title} - {course?.subject}
                </p>
              </div>
            </div>

            {/* Timer */}
            {examStarted && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: colors.primary + '10' }}>
                <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                <span className="font-mono font-bold" style={{ color: colors.primary }}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {!examStarted ? (
          /* Exam Start Screen */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center"
            style={{ border: `1px solid ${colors.border}` }}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6" style={{ color: colors.primary }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              {exam.title}
            </h2>
            <p className="text-lg mb-6" style={{ color: colors.textMuted }}>
              {course?.title}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  {exam.questions?.length || 0}
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  عدد الأسئلة
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  {exam.duration || 0}
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  المدة (دقيقة)
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>
                  {exam.totalPoints || exam.totalMarks || 0}
                </div>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  إجمالي النقاط
                </p>
              </div>
            </div>

            <button
              onClick={handleStartExam}
              className="px-8 py-3 rounded-lg text-white font-medium text-lg"
              style={{ backgroundColor: colors.primary }}
            >
              بدء الامتحان
            </button>
          </motion.div>
        ) : (
          /* Exam Interface */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Questions Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg sticky top-4" style={{ border: `1px solid ${colors.border}` }}>
                <h3 className="font-semibold mb-4" style={{ color: colors.text }}>
                  الأسئلة ({currentQuestionIndex + 1} من {exam.questions?.length})
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {exam.questions?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        index === currentQuestionIndex
                          ? 'text-white'
                          : answers[exam.questions[index].id || index]
                          ? 'text-white'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                      style={{
                        backgroundColor: index === currentQuestionIndex
                          ? colors.primary
                          : answers[exam.questions[index].id || index]
                          ? colors.success
                          : colors.border
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question Content */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {renderQuestion(exam.questions[currentQuestionIndex], currentQuestionIndex)}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentQuestionIndex === 0 ? 'transparent' : colors.primary,
                    color: currentQuestionIndex === 0 ? colors.textMuted : 'white',
                    border: currentQuestionIndex === 0 ? `1px solid ${colors.border}` : 'none'
                  }}
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex === exam.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      disabled={isSubmitting}
                      className="px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 disabled:opacity-50"
                      style={{ backgroundColor: colors.success }}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      إرسال الامتحان
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamTakingPage;
