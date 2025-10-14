import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { courseService } from '../../services/courseService';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  BookOpen,
  AlertCircle,
  Send,
  RotateCcw
} from 'lucide-react';

const ExamPage = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExamDetails();
  }, [courseId, examId]);

  useEffect(() => {
    if (exam && exam.duration && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [exam, timeLeft]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getExamDetails(courseId, examId);
      
      if (response.success) {
        const examData = response.data;
        setExam(examData);
        
        // Initialize answers object
        const initialAnswers = {};
        examData.questions.forEach((question, index) => {
          initialAnswers[question.id || index] = '';
        });
        setAnswers(initialAnswers);
        
        // Set timer if exam has duration
        if (examData.duration) {
          setTimeLeft(examData.duration * 60); // Convert minutes to seconds
        }
        
        // If already submitted, show results
        if (examData.alreadySubmitted && examData.previousResult) {
          toast({
            title: "Exam Already Submitted",
            description: `You scored ${examData.previousResult.score}/${examData.previousResult.maxScore} (${examData.previousResult.percentage}%)`,
            variant: "default"
          });
        }
        
      } else {
        throw new Error(response.error || 'Failed to fetch exam details');
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
      setError(error.message || 'Failed to load exam');
      
      if (error.response?.status === 403) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this exam.",
          variant: "destructive"
        });
        navigate(`/courses/${courseId}/content`);
      } else if (error.response?.status === 404) {
        toast({
          title: "Exam Not Found",
          description: "The requested exam does not exist.",
          variant: "destructive"
        });
        navigate(`/courses/${courseId}/content`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    if (!exam || !exam.questions) return { score: 0, maxScore: 0, percentage: 0 };
    
    let score = 0;
    let maxScore = 0;
    
    exam.questions.forEach(question => {
      const questionId = question.id || exam.questions.indexOf(question);
      const userAnswer = answers[questionId];
      const questionPoints = question.points || 1;
      
      maxScore += questionPoints;
      
      if (question.type === 'mcq' || question.type === 'multiple_choice') {
        // For MCQ, check if answer matches correctAnswer
        if (userAnswer === question.correctAnswer) {
          score += questionPoints;
        }
      } else if (question.type === 'true_false') {
        // For true/false, check if answer matches correctAnswer
        if (userAnswer === question.correctAnswer) {
          score += questionPoints;
        }
      } else if (question.type === 'essay') {
        // For essay questions, give partial credit if answer is provided
        if (userAnswer && userAnswer.trim().length > 10) {
          score += questionPoints * 0.8; // 80% credit for essay answers
        }
      }
    });
    
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    
    return { score, maxScore, percentage };
  };

  const handleSubmitExam = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Calculate score
      const { score, maxScore, percentage } = calculateScore();
      
      // Submit exam
      const response = await courseService.submitExam(courseId, examId, answers);
      
      if (response.success) {
        toast({
          title: "Exam Submitted Successfully",
          description: `You scored ${score}/${maxScore} (${percentage}%)`,
          variant: "default"
        });
        
        // Navigate back to course content
        navigate(`/courses/${courseId}/content`);
      } else {
        throw new Error(response.error || 'Failed to submit exam');
      }
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
          <p style={{ color: colors.text }}>Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 style={{ color: colors.text }} className="text-2xl font-bold mb-2">Error Loading Exam</h2>
          <p style={{ color: colors.textMuted }} className="mb-4">{error}</p>
          <button
            onClick={() => navigate(`/courses/${courseId}/content`)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: colors.accent }}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">📝</div>
          <h2 style={{ color: colors.text }} className="text-2xl font-bold mb-2">No Exam Found</h2>
          <p style={{ color: colors.textMuted }} className="mb-4">This exam is not available.</p>
          <button
            onClick={() => navigate(`/courses/${courseId}/content`)}
            className="px-4 py-2 rounded-lg text-white"
            style={{ background: colors.accent }}
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const { score, maxScore, percentage } = calculateScore();

  return (
    <div className="min-h-screen" style={{ background: colors.background }}>
      {/* Header */}
      <div style={{ 
        background: `linear-gradient(135deg, ${colors.surfaceCard}, ${colors.surfaceCard}dd)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing.lg} 0`
      }}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/courses/${courseId}/content`)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: colors.textMuted }}
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 style={{ 
                  color: colors.text, 
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: '700'
                }}>
                  {exam.title}
                </h1>
                <p style={{ 
                  color: colors.textMuted,
                  fontSize: typography.fontSize.sm
                }}>
                  {exam.description || ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {exam.duration && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                  background: timeLeft < 300 ? colors.error + '20' : colors.accent + '20',
                  color: timeLeft < 300 ? colors.error : colors.accent
                }}>
                  <Clock size={16} />
                  <span className="font-mono font-bold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              
              <div className="text-right">
                <div style={{ color: colors.text, fontSize: typography.fontSize.lg, fontWeight: '600' }}>
                  {exam.questionsCount} Questions
                </div>
                <div style={{ color: colors.textMuted, fontSize: typography.fontSize.xs }}>
                  {exam.totalMarks} Total Marks
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Questions */}
          <div className="lg:col-span-3 space-y-6">
            {exam.questions.map((question, index) => (
              <motion.div
                key={question.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: colors.surfaceCard,
                  borderRadius: borderRadius.lg,
                  padding: spacing.lg,
                  boxShadow: shadows.md
                }}
              >
                <div className="flex items-start gap-4">
                  <div style={{
                    background: colors.accent,
                    color: 'white',
                    borderRadius: borderRadius.full,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: typography.fontSize.sm,
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 style={{ 
                      color: colors.text, 
                      fontSize: typography.fontSize.lg,
                      fontWeight: '600',
                      marginBottom: spacing.md
                    }}>
                      {question.question}
                    </h3>
                    
                    <div style={{ color: colors.textMuted, fontSize: typography.fontSize.sm, marginBottom: spacing.md }}>
                      Type: {question.type} • Points: {question.points || 1}
                    </div>
                    
                    {/* Question Options */}
                    {question.type === 'mcq' || question.type === 'multiple_choice' ? (
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <label
                            key={optionIndex}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{ border: `1px solid ${colors.border}` }}
                          >
                            <input
                              type="radio"
                              name={`question_${question.id || index}`}
                              value={option.text || option.optionText}
                              checked={answers[question.id || index] === (option.text || option.optionText)}
                              onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                              style={{ accentColor: colors.accent }}
                            />
                            <span style={{ color: colors.text }}>
                              {option.text || option.optionText}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : question.type === 'true_false' ? (
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: `1px solid ${colors.border}` }}>
                          <input
                            type="radio"
                            name={`question_${question.id || index}`}
                            value="true"
                            checked={answers[question.id || index] === 'true'}
                            onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                            style={{ accentColor: colors.accent }}
                          />
                          <span style={{ color: colors.text }}>True</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{ border: `1px solid ${colors.border}` }}>
                          <input
                            type="radio"
                            name={`question_${question.id || index}`}
                            value="false"
                            checked={answers[question.id || index] === 'false'}
                            onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                            style={{ accentColor: colors.accent }}
                          />
                          <span style={{ color: colors.text }}>False</span>
                        </label>
                      </div>
                    ) : question.type === 'essay' ? (
                      <textarea
                        value={answers[question.id || index] || ''}
                        onChange={(e) => handleAnswerChange(question.id || index, e.target.value)}
                        placeholder="Type your answer here..."
                        rows={4}
                        className="w-full p-3 rounded-lg border resize-none"
                        style={{
                          border: `1px solid ${colors.border}`,
                          background: colors.background,
                          color: colors.text
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Progress Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: colors.surfaceCard,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                boxShadow: shadows.md
              }}
            >
              <h3 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize.lg,
                fontWeight: '600',
                marginBottom: spacing.md
              }}>
                Progress Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Answered:</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    {Object.values(answers).filter(answer => answer && answer.trim()).length} / {exam.questionsCount}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Estimated Score:</span>
                  <span style={{ color: colors.text, fontWeight: '600' }}>
                    {score} / {maxScore}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>Percentage:</span>
                  <span style={{ 
                    color: percentage >= exam.passingScore ? colors.success : colors.warning,
                    fontWeight: '600'
                  }}>
                    {percentage}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  background: colors.accent,
                  color: 'white',
                  border: 'none'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Exam
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;

