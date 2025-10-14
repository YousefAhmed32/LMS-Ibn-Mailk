import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Button from '../ui/button';
import Input from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { 
  Plus, 
  X, 
  Trash2, 
  Edit, 
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

const ExamManagement = ({ courseId, exams = [], onExamsChange, isEditing = false }) => {
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    duration: 30,
    passingScore: 60,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'multiple_choice',
    points: 1,
    correctAnswer: true,
    options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }],
    sampleAnswer: ''
  });

  const handleAddExam = () => {
    setEditingExam(null);
    setExamForm({
      title: '',
      description: '',
      duration: 30,
      passingScore: 60,
      questions: []
    });
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      correctAnswer: true,
      options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }],
      sampleAnswer: ''
    });
    setShowAddExamModal(true);
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      title: exam.title,
      description: exam.description || '',
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      questions: exam.questions || []
    });
    setShowAddExamModal(true);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('يرجى إدخال نص السؤال');
      return;
    }

    if (currentQuestion.questionType === 'multiple_choice') {
      const validOptions = currentQuestion.options.filter(opt => opt.optionText.trim());
      if (validOptions.length < 2) {
        alert('يرجى إدخال خيارين على الأقل');
        return;
      }
      const correctOptions = validOptions.filter(opt => opt.isCorrect);
      if (correctOptions.length === 0) {
        alert('يرجى تحديد إجابة صحيحة واحدة على الأقل');
        return;
      }
    }

    const newQuestion = {
      ...currentQuestion,
      options: currentQuestion.questionType === 'multiple_choice' 
        ? currentQuestion.options.filter(opt => opt.optionText.trim())
        : []
    };

    setExamForm({
      ...examForm,
      questions: [...examForm.questions, newQuestion]
    });

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      questionType: 'multiple_choice',
      points: 1,
      correctAnswer: true,
      options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }],
      sampleAnswer: ''
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = examForm.questions.filter((_, i) => i !== index);
    setExamForm({
      ...examForm,
      questions: updatedQuestions
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { optionText: '', isCorrect: false }]
    });
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = currentQuestion.options.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    );
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const handleSaveExam = () => {
    if (!examForm.title.trim()) {
      alert('يرجى إدخال عنوان الامتحان');
      return;
    }

    if (examForm.questions.length === 0) {
      alert('يرجى إضافة سؤال واحد على الأقل');
      return;
    }

    const examData = {
      ...examForm,
      id: editingExam ? editingExam._id : Date.now().toString()
    };

    if (editingExam) {
      // Update existing exam
      const updatedExams = exams.map(exam => 
        exam._id === editingExam._id ? examData : exam
      );
      onExamsChange(updatedExams);
    } else {
      // Add new exam
      onExamsChange([...exams, examData]);
    }

    setShowAddExamModal(false);
    setEditingExam(null);
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      const updatedExams = exams.filter(exam => exam._id !== examId);
      onExamsChange(updatedExams);
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'true_false': return 'صح/خطأ';
      case 'multiple_choice': return 'اختيار من متعدد';
      case 'essay': return 'مقالي';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Exams Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          إدارة الامتحانات
        </h3>
        <Button 
          onClick={handleAddExam}
          className="flex items-center gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          إضافة امتحان
        </Button>
      </div>

      {/* Exams List */}
      <div className="space-y-3">
        <AnimatePresence>
          {exams.map((exam, index) => (
            <motion.div
              key={exam._id || exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {exam.title}
                      </h4>
                      {exam.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {exam.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.duration} دقيقة
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {exam.passingScore}% للنجاح
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {exam.questions?.length || 0} سؤال
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditExam(exam)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteExam(exam._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {exams.length === 0 && (
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                لا توجد امتحانات مضافة لهذه الدورة
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Exam Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingExam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddExamModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Exam Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    عنوان الامتحان *
                  </label>
                  <Input
                    value={examForm.title}
                    onChange={(e) => setExamForm({...examForm, title: e.target.value})}
                    placeholder="أدخل عنوان الامتحان"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المدة (دقيقة)
                  </label>
                  <Input
                    type="number"
                    value={examForm.duration}
                    onChange={(e) => setExamForm({...examForm, duration: parseInt(e.target.value) || 30})}
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    درجة النجاح (%)
                  </label>
                  <Input
                    type="number"
                    value={examForm.passingScore}
                    onChange={(e) => setExamForm({...examForm, passingScore: parseInt(e.target.value) || 60})}
                    placeholder="60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  وصف الامتحان
                </label>
                <Textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({...examForm, description: e.target.value})}
                  placeholder="أدخل وصف الامتحان..."
                  rows={3}
                />
              </div>

              {/* Add Question Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">إضافة سؤال جديد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نص السؤال *
                    </label>
                    <Textarea
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, questionText: e.target.value})}
                      placeholder="أدخل نص السؤال..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        نوع السؤال *
                      </label>
                      <Select 
                        value={currentQuestion.questionType} 
                        onValueChange={(value) => setCurrentQuestion({...currentQuestion, questionType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">اختيار من متعدد</SelectItem>
                          <SelectItem value="true_false">صح/خطأ</SelectItem>
                          <SelectItem value="essay">مقالي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        النقاط
                      </label>
                      <Input
                        type="number"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Question Type Specific Fields */}
                  {currentQuestion.questionType === 'true_false' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        الإجابة الصحيحة
                      </label>
                      <Select 
                        value={currentQuestion.correctAnswer.toString()} 
                        onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value === 'true'})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">صح</SelectItem>
                          <SelectItem value="false">خطأ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {currentQuestion.questionType === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        الخيارات *
                      </label>
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={option.optionText}
                              onChange={(e) => handleOptionChange(index, 'optionText', e.target.value)}
                              placeholder={`الخيار ${index + 1}`}
                              className="flex-1"
                            />
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                              />
                              <span className="text-sm">صحيح</span>
                            </label>
                            {currentQuestion.options.length > 2 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveOption(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAddOption}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          إضافة خيار
                        </Button>
                      </div>
                    </div>
                  )}

                  {currentQuestion.questionType === 'essay' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        إجابة نموذجية (اختياري)
                      </label>
                      <Textarea
                        value={currentQuestion.sampleAnswer}
                        onChange={(e) => setCurrentQuestion({...currentQuestion, sampleAnswer: e.target.value})}
                        placeholder="أدخل إجابة نموذجية..."
                        rows={4}
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleAddQuestion}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة السؤال
                  </Button>
                </CardContent>
              </Card>

              {/* Questions List */}
              {examForm.questions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">أسئلة الامتحان ({examForm.questions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {examForm.questions.map((question, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-500">
                                  السؤال {index + 1}
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {getQuestionTypeLabel(question.questionType)}
                                </span>
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {question.points} نقطة
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white mb-2">
                                {question.questionText}
                              </p>
                              {question.questionType === 'multiple_choice' && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {question.options.map((opt, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                      <span>{optIndex + 1}.</span>
                                      <span>{opt.optionText}</span>
                                      {opt.isCorrect && (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {question.questionType === 'true_false' && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  الإجابة الصحيحة: {question.correctAnswer ? 'صح' : 'خطأ'}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Save Exam Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddExamModal(false)}
                >
                  إلغاء
                </Button>
                <Button onClick={handleSaveExam}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingExam ? 'تحديث الامتحان' : 'حفظ الامتحان'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagement;
