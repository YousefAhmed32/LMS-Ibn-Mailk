import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import IntegratedExamBuilder from './IntegratedExamBuilder';
import {
  Plus,
  X,
  Save,
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  ExternalLink,
  Clock,
  Target,
  Award,
  Settings,
  Info
} from 'lucide-react';
import LuxuryButton from '../ui/LuxuryButton';

const EnhancedExamEditor = ({ 
  exam = null, 
  onSave, 
  onCancel, 
  isOpen = false 
}) => {
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  
  // State
  const [examForm, setExamForm] = useState({
    title: '',
    type: 'internal_exam',
    url: '',
    totalMarks: 0, // سيتم حسابه تلقائياً
    duration: 30,
    passingScore: 60,
    questions: [],
    migratedFromGoogleForm: false,
    migrationNote: ''
  });

  // Calculate total marks from questions
  const calculateTotalMarks = () => {
    return examForm.questions.reduce((total, question) => total + (question.points || question.marks || 1), 0);
  };

  // Initialize form when exam changes
  React.useEffect(() => {
    if (exam) {
      setExamForm({
        title: exam.title || '',
        type: exam.type || 'internal_exam',
        url: exam.url || '',
        totalMarks: exam.totalMarks || 0, // سيتم حسابه تلقائياً
        duration: exam.duration || 30,
        passingScore: exam.passingScore || 60,
        questions: exam.questions || [],
        migratedFromGoogleForm: exam.migratedFromGoogleForm || false,
        migrationNote: exam.migrationNote || ''
      });
    } else {
      setExamForm({
        title: '',
        type: 'internal_exam',
        url: '',
        totalMarks: 0, // سيتم حسابه تلقائياً
        duration: 30,
        passingScore: 60,
        questions: [],
        migratedFromGoogleForm: false,
        migrationNote: ''
      });
    }
  }, [exam]);

  // Handle exam type change
  const handleTypeChange = (newType) => {
    setExamForm(prev => ({
      ...prev,
      type: newType,
      // Reset questions for external exams
      questions: newType === 'internal_exam' ? prev.questions : [],
      // Reset URL for internal exams
      url: newType === 'internal_exam' ? '' : prev.url
    }));
  };

  // Save exam
  const handleSave = () => {
    if (!examForm.title.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الامتحان',
        variant: 'destructive'
      });
      return;
    }

    // Validate based on exam type
    if (examForm.type === 'internal_exam') {
      if (!examForm.questions || examForm.questions.length === 0) {
        toast({
          title: 'خطأ في البيانات',
          description: 'يرجى إضافة سؤال واحد على الأقل للامتحان الداخلي',
          variant: 'destructive'
        });
        return;
      }
    } else {
      if (!examForm.url.trim()) {
        toast({
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال رابط الامتحان الخارجي',
          variant: 'destructive'
        });
        return;
      }
    }

    const examData = {
      id: exam?.id || `exam_${Date.now()}`,
      ...examForm,
      totalMarks: calculateTotalMarks(), // استخدام النقاط المحسوبة تلقائياً
      totalPoints: calculateTotalMarks(), // إضافة totalPoints أيضاً
      createdAt: exam?.createdAt || new Date().toISOString()
    };

    onSave(examData);
  };

  const examTypes = [
    { 
      value: 'internal_exam', 
      label: 'امتحان داخلي', 
      icon: BookOpen,
      description: 'امتحان مع أسئلة داخلية قابلة للتعديل'
    },
    { 
      value: 'google_form', 
      label: 'Google Form', 
      icon: ExternalLink,
      description: 'رابط إلى Google Form خارجي'
    },
    { 
      value: 'external', 
      label: 'امتحان خارجي', 
      icon: ExternalLink,
      description: 'رابط إلى امتحان خارجي آخر'
    },
    { 
      value: 'link', 
      label: 'رابط عام', 
      icon: ExternalLink,
      description: 'رابط إلى أي مصدر خارجي'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-6xl h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent }}>
                  <BookOpen className="w-6 h-6" style={{ color: colors.text }} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {exam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                  </h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    إدارة الامتحانات الداخلية والخارجية
                  </p>
                </div>
              </div>
              
              <LuxuryButton
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="p-2 hover:scale-110 transition-transform"
                style={{
                  backgroundColor: colors.surfaceCard + 'CC',
                  backdropFilter: 'blur(15px)',
                  border: `2px solid ${colors.border}40`,
                  borderRadius: borderRadius.lg,
                  boxShadow: `0 8px 25px ${colors.shadow}20`
                }}
              >
                <X className="w-5 h-5" />
              </LuxuryButton>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      عنوان الامتحان *
                    </label>
                    <input
                      type="text"
                      value={examForm.title}
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="أدخل عنوان الامتحان"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      نوع الامتحان *
                    </label>
                    <select
                      value={examForm.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {examTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {examForm.type !== 'internal_exam' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        رابط الامتحان *
                      </label>
                      <input
                        type="url"
                        value={examForm.url}
                        onChange={(e) => setExamForm(prev => ({ ...prev, url: e.target.value }))}
                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="أدخل رابط الامتحان"
                      />
                    </div>
                  )}
                </div>

                {/* Exam Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      إجمالي النقاط (تلقائي)
                    </label>
                    <div className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} flex items-center justify-between`}>
                      <span className="font-semibold">{calculateTotalMarks()}</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        محسوب تلقائياً من مجموع نقاط الأسئلة
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      المدة (دقيقة)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={examForm.duration}
                      onChange={(e) => setExamForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      درجة النجاح (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={examForm.passingScore}
                      onChange={(e) => setExamForm(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 0 }))}
                      className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    />
                  </div>
                </div>

                {/* Migration Info (if applicable) */}
                {examForm.migratedFromGoogleForm && (
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-yellow-600 bg-yellow-900/20' : 'border-yellow-300 bg-yellow-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-yellow-600" />
                      <span className={`font-medium ${isDarkMode ? 'text-yellow-300' : 'text-yellow-800'}`}>
                        امتحان مهاجر من Google Form
                      </span>
                    </div>
                    {examForm.migrationNote && (
                      <p className={`text-sm ${isDarkMode ? 'text-yellow-200' : 'text-yellow-700'}`}>
                        {examForm.migrationNote}
                      </p>
                    )}
                  </div>
                )}

                {/* Internal Exam Questions */}
                {examForm.type === 'internal_exam' && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5" style={{ color: colors.accent }} />
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        أسئلة الامتحان الداخلي
                      </h3>
                    </div>
                    <IntegratedExamBuilder
                      exams={[{
                        id: 'temp_exam',
                        title: examForm.title,
                        totalMarks: examForm.totalMarks,
                        questions: examForm.questions
                      }]}
                      onExamsChange={(exams) => {
                        if (exams.length > 0) {
                          const exam = exams[0];
                          setExamForm(prev => ({
                            ...prev,
                            title: exam.title ?? prev.title,
                            totalMarks: exam.totalMarks ?? prev.totalMarks,
                            questions: exam.questions ?? []
                          }));
                        }
                      }}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}

                {/* External Exam Preview */}
                {examForm.type !== 'internal_exam' && examForm.url && (
                  <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ExternalLink className="w-5 h-5" style={{ color: colors.accent }} />
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        معاينة الامتحان الخارجي
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <a
                        href={examForm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: colors.accent + '20',
                          color: colors.accent,
                          border: `1px solid ${colors.accent}40`
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        فتح الرابط
                      </a>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {examForm.url}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {examForm.type === 'internal_exam' ? (
                    <span>
                      أسئلة: {examForm.questions.length} | إجمالي النقاط: {examForm.totalMarks}
                    </span>
                  ) : (
                    <span>
                      امتحان خارجي | المدة: {examForm.duration} دقيقة
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <LuxuryButton
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="px-6 py-2 hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: colors.surfaceCard + 'CC',
                      backdropFilter: 'blur(15px)',
                      border: `2px solid ${colors.border}40`,
                      borderRadius: borderRadius.lg,
                      boxShadow: `0 8px 25px ${colors.shadow}20`
                    }}
                  >
                    إلغاء
                  </LuxuryButton>
                  <LuxuryButton
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                      boxShadow: `0 8px 32px ${colors.accent}30`
                    }}
                  >
                    <Save className="w-4 h-4" />
                    حفظ الامتحان
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedExamEditor;
