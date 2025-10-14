import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
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

const ExamPage = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  const { user } = useAuth();
  
  const [exam, setExam] = useState(null);
  const [course, setCourse] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const [examStarted, setExamStarted] = useState(false);

  // Fetch exam data
  const fetchExamData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching exam data for:', { courseId, examId });
      
      const response = await axiosInstance.get(`/api/exams/${courseId}/${examId}`);
      
      if (response.data.success) {
        const examData = response.data.data.exam;
        const courseData = response.data.data.course;
        
        // Validate exam data
        if (!examData) {
          throw new Error('Exam data not found in response');
        }
        
        if (!examData.questions || examData.questions.length === 0) {
          throw new Error('No questions available in this exam');
        }
        
        setExam(examData);
        setCourse(courseData);
        setTimeRemaining((examData.duration || 30) * 60); // Convert minutes to seconds
        
        // Initialize answers
        const initialAnswers = {};
        examData.questions.forEach((question, index) => {
          initialAnswers[question.id || index] = '';
        });
        setAnswers(initialAnswers);
        
        console.log('Exam data loaded successfully:', examData);
        console.log('Questions count:', examData.questions.length);
      } else {
        throw new Error(response.data.error || 'Failed to load exam');
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError(error.response?.data?.error || error.message || 'Failed to load exam');
      
      toast({
        title: 'خطأ في تحميل الامتحان',
        description: error.response?.data?.message || error.response?.data?.error || 'حدث خطأ أثناء تحميل الامتحان',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, examId]);

  useEffect(() => {
    if (courseId && examId) {
      fetchExamData();
    } else {
      setError('Missing course or exam ID');
      setLoading(false);
    }

    // Start timer when exam is loaded
    if (exam && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, timeRemaining]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (exam?.questions && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Prepare answers array
      const answersArray = exam?.questions?.map((question, index) => ({
        questionId: question.id || index,
        answer: answers[question.id || index] || ''
      })) || [];

      console.log('Submitting exam:', { courseId, examId, answers: answersArray });

      const response = await axiosInstance.post(`/api/exams/${courseId}/${examId}/submit`, {
        answers: answersArray,
        timeSpent: (exam.duration * 60) - timeRemaining
      });

      if (response.data.success) {
        setExamResult(response.data.data);
        setShowResults(true);
        
        toast({
          title: 'تم إرسال الامتحان بنجاح',
          description: `نتيجتك: ${response.data.data.result.percentage}%`,
          variant: response.data.data.result.passed ? 'success' : 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: 'خطأ في إرسال الامتحان',
        description: error.response?.data?.message || 'حدث خطأ أثناء إرسال الامتحان',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            جاري تحميل الامتحان...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`max-w-md mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 text-center`}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            خطأ في تحميل الامتحان
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchExamData}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              إعادة المحاولة
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              العودة للدورات
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // No exam data
  if (!exam) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            لم يتم العثور على الامتحان
          </p>
        </motion.div>
      </div>
    );
  }

  if (showResults && examResult) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-4xl mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8`}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                  examResult.result.passed ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {examResult.result.passed ? (
                  <Trophy className="w-10 h-10 text-green-600" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-red-600" />
                )}
              </motion.div>
              
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {examResult.result.passed ? 'مبروك! لقد نجحت' : 'لم تنجح هذه المرة'}
              </h1>
              
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {exam.title}
              </p>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`p-6 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {examResult.result.score}/{examResult.result.maxScore}
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>النقاط</div>
              </div>
              
              <div className={`p-6 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {examResult.result.percentage}%
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>النسبة المئوية</div>
              </div>
              
              <div className={`p-6 rounded-xl text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold" style={{ color: colors.text }}>
                  {examResult.result.grade}
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>الدرجة</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                  color: colors.background
                }}
              >
                العودة للدورة
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = exam?.questions?.[currentQuestionIndex];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {exam.title}
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {course?.title || 'الدورة التدريبية'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-red-500" />
                <span className={`text-lg font-bold ${timeRemaining < 300 ? 'text-red-500' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-sm ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                السؤال {currentQuestionIndex + 1} من {exam?.questions?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              التقدم
            </span>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {exam?.questions?.length ? Math.round(((currentQuestionIndex + 1) / exam.questions.length) * 100) : 0}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <motion.div
              className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${exam?.questions?.length ? ((currentQuestionIndex + 1) / exam.questions.length) * 100 : 0}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion ? (
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-6`}
          >
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {currentQuestion.questionText}
            </h2>
            
            <div className={`text-sm px-3 py-1 rounded-full inline-block ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'mcq' ? 'اختيار من متعدد' :
               currentQuestion.type === 'true_false' ? 'صح أو خطأ' :
               currentQuestion.type === 'essay' ? 'سؤال مقالي' : 'سؤال'}
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'mcq' ? (
              currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    answers[currentQuestion.id || currentQuestionIndex] === option.text
                      ? `border-${colors.accent} bg-${colors.accent}10`
                      : isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id || currentQuestionIndex}`}
                    value={option.text}
                    checked={answers[currentQuestion.id || currentQuestionIndex] === option.text}
                    onChange={(e) => handleAnswerChange(currentQuestion.id || currentQuestionIndex, e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {option.text}
                  </span>
                </label>
              ))
            ) : currentQuestion.type === 'true_false' ? (
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.id || currentQuestionIndex] === 'true'
                    ? `border-green-500 bg-green-50`
                    : isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id || currentQuestionIndex}`}
                    value="true"
                    checked={answers[currentQuestion.id || currentQuestionIndex] === 'true'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id || currentQuestionIndex, e.target.value)}
                    className="w-4 h-4"
                  />
                  <CheckCircle size={20} className="text-green-600" />
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>صح</span>
                </label>
                
                <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.id || currentQuestionIndex] === 'false'
                    ? `border-red-500 bg-red-50`
                    : isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id || currentQuestionIndex}`}
                    value="false"
                    checked={answers[currentQuestion.id || currentQuestionIndex] === 'false'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id || currentQuestionIndex, e.target.value)}
                    className="w-4 h-4"
                  />
                  <XCircle size={20} className="text-red-600" />
                  <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>خطأ</span>
                </label>
              </div>
            ) : currentQuestion.type === 'essay' ? (
              <textarea
                value={answers[currentQuestion.id || currentQuestionIndex] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id || currentQuestionIndex, e.target.value)}
                placeholder="اكتب إجابتك هنا..."
                rows={6}
                className={`w-full p-4 rounded-xl border-2 resize-none focus:outline-none focus:ring-2 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-200 text-gray-900 focus:border-blue-500'
                }`}
              />
            ) : null}
          </div>
        </motion.div>
        ) : (
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8 mb-6 text-center`}>
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              جاري تحميل السؤال...
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                currentQuestionIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              السؤال السابق
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                  color: colors.background
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    إرسال الامتحان
                  </>
                )}
              </button>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={!exam?.questions || currentQuestionIndex === exam.questions.length - 1}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                !exam?.questions || currentQuestionIndex === exam.questions.length - 1
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              السؤال التالي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
