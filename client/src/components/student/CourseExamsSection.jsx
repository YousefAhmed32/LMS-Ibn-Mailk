import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import internalExamService from '../../services/internalExamService';
import InternalExamInterface from './InternalExamInterface';
import {
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Play,
  Eye,
  Trophy,
  Target,
  Award,
  Lock,
  Users,
  Calendar
} from 'lucide-react';

const CourseExamsSection = ({ courseId, courseExams, hasAccess }) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showExamInterface, setShowExamInterface] = useState(false);

  // Load exams data
  useEffect(() => {
    if (courseId && hasAccess) {
      loadExams();
    }
  }, [courseId, hasAccess]);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const response = await internalExamService.getCourseExams(courseId);
      
      if (response.success) {
        setExams(response.exams);
      } else {
        toast({
          title: 'خطأ في تحميل الامتحانات',
          description: response.message || 'فشل في تحميل الامتحانات',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: 'خطأ في تحميل الامتحانات',
        description: 'حدث خطأ أثناء تحميل الامتحانات',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartExam = (exam) => {
    setSelectedExam(exam);
    setShowExamInterface(true);
  };

  const handleExamComplete = (result) => {
    // Refresh exams list to show updated results
    loadExams();
    setShowExamInterface(false);
    setSelectedExam(null);
  };

  const handleBackToExams = () => {
    setShowExamInterface(false);
    setSelectedExam(null);
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

  // Show exam interface
  if (showExamInterface && selectedExam) {
    return (
      <InternalExamInterface
        courseId={courseId}
        examId={selectedExam.id}
        onExamComplete={handleExamComplete}
        onBack={handleBackToExams}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: colors.textMuted }}>جاري تحميل الامتحانات...</p>
        </div>
      </div>
    );
  }

  // No access state
  if (!hasAccess) {
    return (
      <div className="text-center py-8">
        <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
          الامتحانات مقفلة
        </h3>
        <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
          يجب إكمال الدفع أولاً للوصول إلى امتحانات الدورة
        </p>
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: colors.surfaceCard,
          borderColor: colors.border 
        }}>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            🔒 Complete payment to access course exams and assessments
          </p>
        </div>
      </div>
    );
  }

  // No exams state
  if (exams.length === 0) {
    return (
      <div className="text-center py-8">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text }}>
          لا توجد امتحانات متاحة
        </h3>
        <p className="text-sm" style={{ color: colors.textMuted }}>
          لم يتم إضافة أي امتحانات لهذه الدورة بعد
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
          <BookOpen className="w-6 h-6" style={{ color: colors.accent }} />
        </div>
        <div>
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>
            امتحانات الدورة
          </h3>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {exams.length} امتحان متاح
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-xl border hover:shadow-lg transition-all duration-300"
            style={{ 
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border 
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: colors.accent + '20' }}>
                  <BookOpen className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: colors.text }}>
                    {exam.title}
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {exam.totalQuestions} سؤال
                  </p>
                </div>
              </div>
              
              {exam.isCompleted && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4" style={{ color: colors.textMuted }} />
                <span style={{ color: colors.textMuted }}>
                  إجمالي النقاط: {exam.totalMarks}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" style={{ color: colors.textMuted }} />
                <span style={{ color: colors.textMuted }}>
                  {new Date(exam.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>

            {/* Exam Result */}
            {exam.isCompleted && exam.result && (
              <div className="mb-4 p-3 rounded-lg border" style={{ 
                backgroundColor: colors.surface,
                borderColor: colors.border 
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    النتيجة
                  </span>
                  <div className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(exam.result.grade)}`}>
                    {exam.result.grade}
                  </div>
                </div>
                <div className="text-sm" style={{ color: colors.textMuted }}>
                  {exam.result.score}/{exam.result.maxScore} ({exam.result.percentage}%)
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="flex gap-2">
              {exam.isCompleted ? (
                <button
                  onClick={() => handleStartExam(exam)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <Eye className="w-4 h-4" />
                  عرض النتيجة
                </button>
              ) : (
                <button
                  onClick={() => handleStartExam(exam)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.background
                  }}
                >
                  <Play className="w-4 h-4" />
                  بدء الامتحان
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CourseExamsSection;
