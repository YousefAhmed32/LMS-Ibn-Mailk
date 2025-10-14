import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import examService from '../../services/examService';
import {
  BookOpen,
  Clock,
  Users,
  Award,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';

const ExamPage = () => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const { user } = useAuth();
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Load exam data
  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  const loadExamData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call - replace with actual API endpoint
      const response = await fetch(`/api/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load exam data');
      }
      
      const examData = await response.json();
      setExam(examData);
      
      // Set exam timer if available
      if (examData.duration) {
        setTimeRemaining(examData.duration * 60); // Convert minutes to seconds
      }
    } catch (err) {
      console.error('Error loading exam:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle exam start
  const handleStartExam = () => {
    setExamStarted(true);
    // Start timer if available
    if (timeRemaining) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle exam submission
  const handleSubmitExam = async () => {
    try {
      // Simulate exam submission
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: {}, // Replace with actual answers
          timeSpent: exam?.duration ? (exam.duration * 60 - timeRemaining) : 0
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Navigate to results page or show success message
        console.log('Exam submitted successfully:', result);
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
    }
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.gradient }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: colors.accent }} />
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Loading Exam...
          </h3>
          <p 
            className="text-sm"
            style={{ color: colors.textMuted }}
          >
            Please wait while we prepare your exam
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.gradient }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-4"
        >
          <AlertCircle size={64} style={{ color: colors.error }} className="mx-auto mb-4" />
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Exam Not Found
          </h3>
          <p 
            className="text-sm mb-6"
            style={{ color: colors.textMuted }}
          >
            {error}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
            style={{
              backgroundColor: colors.accent,
              color: '#FFFFFF'
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </div>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Exam not started state
  if (!examStarted) {
    return (
      <div className="min-h-screen" style={{ background: colors.gradient }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4"
              style={{ color: colors.textMuted }}
            >
              <ArrowLeft size={20} />
              <span>Back to Course</span>
            </button>
            
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: colors.text }}
            >
              {exam?.title || `Exam ${examId}`}
            </h1>
            <p 
              className="text-lg"
              style={{ color: colors.textMuted }}
            >
              {exam?.description || 'Test your knowledge with this exam'}
            </p>
          </motion.div>

          {/* Exam Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            {/* Duration */}
            <div 
              className="p-6 rounded-xl text-center"
              style={{
                background: colors.surfaceCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.lg
              }}
            >
              <Clock size={32} style={{ color: colors.accent }} className="mx-auto mb-3" />
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: colors.text }}
              >
                Duration
              </h3>
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.accent }}
              >
                {exam?.duration || 60} min
              </p>
            </div>

            {/* Questions */}
            <div 
              className="p-6 rounded-xl text-center"
              style={{
                background: colors.surfaceCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.lg
              }}
            >
              <FileText size={32} style={{ color: colors.success }} className="mx-auto mb-3" />
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: colors.text }}
              >
                Questions
              </h3>
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.success }}
              >
                {exam?.questionCount || 20}
              </p>
            </div>

            {/* Passing Score */}
            <div 
              className="p-6 rounded-xl text-center"
              style={{
                background: colors.surfaceCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.lg
              }}
            >
              <Award size={32} style={{ color: colors.warning }} className="mx-auto mb-3" />
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: colors.text }}
              >
                Passing Score
              </h3>
              <p 
                className="text-2xl font-bold"
                style={{ color: colors.warning }}
              >
                {exam?.passingScore || 70}%
              </p>
            </div>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div 
              className="p-6 rounded-xl"
              style={{
                background: colors.surfaceCard,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.lg
              }}
            >
              <h3 
                className="text-lg font-semibold mb-4"
                style={{ color: colors.text }}
              >
                Exam Instructions
              </h3>
              <ul 
                className="space-y-2 text-sm"
                style={{ color: colors.textMuted }}
              >
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} style={{ color: colors.success, marginTop: 2 }} />
                  <span>Read each question carefully before selecting your answer</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} style={{ color: colors.success, marginTop: 2 }} />
                  <span>You can navigate between questions using the navigation buttons</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} style={{ color: colors.success, marginTop: 2 }} />
                  <span>Review your answers before submitting the exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} style={{ color: colors.success, marginTop: 2 }} />
                  <span>Once submitted, you cannot change your answers</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartExam}
              className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
              style={{
                backgroundColor: colors.accent,
                color: '#FFFFFF',
                boxShadow: shadows.lg
              }}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={24} />
                <span>Start Exam</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Exam in progress state
  return (
    <div className="min-h-screen" style={{ background: colors.gradient }}>
      <div className="container mx-auto px-4 py-8">
        {/* Exam Header */}
        <div 
          className="p-4 rounded-xl mb-6"
          style={{
            background: colors.surfaceCard,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.lg
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 
                className="text-xl font-semibold"
                style={{ color: colors.text }}
              >
                {exam?.title || `Exam ${examId}`}
              </h2>
              <p 
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                Question 1 of {exam?.questionCount || 20}
              </p>
            </div>
            
            {timeRemaining !== null && (
              <div 
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  backgroundColor: timeRemaining < 300 ? colors.error + '20' : colors.accent + '20',
                  color: timeRemaining < 300 ? colors.error : colors.accent
                }}
              >
                <Clock size={16} />
                <span className="font-mono font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exam Content Placeholder */}
        <div 
          className="p-8 rounded-xl text-center"
          style={{
            background: colors.surfaceCard,
            border: `1px solid ${colors.border}`,
            boxShadow: shadows.lg
          }}
        >
          <BookOpen size={64} style={{ color: colors.accent }} className="mx-auto mb-4" />
          <h3 
            className="text-xl font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Exam Page for {examId}
          </h3>
          <p 
            className="text-sm mb-6"
            style={{ color: colors.textMuted }}
          >
            This is a placeholder for the actual exam content. In a real implementation, 
            you would render the exam questions, answer options, and navigation here.
          </p>
          
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitExam}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              style={{
                backgroundColor: colors.success,
                color: '#FFFFFF'
              }}
            >
              Submit Exam
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExamStarted(false)}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 ml-4"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.border}`
              }}
            >
              Back to Instructions
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
