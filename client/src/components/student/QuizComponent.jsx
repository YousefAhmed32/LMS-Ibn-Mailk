import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import { toast } from '../../hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  RotateCcw,
  Send,
  AlertCircle
} from 'lucide-react';

const QuizComponent = ({ lesson, onQuizSubmit, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const quiz = lesson?.quiz || {};
  const questions = quiz.questions || [];

  useEffect(() => {
    if (quiz.timeLimit && !isSubmitted) {
      setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Use a flag to prevent multiple submissions
            if (!isSubmitted) {
              handleSubmit();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz.timeLimit, isSubmitted, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.options.find(option => option.isCorrect);
      
      if (userAnswer === correctAnswer?.id) {
        correctAnswers++;
      }
    });
    
    const percentage = Math.round((correctAnswers / questions.length) * 100);
    setScore(percentage);
    return percentage;
  };

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;
    
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      toast({
        title: "أسئلة غير مجابة",
        description: `يوجد ${unansweredQuestions.length} أسئلة لم يتم الإجابة عليها`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitted(true);
    const finalScore = calculateScore();
    setShowResults(true);

    if (onQuizSubmit) {
      onQuizSubmit({
        lessonId: lesson.id,
        answers,
        score: finalScore,
        timeSpent: quiz.timeLimit ? (quiz.timeLimit * 60) - timeLeft : 0
      });
    }

    toast({
      title: "تم إرسال الاختبار",
      description: `درجتك: ${finalScore}%`,
      variant: finalScore >= 70 ? "default" : "destructive"
    });
  }, [isSubmitted, questions, answers, onQuizSubmit, lesson.id, quiz.timeLimit, timeLeft]);

  const handleRetake = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setIsSubmitted(false);
    setShowResults(false);
    setScore(0);
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (!questions.length) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا يوجد اختبار متاح
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            هذا الدرس لا يحتوي على اختبار
          </p>
          <Button onClick={onClose} variant="outline">
            إغلاق
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            نتائج الاختبار
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              score >= 70 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {score >= 70 ? (
                <Trophy className="h-12 w-12 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div className={`text-4xl font-bold mb-2 ${
              score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {score}%
            </div>
            
            <p className={`text-lg font-semibold ${
              score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {score >= 70 ? 'ممتاز! لقد نجحت في الاختبار' : 'يجب أن تحصل على 70% على الأقل للنجاح'}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correctAnswer = question.options.find(option => option.isCorrect);
              const isCorrect = userAnswer === correctAnswer?.id;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {index + 1}. {question.question}
                      </p>
                      <div className="space-y-1">
                        <p className={`text-sm ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          إجابتك: {question.options.find(opt => opt.id === userAnswer)?.text || 'لم تجب'}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-700 dark:text-green-300">
                            الإجابة الصحيحة: {correctAnswer?.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleRetake} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              إعادة الاختبار
            </Button>
            <Button onClick={onClose}>
              إغلاق
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
            اختبار الدرس
          </CardTitle>
          {timeLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              timeLeft < 60 ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              <Clock className="h-4 w-4" />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% مكتمل</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              {currentQuestion.question}
            </h3>
            
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.id)}
                    className={`w-full p-4 text-right rounded-lg border-2 transition-all duration-200 ${
                      answers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {answers[currentQuestion.id] === option.id && (
                        <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            السابق
          </Button>
          
          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitted}>
              <Send className="h-4 w-4 mr-2" />
              إرسال الاختبار
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              التالي
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizComponent;
