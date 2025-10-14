import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../contexts/ThemeContext';
import { FileCheck, ExternalLink, Award, CheckCircle, AlertCircle, X, Clock, BookOpen, Play } from 'lucide-react';
import CompletionCheckbox from './CompletionCheckbox';
import EnhancedCompletionCheckbox from './EnhancedCompletionCheckbox';
import ExamResultInput from './ExamResultInput';
import useProgressTracking from '../../hooks/useProgressTracking';
import useEnhancedProgressTracking from '../../hooks/useEnhancedProgressTracking';
import useRealtimeProgressTracking from '../../hooks/useRealtimeProgressTracking';
import { toast } from '../../hooks/use-toast';
import { submitExamResult } from '../../store/slices/examResultSlice';
import axiosInstance from '../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ExamButton = ({ exams, courseTitle, courseId, className = "" }) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // State for showing grade input
  const [showGradeInput, setShowGradeInput] = useState({});
  const [gradeInputs, setGradeInputs] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState({});
  
  // Realtime progress tracking for exam completion
  const {
    markExamCompleted,
    isExamCompleted,
    updating: progressUpdating
  } = useRealtimeProgressTracking(courseId);

  const handleTakeInternalExam = (exam) => {
    // Navigate to exam page for internal exams
    navigate(`/exam/${courseId}/${exam.id}`);
  };

  const handleTakeExternalExam = (examUrl) => {
    if (examUrl) {
      // Open the exam link in a new tab
      window.open(examUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleConfirmAttendance = useCallback((examId) => {
    setShowGradeInput(prev => ({ ...prev, [examId]: true }));
    setValidationErrors(prev => ({ ...prev, [examId]: '' }));
  }, []);

  const handleCancelGradeInput = useCallback((examId) => {
    setShowGradeInput(prev => ({ ...prev, [examId]: false }));
    setGradeInputs(prev => ({ ...prev, [examId]: { score: '', totalScore: '' } }));
    setValidationErrors(prev => ({ ...prev, [examId]: '' }));
  }, []);

  const handleGradeInputChange = useCallback((examId, field, value) => {
    setGradeInputs(prev => ({
      ...prev,
      [examId]: { ...prev[examId], [field]: value }
    }));
    
    // Clear validation error when user starts typing
    setValidationErrors(prev => {
      if (prev[examId]) {
        return { ...prev, [examId]: '' };
      }
      return prev;
    });
  }, []);

  const validateGradeInputs = (examId) => {
    const inputs = gradeInputs[examId] || {};
    const { score, totalScore } = inputs;

    if (!score || !totalScore) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [examId]: 'يجب إدخال النتيجة والدرجة الكاملة' 
      }));
      return false;
    }

    const scoreNum = parseFloat(score);
    const totalScoreNum = parseFloat(totalScore);

    if (isNaN(scoreNum) || isNaN(totalScoreNum)) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [examId]: 'النتيجة والدرجة الكاملة يجب أن تكون أرقام' 
      }));
      return false;
    }

    if (scoreNum < 0 || totalScoreNum <= 0) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [examId]: 'القيم يجب أن تكون موجبة' 
      }));
      return false;
    }

    if (scoreNum > totalScoreNum) {
      setValidationErrors(prev => ({ 
        ...prev, 
        [examId]: 'النتيجة لا يمكن أن تكون أكبر من الدرجة الكاملة' 
      }));
      return false;
    }

    return true;
  };

  const handleSubmitGrade = useCallback(async (examId) => {
    if (!validateGradeInputs(examId)) {
      return;
    }

    const inputs = gradeInputs[examId];
    const scoreNum = parseFloat(inputs.score);
    const totalScoreNum = parseFloat(inputs.totalScore);
    const percentage = Math.round((scoreNum / totalScoreNum) * 100);

    // Set submitting state
    setSubmitting(prev => ({ ...prev, [examId]: true }));

    try {
      // Prepare exam data for API
      const examData = {
        courseId,
        examId,
        score: scoreNum,
        maxScore: totalScoreNum,
        notes: `نتيجة الامتحان: ${scoreNum}/${totalScoreNum} (${percentage}%)`
      };

      // Submit exam result to backend
      const result = await dispatch(submitExamResult(examData)).unwrap();
      
      // Mark exam as completed
      markExamCompleted(examId);
      
      // Show success message
      toast({
        title: "تم حفظ نتيجة الامتحان بنجاح",
        description: `نتيجتك: ${scoreNum}/${totalScoreNum} (${percentage}%)`,
        variant: "success",
        duration: 5000
      });

      // Hide grade input
      setShowGradeInput(prev => ({ ...prev, [examId]: false }));
      setGradeInputs(prev => ({ ...prev, [examId]: { score: '', totalScore: '' } }));
      setValidationErrors(prev => ({ ...prev, [examId]: '' }));

    } catch (error) {
      console.error('Error submitting exam result:', error);
      toast({
        title: "خطأ في حفظ النتيجة",
        description: error || "حدث خطأ أثناء حفظ نتيجة الامتحان. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
        duration: 5000
      });
    } finally {
      // Clear submitting state
      setSubmitting(prev => ({ ...prev, [examId]: false }));
    }
  }, [gradeInputs, dispatch, courseId, markExamCompleted]);

  if (!exams || exams.length === 0) {
    return null; // Don't render if no exams
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${className}`}
    >
      {/* Course Exams Section */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6 border-2"
        style={{
          background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}08)`,
          borderColor: colors.accent + '30',
          boxShadow: `0 8px 32px ${colors.accent}20`
        }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, ${colors.accent} 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, ${colors.accent} 0%, transparent 50%)`
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="p-3 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                boxShadow: `0 4px 16px ${colors.accent}40`
              }}
            >
              <FileCheck size={24} className="text-white" />
            </div>
            <div>
              <h3 
                className="text-xl font-bold"
                style={{ color: colors.text }}
              >
                امتحانات الدورة
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.textMuted }}
              >
                اختبر معرفتك في {courseTitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p 
            className="mb-6 text-sm leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            انقر على أي من الأزرار أدناه للانتقال إلى امتحان الدورة. سيتم فتح الامتحان في نافذة جديدة.
          </p>

          {/* Exam Buttons */}
          <div className="space-y-3">
            {exams.map((exam, index) => (
              <div key={exam.id || exam._id || index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}08)`,
                    borderColor: colors.accent + '30',
                    boxShadow: `0 4px 16px ${colors.accent}20`
                  }}
                >
                  {/* Exam Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                          boxShadow: `0 2px 8px ${colors.accent}40`
                        }}
                      >
                        {exam.type === 'internal_exam' ? (
                          <BookOpen size={16} className="text-white" />
                        ) : (
                          <ExternalLink size={16} className="text-white" />
                        )}
                      </div>
                      <div>
                        <h4 
                          className="font-semibold"
                          style={{ 
                            color: colors.text,
                            fontSize: typography.fontSize.lg
                          }}
                        >
                          {exam.title || `امتحان ${index + 1}`}
                        </h4>
                        <div className="flex items-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                          <span>{exam.type === 'internal_exam' ? 'امتحان داخلي' : 'امتحان خارجي'}</span>
                          {exam.type === 'internal_exam' && (
                            <>
                              <span>أسئلة: {exam.totalQuestions || exam.questions?.length || 0}</span>
                              <span>نقاط: {exam.totalPoints || 0}</span>
                              <span>مدة: {exam.duration || 30} دقيقة</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Enhanced Completion Checkbox */}
                    <EnhancedCompletionCheckbox
                      isCompleted={isExamCompleted(exam.id || exam._id)}
                      onToggle={() => {
                        if (isExamCompleted(exam.id || exam._id)) {
                          // Unmark as completed (if needed)
                          console.log('Unmarking exam as completed:', exam.id || exam._id);
                        } else {
                          markExamCompleted(exam.id || exam._id);
                        }
                      }}
                      disabled={progressUpdating}
                      loading={progressUpdating}
                      type="exam"
                      size="small"
                      showLabel={false}
                      onCompletion={(type) => {
                        console.log(`${type} completed with enhanced animations!`);
                      }}
                    />

                    {/* Enter Exam Button */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 8px 24px ${colors.accent}40`
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (exam.type === 'internal_exam') {
                          handleTakeInternalExam(exam);
                        } else {
                          handleTakeExternalExam(exam.url);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                        color: colors.background,
                        fontSize: typography.fontSize.sm,
                        boxShadow: `0 4px 12px ${colors.accent}30`,
                        border: 'none',
                        cursor: 'pointer',
                        minHeight: '40px'
                      }}
                    >
                      {exam.type === 'internal_exam' ? (
                        <>
                          <Play size={14} />
                          <span>بدء الامتحان</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink size={14} />
                          <span>فتح الامتحان</span>
                        </>
                      )}
                    </motion.button>

                    {/* Confirm Attendance Button */}
                    {!isExamCompleted(exam.id || exam._id) && (
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: `0 8px 24px ${colors.success}40`
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConfirmAttendance(exam.id || exam._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{
                          background: `linear-gradient(135deg, ${colors.success}, ${colors.success}CC)`,
                          color: colors.background,
                          fontSize: typography.fontSize.sm,
                          boxShadow: `0 4px 12px ${colors.success}30`,
                          border: 'none',
                          cursor: 'pointer',
                          minHeight: '40px'
                        }}
                      >
                        <span>تأكيد الحضور</span>
                        <CheckCircle size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                {/* Grade Input Form */}
                <AnimatePresence>
                  {showGradeInput[exam.id || exam._id] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 p-4 rounded-xl border-2"
                      style={{
                        background: `linear-gradient(135deg, ${colors.accent}10, ${colors.accent}05)`,
                        borderColor: colors.accent + '30',
                        boxShadow: `0 4px 16px ${colors.accent}20`
                      }}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{
                              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                              boxShadow: `0 2px 8px ${colors.accent}40`
                            }}
                          >
                            <CheckCircle size={16} className="text-white" />
                          </div>
                          <h4 
                            className="font-semibold"
                            style={{ color: colors.text }}
                          >
                            إدخال نتيجة الامتحان
                          </h4>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Score Obtained */}
                          <div>
                            <label 
                              className="block text-sm font-medium mb-2"
                              style={{ color: colors.text }}
                            >
                              النتيجة المحققة
                            </label>
                            <input
                              type="number"
                              value={gradeInputs[exam.id || exam._id]?.score || ''}
                              onChange={(e) => handleGradeInputChange(exam.id || exam._id, 'score', e.target.value)}
                              placeholder="مثال: 20"
                              min="0"
                              step="0.1"
                              className="w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              style={{
                                borderColor: colors.accent + '30',
                                backgroundColor: colors.background,
                                color: colors.text
                              }}
                            />
                          </div>

                          {/* Total Score */}
                          <div>
                            <label 
                              className="block text-sm font-medium mb-2"
                              style={{ color: colors.text }}
                            >
                              الدرجة الكاملة
                            </label>
                            <input
                              type="number"
                              value={gradeInputs[exam.id || exam._id]?.totalScore || ''}
                              onChange={(e) => handleGradeInputChange(exam.id || exam._id, 'totalScore', e.target.value)}
                              placeholder="مثال: 30"
                              min="1"
                              step="0.1"
                              className="w-full px-3 py-2 rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                              style={{
                                borderColor: colors.accent + '30',
                                backgroundColor: colors.background,
                                color: colors.text
                              }}
                            />
                          </div>
                        </div>

                        {/* Validation Error */}
                        {validationErrors[exam.id || exam._id] && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-lg border-2"
                            style={{
                              backgroundColor: colors.error + '10',
                              borderColor: colors.error + '30'
                            }}
                          >
                            <AlertCircle size={16} style={{ color: colors.error }} />
                            <span 
                              className="text-sm font-medium"
                              style={{ color: colors.error }}
                            >
                              {validationErrors[exam.id || exam._id]}
                            </span>
                          </motion.div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCancelGradeInput(exam.id || exam._id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{
                              backgroundColor: colors.background,
                              color: colors.textMuted,
                              border: `2px solid ${colors.accent}30`,
                              fontSize: typography.fontSize.sm
                            }}
                          >
                            <X size={14} />
                            <span>إلغاء</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: submitting[exam.id || exam._id] ? 1 : 1.02 }}
                            whileTap={{ scale: submitting[exam.id || exam._id] ? 1 : 0.98 }}
                            onClick={() => handleSubmitGrade(exam.id || exam._id)}
                            disabled={submitting[exam.id || exam._id]}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: `linear-gradient(135deg, ${colors.success}, ${colors.success}CC)`,
                              color: colors.background,
                              fontSize: typography.fontSize.sm,
                              boxShadow: `0 4px 12px ${colors.success}30`,
                              border: 'none',
                              cursor: submitting[exam.id || exam._id] ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {submitting[exam.id || exam._id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>جاري الحفظ...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={14} />
                                <span>حفظ النتيجة</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: colors.textMuted }}>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.success }} />
            <span>امتحانات خارجية آمنة</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExamButton;