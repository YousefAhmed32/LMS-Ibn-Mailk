import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from '../../hooks/use-toast';
import { 
  submitExamResult, 
  selectExamResultSubmitting, 
  selectExamResultError,
  selectExamResultSuccess,
  clearError,
  clearSuccess,
  selectExamResultByExamId
} from '../../store/slices/examResultSlice';
import { 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  Trophy,
  Target,
  TrendingUp
} from 'lucide-react';

const ExamResultInput = ({ 
  exam, 
  courseId, 
  onResultSubmitted,
  className = "" 
}) => {
  const dispatch = useDispatch();
  const submitting = useSelector(selectExamResultSubmitting);
  const error = useSelector(selectExamResultError);
  const success = useSelector(selectExamResultSuccess);
  const existingResult = useSelector(selectExamResultByExamId(exam.id));

  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState('');

  // Initialize form with existing result if available
  useEffect(() => {
    if (existingResult) {
      setScore(existingResult.score.toString());
      setMaxScore(existingResult.maxScore.toString());
      setNotes(existingResult.notes || '');
    }
  }, [existingResult]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      toast({
        title: "تم حفظ النتيجة بنجاح",
        description: success,
        variant: "success"
      });
      dispatch(clearSuccess());
      setIsEditing(false);
      if (onResultSubmitted) {
        onResultSubmitted();
      }
    }
    
    if (error) {
      toast({
        title: "خطأ في حفظ النتيجة",
        description: error,
        variant: "destructive"
      });
      dispatch(clearError());
    }
  }, [success, error, dispatch, onResultSubmitted]);

  const validateInput = () => {
    setValidationError('');
    
    if (!score.trim() || !maxScore.trim()) {
      setValidationError('يرجى إدخال النتيجة والدرجة الكاملة');
      return false;
    }

    const scoreNum = parseFloat(score);
    const maxScoreNum = parseFloat(maxScore);

    if (isNaN(scoreNum) || isNaN(maxScoreNum)) {
      setValidationError('النتيجة والدرجة الكاملة يجب أن تكون أرقام');
      return false;
    }

    if (scoreNum < 0 || maxScoreNum <= 0) {
      setValidationError('القيم يجب أن تكون موجبة');
      return false;
    }

    if (scoreNum > maxScoreNum) {
      setValidationError('النتيجة لا يمكن أن تكون أكبر من الدرجة الكاملة');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }

    const examData = {
      courseId,
      examId: exam.id,
      score: parseFloat(score),
      maxScore: parseFloat(maxScore),
      notes: notes.trim()
    };

    try {
      await dispatch(submitExamResult(examData)).unwrap();
    } catch (error) {
      console.error('Error submitting exam result:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setValidationError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationError('');
    
    // Reset to existing values
    if (existingResult) {
      setScore(existingResult.score.toString());
      setMaxScore(existingResult.maxScore.toString());
      setNotes(existingResult.notes || '');
    } else {
      setScore('');
      setMaxScore('');
      setNotes('');
    }
  };

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

  const getLevelColor = (level) => {
    const colors = {
      'Excellent': 'text-green-600',
      'Very Good': 'text-blue-600',
      'Good': 'text-blue-500',
      'Average': 'text-yellow-600',
      'Below Average': 'text-orange-600',
      'Poor': 'text-red-600'
    };
    return colors[level] || 'text-gray-600';
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="p-6">
        {/* Exam Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {exam.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {exam.url && (
                <a 
                  href={exam.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  رابط الامتحان
                </a>
              )}
            </p>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            {existingResult ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-50 border border-green-200"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">مكتمل</span>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                <Target className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">في الانتظار</span>
              </div>
            )}
          </div>
        </div>

        {/* Existing Result Display */}
        {existingResult && !isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Score */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {existingResult.formattedScore}
                </div>
                <div className="text-sm text-gray-600">النتيجة</div>
              </div>
              
              {/* Percentage */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {existingResult.percentage}%
                </div>
                <div className="text-sm text-gray-600">النسبة المئوية</div>
              </div>
              
              {/* Grade */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGradeColor(existingResult.grade).split(' ')[0]}`}>
                  {existingResult.grade}
                </div>
                <div className="text-sm text-gray-600">التقدير</div>
              </div>
            </div>
            
            {/* Level */}
            <div className="mt-3 text-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(existingResult.grade)}`}>
                <Trophy className="w-4 h-4 mr-1" />
                {existingResult.level}
              </span>
            </div>
            
            {/* Notes */}
            {existingResult.notes && (
              <div className="mt-3 p-3 bg-white rounded-lg border">
                <div className="text-sm font-medium text-gray-700 mb-1">ملاحظات:</div>
                <div className="text-sm text-gray-600">{existingResult.notes}</div>
              </div>
            )}
          </motion.div>
        )}

        {/* Input Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Score Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النتيجة
                  </label>
                  <input
                    type="number"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="مثال: 20"
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدرجة الكاملة
                  </label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    placeholder="مثال: 30"
                    min="1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Notes Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              {/* Validation Error */}
              {validationError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-700">{validationError}</span>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  إلغاء
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      حفظ النتيجة
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Action Button */}
        {!isEditing && (
          <div className="flex items-center justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleEdit}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>{existingResult ? 'تعديل النتيجة' : 'إدخال النتيجة'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamResultInput;

