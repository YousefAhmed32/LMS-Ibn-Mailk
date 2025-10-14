import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X,
  BookOpen,
  CheckCircle,
  AlertCircle,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';

const IntegratedExamBuilder = ({ exams = [], onExamsChange, isDarkMode }) => {
  const { colors, spacing, borderRadius, typography, shadows } = useTheme();
  
  // State
  const [showExamBuilder, setShowExamBuilder] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [expandedExam, setExpandedExam] = useState(null);
  
  // Exam form state
  const [examForm, setExamForm] = useState({
    title: '',
    totalMarks: 0, // سيتم حسابه تلقائياً
    questions: []
  });

  // Question types
  const questionTypes = [
    { value: 'mcq', label: 'اختيار من متعدد', icon: CheckCircle },
    { value: 'true_false', label: 'صح أو خطأ', icon: AlertCircle },
    { value: 'essay', label: 'مقالي', icon: FileText }
  ];

  // Add new question
  const addQuestion = (type = 'mcq') => {
    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questionText: '',
      type: type,
      options: type === 'mcq' ? [
        { id: `opt_${Date.now()}_1`, text: '' },
        { id: `opt_${Date.now()}_2`, text: '' }
      ] : [],
      correctAnswer: type === 'true_false' ? true : (type === 'mcq' ? '' : ''),
      marks: 10,
      order: examForm.questions.length + 1
    };
    
    setExamForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  // Update question
  const updateQuestion = (questionId, field, value) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }));
  };

  // Add option to MCQ
  const addOption = (questionId) => {
    const question = examForm.questions.find(q => q.id === questionId);
    const newOption = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: ''
    };
    
    updateQuestion(questionId, 'options', [...question.options, newOption]);
  };

  // Remove option from MCQ
  const removeOption = (questionId, optionIndex) => {
    const question = examForm.questions.find(q => q.id === questionId);
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionId, 'options', newOptions);
    
    // If correct answer was the removed option, clear it
    if (question.correctAnswer === question.options[optionIndex].id) {
      updateQuestion(questionId, 'correctAnswer', '');
    }
  };

  // Update option text
  const updateOption = (questionId, optionIndex, text) => {
    const question = examForm.questions.find(q => q.id === questionId);
    const newOptions = question.options.map((opt, i) => 
      i === optionIndex ? { ...opt, text } : opt
    );
    updateQuestion(questionId, 'options', newOptions);
  };

  // Remove question
  const removeQuestion = (questionId) => {
    setExamForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
        .map((q, i) => ({ ...q, order: i + 1 }))
    }));
  };

  // Duplicate question
  const duplicateQuestion = (questionId) => {
    const question = examForm.questions.find(q => q.id === questionId);
    const duplicatedQuestion = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      order: examForm.questions.length + 1,
      questionText: `${question.questionText} (نسخة)`,
      options: question.options.map(opt => ({
        ...opt,
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    };
    
    setExamForm(prev => ({
      ...prev,
      questions: [...prev.questions, duplicatedQuestion]
    }));
  };

  // Save exam
  const saveExam = () => {
    if (!examForm.title.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الامتحان',
        variant: 'destructive'
      });
      return;
    }
    
    if (examForm.questions.length === 0) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إضافة سؤال واحد على الأقل',
        variant: 'destructive'
      });
      return;
    }
    
    // Validate questions
    for (let i = 0; i < examForm.questions.length; i++) {
      const question = examForm.questions[i];
      
      if (!question.questionText.trim()) {
        toast({
          title: 'خطأ في البيانات',
          description: `يرجى إدخال نص السؤال ${i + 1}`,
          variant: 'destructive'
        });
        return;
      }
      
      if (question.type === 'mcq') {
        if (question.options.length < 2) {
          toast({
            title: 'خطأ في البيانات',
            description: `السؤال ${i + 1} يجب أن يحتوي على خيارين على الأقل`,
            variant: 'destructive'
          });
          return;
        }
        
        if (!question.correctAnswer) {
          toast({
            title: 'خطأ في البيانات',
            description: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}`,
            variant: 'destructive'
          });
          return;
        }
      }
    }
    
    const examData = {
      id: editingExam?.id || `exam_${Date.now()}`,
      title: examForm.title,
      type: 'internal_exam',
      totalMarks: calculateTotalMarks(), // استخدام النقاط المحسوبة تلقائياً
      totalPoints: calculateTotalMarks(), // إضافة totalPoints أيضاً
      duration: 30,
      passingScore: 60,
      questions: examForm.questions,
      migratedFromGoogleForm: false,
      migrationNote: '',
      createdAt: editingExam?.createdAt || new Date().toISOString()
    };
    
    let updatedExams;
    if (editingExam) {
      updatedExams = exams.map(exam => 
        exam.id === editingExam.id ? examData : exam
      );
    } else {
      updatedExams = [...exams, examData];
    }
    
    onExamsChange(updatedExams);
    
    toast({
      title: 'تم حفظ الامتحان',
      description: editingExam ? 'تم تحديث الامتحان بنجاح' : 'تم إضافة الامتحان بنجاح'
    });
    
    // Reset form
    setExamForm({
      title: '',
      totalMarks: 0, // سيتم حسابه تلقائياً
      questions: []
    });
    setShowExamBuilder(false);
    setEditingExam(null);
  };

  // Edit exam
  const editExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      totalMarks: exam.totalMarks,
      questions: exam.questions
    });
    setShowExamBuilder(true);
  };

  // Delete exam
  const deleteExam = (examId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      const updatedExams = exams.filter(exam => exam.id !== examId);
      onExamsChange(updatedExams);
      
      toast({
        title: 'تم حذف الامتحان',
        description: 'تم حذف الامتحان بنجاح'
      });
    }
  };

  // Calculate total marks
  const calculateTotalMarks = () => {
    return examForm.questions.reduce((total, question) => total + question.marks, 0);
  };

  return (
    <div className="space-y-4">
      {/* Exams List */}
      <div className="space-y-3">
        {exams.map((exam, index) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.accent }}>
                  <BookOpen className="w-5 h-5" style={{ color: colors.text }} />
                </div>
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {exam.title}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{exam.questions.length} سؤال</span>
                    <span>{exam.totalPoints || calculateTotalMarks()} نقطة</span>
                    <span>{exam.totalMarks} علامة</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  {expandedExam === exam.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                <button
                  type="button"
                  onClick={() => editExam(exam)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                
                <button
                  type="button"
                  onClick={() => deleteExam(exam.id)}
                  className={`p-2 rounded-lg hover:bg-red-100 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Expanded Exam Details */}
            <AnimatePresence>
              {expandedExam === exam.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-3">
                      {exam.questions.map((question, qIndex) => (
                        <div key={question.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: colors.accent, color: colors.text }}>
                              {qIndex + 1}
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {question.questionText}
                              </p>
                              <div className="mt-2">
                                {question.type === 'mcq' && (
                                  <div className="space-y-1">
                                    {question.options.map((option, optIndex) => (
                                      <div key={option.id} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full border-2" style={{
                                          borderColor: question.correctAnswer === option.id ? colors.borderAccent : (isDarkMode ? '#4B5563' : '#D1D5DB'),
                                          backgroundColor: question.correctAnswer === option.id ? colors.accent : 'transparent'
                                        }}></div>
                                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                          {option.text}
                                        </span>
                                        {question.correctAnswer === option.id && (
                                          <CheckCircle className="w-3 h-3 text-green-500" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {question.type === 'true_false' && (
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full border-2" style={{
                                      borderColor: question.correctAnswer ? colors.borderAccent : (isDarkMode ? '#4B5563' : '#D1D5DB'),
                                      backgroundColor: question.correctAnswer ? colors.accent : 'transparent'
                                    }}></div>
                                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                      {question.correctAnswer ? 'صح' : 'خطأ'}
                                    </span>
                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                  </div>
                                )}
                                
                                {question.type === 'essay' && (
                                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    سؤال مقالي - يحتاج تصحيح يدوي
                                  </div>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                {question.marks} نقطة
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Add Exam Button */}
      <button
        type="button"
        onClick={() => {
          setEditingExam(null);
          setExamForm({
            title: '',
            totalMarks: 0, // سيتم حسابه تلقائياً
            questions: []
          });
          setShowExamBuilder(true);
        }}
        className="w-full flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed transition-all duration-300 hover:scale-105 hover:shadow-lg"
        style={{
          borderColor: colors.accent + '60',
          backgroundColor: colors.accent + '10',
          color: colors.accent
        }}
      >
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
          <Plus className="w-6 h-6" />
        </div>
        <div className="text-center">
          <span className="font-bold text-lg block">إضافة امتحان جديد</span>
          <span className="text-sm opacity-75">أنشئ امتحاناً مع أسئلة متعددة</span>
        </div>
      </button>

      {/* Exam Builder Modal */}
      <AnimatePresence>
        {showExamBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`w-full max-w-4xl h-[90vh] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent }}>
                    <BookOpen className="w-6 h-6" style={{ color: colors.text }} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {editingExam ? 'تعديل الامتحان' : 'إنشاء امتحان جديد'}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      أضف الأسئلة والإجابات للامتحان
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowExamBuilder(false)}
                  className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Exam Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      عنوان الامتحان * .
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
                      إجمالي النقاط (تلقائي)
                    </label>
                    <div className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'} flex items-center justify-between`}>
                      <span className="font-semibold">{calculateTotalMarks()}</span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        محسوب تلقائياً من مجموع نقاط الأسئلة
                      </span>
                    </div>
                  </div>
                </div>

                {/* Questions Section */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      الأسئلة ({examForm.questions.length})
                    </h3>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => addQuestion('mcq')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        اختيار من متعدد
                      </button>
                      <button
                        type="button"
                        onClick={() => addQuestion('true_false')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: '#10B981',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        صح وخطأ
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4">
                    {examForm.questions.map((question, index) => (
                      <div key={question.id} className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: colors.accent, color: colors.text }}>
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            {/* Question Text */}
                            <div className="mb-4">
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                نص السؤال *
                              </label>
                              <textarea
                                value={question.questionText}
                                onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                                placeholder="أدخل نص السؤال هنا..."
                              />
                            </div>

                            {/* MCQ Options */}
                            {question.type === 'mcq' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                  <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    الخيارات *
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => addOption(question.id)}
                                    className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ backgroundColor: colors.accent, color: colors.text }}
                                  >
                                    <Plus className="w-3 h-3" />
                                    إضافة خيار
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  {question.options.map((option, optIndex) => (
                                    <div key={option.id} className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200" style={{
                                      borderColor: question.correctAnswer === option.id ? '#10B981' : (isDarkMode ? '#4B5563' : '#D1D5DB'),
                                      backgroundColor: question.correctAnswer === option.id ? '#F0FDF4' : (isDarkMode ? '#374151' : '#F9FAFB')
                                    }}>
                                      <div 
                                        className="w-6 h-6 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
                                        style={{
                                          borderColor: question.correctAnswer === option.id ? '#10B981' : (isDarkMode ? '#6B7280' : '#9CA3AF'),
                                          backgroundColor: question.correctAnswer === option.id ? '#10B981' : 'transparent'
                                        }}
                                        onClick={() => updateQuestion(question.id, 'correctAnswer', option.id)}
                                      >
                                        {question.correctAnswer === option.id && (
                                          <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                          question.correctAnswer === option.id 
                                            ? 'border-green-300 bg-green-50' 
                                            : (isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900')
                                        }`}
                                        placeholder={`الخيار ${optIndex + 1}`}
                                        style={{
                                          color: question.correctAnswer === option.id ? '#065F46' : (isDarkMode ? '#F9FAFB' : '#111827')
                                        }}
                                      />
                                      {question.correctAnswer === option.id && (
                                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                                          <CheckCircle className="w-3 h-3" />
                                          صحيح
                                        </div>
                                      )}
                                      {question.options.length > 2 && (
                                        <button
                                          type="button"
                                          onClick={() => removeOption(question.id, optIndex)}
                                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-all duration-200 hover:scale-110"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* True/False Options */}
                            {question.type === 'true_false' && (
                              <div className="mb-4">
                                <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  الإجابة الصحيحة *
                                </label>
                                <div className="flex gap-4">
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(question.id, 'correctAnswer', true)}
                                    className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105" style={{
                                      backgroundColor: question.correctAnswer === true ? '#10B981' : 'transparent',
                                      color: question.correctAnswer === true ? 'white' : (isDarkMode ? '#D1D5DB' : '#4B5563'),
                                      borderColor: question.correctAnswer === true ? '#10B981' : (isDarkMode ? '#4B5563' : '#D1D5DB'),
                                      boxShadow: question.correctAnswer === true ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                                    }}
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="font-medium">صح</span>
                                    {question.correctAnswer === true && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => updateQuestion(question.id, 'correctAnswer', false)}
                                    className="flex items-center gap-3 px-6 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105" style={{
                                      backgroundColor: question.correctAnswer === false ? '#EF4444' : 'transparent',
                                      color: question.correctAnswer === false ? 'white' : (isDarkMode ? '#D1D5DB' : '#4B5563'),
                                      borderColor: question.correctAnswer === false ? '#EF4444' : (isDarkMode ? '#4B5563' : '#D1D5DB'),
                                      boxShadow: question.correctAnswer === false ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
                                    }}
                                  >
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-medium">خطأ</span>
                                    {question.correctAnswer === false && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Essay Question */}
                            {question.type === 'essay' && (
                              <div className="mb-4">
                                <div className={`p-4 rounded-lg border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    سؤال مقالي - يحتاج تصحيح يدوي
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Question Actions */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  النقاط:
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={question.marks}
                                  onChange={(e) => updateQuestion(question.id, 'marks', parseInt(e.target.value) || 10)}
                                  className={`w-20 px-2 py-1 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => duplicateQuestion(question.id)}
                                  className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(question.id)}
                                  className={`p-1 rounded hover:bg-red-100 text-red-600 dark:hover:bg-red-900/20 dark:text-red-400`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-6 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center justify-between">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    إجمالي الأسئلة: {examForm.questions.length} | إجمالي النقاط: {calculateTotalMarks()}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowExamBuilder(false)}
                      className="px-6 py-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 font-medium" 
                      style={{
                        borderColor: isDarkMode ? '#6B7280' : '#D1D5DB',
                        color: isDarkMode ? '#D1D5DB' : '#4B5563',
                        backgroundColor: 'transparent'
                      }}
                    >
                      إلغاء
                    </button>
                    <button
                      type="button"
                      onClick={saveExam}
                      disabled={examForm.questions.length === 0}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
                      style={{ 
                        backgroundColor: colors.accent, 
                        color: colors.text,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <Save className="w-4 h-4" />
                      حفظ الامتحان
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntegratedExamBuilder;

