import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
  FileText,
  Upload,
  Image,
  X,
  AlertCircle,
  FileCheck,
  Play,
  ExternalLink,
  Clock,
  DollarSign,
  BookOpen,
  Settings
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import IntegratedExamBuilder from '../../components/admin/IntegratedExamBuilder';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // Main state
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    price: 0,
    imageUrl: ''
  });
  
  // Videos and exams state
  const [videos, setVideos] = useState([]);
  const [exams, setExams] = useState([]);
  
  // Modal states
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  
  // New video form
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0,
    thumbnail: ''
  });

  /**
   * Normalize and clean exam data before sending to server
   * This ensures consistent data structure and fixes common issues:
   * - Converts true_false correctAnswer from index (0/1) to boolean
   * - Ensures options are strings, not objects
   * - Validates and cleans all question fields
   */
  const normalizeExamData = (exam) => {
    if (!exam || exam.type !== 'internal_exam' || !exam.questions) {
      return exam;
    }

    const normalizedQuestions = exam.questions.map((question, qIndex) => {
      // Clean question text
      const questionText = question.questionText 
        ? String(question.questionText).trim() 
        : '';

      // Options: prefer builder format (choices with id, text) for MCQ so option ids are stable
      let normalizedOptions = [];
      let correctAnswersArray = null;

      if (question.type === 'multiple_choice' || question.type === 'mcq') {
        if (question.choices && Array.isArray(question.choices)) {
          normalizedOptions = question.choices
            .map(c => ({ id: c.id, text: String(c.text || '').trim() }))
            .filter(opt => opt.text.length > 0);
          const correctIds = question.choices.filter(c => c.isCorrect).map(c => c.id);
          if (correctIds.length > 0) correctAnswersArray = correctIds;
        }
        if (normalizedOptions.length === 0 && question.options && Array.isArray(question.options)) {
          normalizedOptions = question.options.map((opt, optIndex) => {
            if (typeof opt === 'object' && opt !== null) {
              return { id: opt.id ?? optIndex, text: String(opt.text || opt.optionText || opt.value || '').trim() };
            }
            return { id: optIndex, text: String(opt).trim() };
          }).filter(opt => opt.text.length > 0);
        }
      } else if (question.options && Array.isArray(question.options)) {
        normalizedOptions = question.options.map((opt, optIndex) => {
          if (typeof opt === 'object' && opt !== null) {
            return String(opt.text || opt.optionText || opt.value || '').trim();
          }
          return String(opt).trim();
        }).filter(opt => opt.length > 0);
      }

      // Normalize correctAnswer based on question type
      let normalizedCorrectAnswer = question.correctAnswer;

      if (question.type === 'true_false') {
        if (typeof normalizedCorrectAnswer === 'number') {
          normalizedCorrectAnswer = normalizedCorrectAnswer === 0;
        } else if (typeof normalizedCorrectAnswer === 'string') {
          normalizedCorrectAnswer = normalizedCorrectAnswer === 'true' || 
                                     normalizedCorrectAnswer === 'صحيح' ||
                                     normalizedCorrectAnswer === '0';
        } else if (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined) {
          normalizedCorrectAnswer = false;
        }
        normalizedCorrectAnswer = Boolean(normalizedCorrectAnswer);
      } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
        if (correctAnswersArray && correctAnswersArray.length === 1) {
          normalizedCorrectAnswer = correctAnswersArray[0];
        } else if (correctAnswersArray == null && (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined)) {
          normalizedCorrectAnswer = null;
        } else if (correctAnswersArray == null && typeof normalizedCorrectAnswer === 'number') {
          // keep as index
        } else if (correctAnswersArray == null && typeof normalizedCorrectAnswer === 'string') {
          normalizedCorrectAnswer = normalizedCorrectAnswer.trim();
        }
      }

      const points = Math.max(1, parseInt(question.points || question.marks || 1) || 1);

      const out = {
        id: question.id || `q_${Date.now()}_${qIndex}`,
        questionText,
        type: question.type || 'multiple_choice',
        options: normalizedOptions,
        correctAnswer: normalizedCorrectAnswer,
        points,
        ...(question.sampleAnswer && { sampleAnswer: question.sampleAnswer }),
        ...(question.explanation && { explanation: question.explanation }),
        ...(question.order !== undefined && { order: question.order })
      };
      if (correctAnswersArray != null) out.correctAnswers = correctAnswersArray;
      return out;
    });

    return {
      ...exam,
      questions: normalizedQuestions
    };
  };

  /**
   * Convert correctAnswer from server format to UI display format
   * - For true_false: boolean -> index (true = 0, false = 1)
   * - For multiple_choice: string -> index (find matching option)
   * - For multiple_choice: number -> keep as is
   */
  const convertCorrectAnswerForDisplay = (question) => {
    if (!question || question.correctAnswer === null || question.correctAnswer === undefined) {
      return null;
    }

    if (question.type === 'true_false') {
      // Convert boolean to index: true (صحيح) = 0, false (خطأ) = 1
      if (typeof question.correctAnswer === 'boolean') {
        return question.correctAnswer ? 0 : 1;
      }
      // If it's already a number, return it
      if (typeof question.correctAnswer === 'number') {
        return question.correctAnswer;
      }
      // If it's a string, try to convert
      if (typeof question.correctAnswer === 'string') {
        return question.correctAnswer === 'true' || question.correctAnswer === 'صحيح' ? 0 : 1;
      }
      return null;
    } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
      // If it's already a number (index), return it
      if (typeof question.correctAnswer === 'number') {
        return question.correctAnswer;
      }
      // If it's a string, find the matching option index
      if (typeof question.correctAnswer === 'string' && question.options) {
        const correctAnswerText = question.correctAnswer.trim();
        const index = question.options.findIndex(opt => {
          const optText = typeof opt === 'string' ? opt : (opt.text || opt.optionText || '');
          return String(optText).trim() === correctAnswerText;
        });
        return index >= 0 ? index : null;
      }
      return null;
    }

    return question.correctAnswer;
  };

  // Fetch course data on component mount
  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching course data for ID:', id);
      
      const response = await axiosInstance.get(`/api/admin/courses/${id}`);
      console.log('📥 Course fetch response:', response.data);
      
      if (response.data.success) {
        // Handle nested data structure from admin route
        const courseData = response.data.data?.course || response.data.data || response.data;
        console.log('📋 Course data:', courseData);
        
        setCourse(courseData);
        
        // Pre-fill form with existing data
        setCourseForm({
          title: courseData.title || '',
          description: courseData.description || '',
          subject: courseData.subject || '',
          grade: courseData.grade || '',
          price: courseData.price || 0,
          imageUrl: courseData.imageUrl || ''
        });
        
        // Load videos and exams with proper initialization
        const videosData = courseData.videos || [];
        let examsData = courseData.exams || [];
        
        // Normalize exams data when loading from server
        // This fixes issues with options being objects instead of strings
        // AND converts correctAnswer to display format (index) for UI
        examsData = examsData.map(exam => {
          if (exam.type === 'internal_exam' && exam.questions) {
            const normalizedQuestions = exam.questions.map((q, qIdx) => {
              // Keep options as { id, text } for MCQ so builder and grading can use stable ids
              let normalizedOptions = [];
              if (q.options && Array.isArray(q.options)) {
                normalizedOptions = q.options.map((opt, optIdx) => {
                  if (typeof opt === 'object' && opt !== null) {
                    const text = String(opt.text || opt.optionText || opt.value || '').trim();
                    return { id: opt.id ?? optIdx, text };
                  }
                  return { id: optIdx, text: String(opt).trim() };
                }).filter(opt => opt.text.length > 0);
              }
              const displayCorrectAnswer = convertCorrectAnswerForDisplay({
                ...q,
                options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || [])
              });
              return {
                ...q,
                options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || []),
                correctAnswer: displayCorrectAnswer,
                ...(Array.isArray(q.correctAnswers) && q.correctAnswers.length > 0 && { correctAnswers: q.correctAnswers })
              };
            });
            return { ...exam, questions: normalizedQuestions };
          }
          return exam;
        });
        
        console.log('🎥 Videos loaded:', videosData);
        console.log('📝 Exams loaded:', examsData);
        
        setVideos(videosData);
        setExams(examsData);
        
        toast({
          title: 'تم تحميل بيانات الدورة',
          description: `تم تحميل ${videosData.length} فيديو و ${examsData.length} امتحان`,
          variant: 'success',
          duration: 3000
        });
      } else {
        throw new Error(response.data.message || 'Failed to fetch course data');
      }
    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      toast({
        title: 'خطأ في تحميل بيانات الدورة',
        description: error.response?.data?.message || 'فشل في تحميل بيانات الدورة',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseForm(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  // Video management functions
  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الفيديو والرابط',
        variant: 'destructive'
      });
      return;
    }

    const videoToAdd = {
      ...newVideo,
      id: `video_${Date.now()}`,
      order: videos.length,
      duration: parseInt(newVideo.duration) || 0
    };

    setVideos(prev => [...prev, videoToAdd]);
    setNewVideo({ title: '', url: '', duration: 0, thumbnail: '' });
    setShowVideoModal(false);
    
    toast({
      title: 'تم إضافة الفيديو',
      description: `تم إضافة فيديو "${newVideo.title}" بنجاح`,
      variant: 'success'
    });
  };

  const handleEditVideo = (video) => {
    setEditingVideo(video);
    setNewVideo({
      title: video.title,
      url: video.url,
      duration: video.duration || 0,
      thumbnail: video.thumbnail || ''
    });
    setShowVideoModal(true);
  };

  const handleUpdateVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الفيديو والرابط',
        variant: 'destructive'
      });
      return;
    }

    setVideos(prev => prev.map(video => 
      video.id === editingVideo.id 
        ? { ...video, ...newVideo, duration: parseInt(newVideo.duration) || 0 }
        : video
    ));

    setNewVideo({ title: '', url: '', duration: 0, thumbnail: '' });
    setEditingVideo(null);
    setShowVideoModal(false);
    
    toast({
      title: 'تم تحديث الفيديو',
      description: `تم تحديث فيديو "${newVideo.title}" بنجاح`,
      variant: 'success'
    });
  };

  const handleDeleteVideo = (videoId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      setVideos(prev => prev.filter(video => video.id !== videoId));
      toast({
        title: 'تم حذف الفيديو',
        description: 'تم حذف الفيديو بنجاح',
        variant: 'success'
      });
    }
  };

  // Validate exam questions
  const validateExamQuestions = (questions) => {
    if (!questions || questions.length === 0) {
      return { valid: false, message: 'يرجى إضافة سؤال واحد على الأقل للامتحان الداخلي' };
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      const questionText = question.questionText ? String(question.questionText).trim() : '';
      if (!questionText) {
        return { valid: false, message: `يرجى إدخال نص السؤال ${i + 1}` };
      }

      if (question.type === 'multiple_choice' || question.type === 'mcq') {
        const opts = question.options ?? question.choices?.map(c => c?.text ?? c) ?? [];
        if (opts.length < 2) {
          return { valid: false, message: `السؤال ${i + 1} يجب أن يحتوي على خيارين على الأقل` };
        }
        
        // Validate all options are filled (support both options and choices)
        const optTexts = opts.map(opt => (typeof opt === 'object' && opt?.text !== undefined ? opt.text : opt));
        const emptyOptions = optTexts.filter(opt => !opt || !String(opt).trim());
        if (emptyOptions.length > 0) {
          return { valid: false, message: `السؤال ${i + 1}: يرجى ملء جميع الخيارات` };
        }

        // Check for correct answer: correctAnswer (single), correctAnswers (array), or choices with isCorrect
        const hasCorrectAnswer = (question.correctAnswer !== undefined && question.correctAnswer !== null);
        const hasCorrectAnswersArray = Array.isArray(question.correctAnswers) && question.correctAnswers.length > 0;
        const hasCorrectInChoices = question.choices && Array.isArray(question.choices) && question.choices.some(c => c?.isCorrect);
        const hasCorrect = hasCorrectAnswer || hasCorrectAnswersArray || hasCorrectInChoices;
        
        if (!hasCorrect) {
          return { valid: false, message: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}` };
        }
      }

      if (question.type === 'true_false') {
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          return { valid: false, message: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}` };
        }
      }

      const points = question.points ?? question.marks ?? 1;
      const pointsNum = typeof points === 'number' ? points : parseInt(points, 10);
      if (isNaN(pointsNum) || pointsNum < 1) {
        return { valid: false, message: `السؤال ${i + 1}: عدد النقاط يجب أن يكون على الأقل 1` };
      }
    }

    return { valid: true };
  };

  // Save changes
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      console.log('💾 Starting save operation for course:', id);
      console.log('📝 Current form data:', courseForm);
      console.log('🎥 Current videos:', videos);
      console.log('📝 Current exams:', exams);
      
      // Validate required fields
      if (!courseForm.title.trim()) {
        toast({
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال عنوان الدورة',
          variant: 'destructive'
        });
        return;
      }

      if (!courseForm.subject.trim()) {
        toast({
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال المادة',
          variant: 'destructive'
        });
        return;
      }

      if (!courseForm.grade.trim()) {
        toast({
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال الصف',
          variant: 'destructive'
        });
        return;
      }

      if (courseForm.price < 0) {
        toast({
          title: 'خطأ في البيانات',
          description: 'السعر يجب أن يكون أكبر من أو يساوي صفر',
          variant: 'destructive'
        });
        return;
      }

      // Validate exams before saving
      for (let i = 0; i < exams.length; i++) {
        const exam = exams[i];
        if (exam.type === 'internal_exam') {
          const validation = validateExamQuestions(exam.questions);
          if (!validation.valid) {
            toast({
              title: 'خطأ في التحقق من البيانات',
              description: `الامتحان "${exam.title}": ${validation.message}`,
              variant: 'destructive',
              duration: 8000
            });
            setSaving(false);
            return;
          }
        }
      }

      // Prepare update data with proper structure
      // Normalize and clean exam data before sending
      const normalizedExams = exams.map((exam, index) => {
        // Normalize exam data using the cleaning function
        const normalizedExam = normalizeExamData(exam);
        
        const totalMarks = normalizedExam.type === 'internal_exam' 
          ? (normalizedExam.questions?.reduce((total, question) => total + (question.points || 1), 0) || 0)
          : 0;

        return {
          id: normalizedExam.id || `exam_${Date.now()}_${index}`,
          title: (normalizedExam.title || `Exam ${index + 1}`).trim(),
          type: normalizedExam.type || 'internal_exam',
          url: normalizedExam.url?.trim() || '',
          totalMarks,
          duration: parseInt(normalizedExam.duration) || 30,
          passingScore: parseInt(normalizedExam.passingScore) || 60,
          questions: normalizedExam.type === 'internal_exam' && normalizedExam.questions 
            ? normalizedExam.questions
            : [],
          migratedFromGoogleForm: normalizedExam.migratedFromGoogleForm || false,
          migrationNote: normalizedExam.migrationNote || ''
        };
      });

      const updateData = {
        title: courseForm.title.trim(),
        description: courseForm.description.trim(),
        subject: courseForm.subject.trim(),
        grade: courseForm.grade.trim(),
        price: parseFloat(courseForm.price),
        videos: videos.map((video, index) => ({
          title: video.title || `Video ${index + 1}`,
          url: video.url || '',
          order: video.order !== undefined ? parseInt(video.order) : index,
          duration: video.duration ? Math.max(1, parseInt(video.duration)) : 1,
          thumbnail: video.thumbnail || '',
          ...video // Include any additional fields
        })),
        exams: normalizedExams
      };

      console.log('📤 Sending update data:', updateData);
      const response = await axiosInstance.patch(`/api/admin/courses/${id}`, updateData);
      console.log('📥 Save response:', response.data);

      if (response.data.success) {
        toast({
          title: 'تم حفظ التغييرات',
          description: `تم تحديث الدورة بنجاح مع ${videos.length} فيديو و ${exams.length} امتحان`,
          variant: 'success',
          duration: 5000
        });
        
        // Refresh course data to ensure UI is in sync
        await fetchCourseData();
      } else {
        throw new Error(response.data.message || 'Failed to save course');
      }
    } catch (error) {
      console.error('❌ Error saving course:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'حدث خطأ غير متوقع';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'خطأ في حفظ التغييرات',
        description: errorMessage,
        variant: 'destructive',
        duration: 8000
      });
    } finally {
      setSaving(false);
    }
  };

  // Close modals
  const closeVideoModal = () => {
    setShowVideoModal(false);
    setEditingVideo(null);
    setNewVideo({ title: '', url: '', duration: 0, thumbnail: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
          <p style={{ color: colors.text }}>جاري تحميل بيانات الدورة...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: colors.error }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>الدورة غير موجودة</h2>
          <p style={{ color: colors.textMuted }}>لم يتم العثور على الدورة المطلوبة</p>
          <LuxuryButton
            onClick={() => navigate('/admin/courses')}
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 border-0"
          >
            العودة إلى قائمة الدورات
          </LuxuryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <LuxuryButton
              variant="ghost"
              onClick={() => navigate('/admin/courses')}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-150
  shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={20} />
            </LuxuryButton>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
                تعديل الدورة
              </h1>
              <p className="text-lg" style={{ color: colors.textMuted }}>
                {course.title}
              </p>
            </div>
          </div>
          
          <LuxuryButton
            onClick={handleSaveChanges}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold shadow-xl hover:shadow-2xl transform  disabled:scale-100 transition-all duration-300 border-0"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save size={20} className="animate-bounce" />
                حفظ التغييرات
              </>
            )}
          </LuxuryButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Info Section */}
            <LuxuryCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                  <Settings size={20} color={colors.accent} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                  معلومات الدورة
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    عنوان الدورة *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={courseForm.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                      '--tw-ring-color': colors.accent + '30'
                    }}
                    placeholder="أدخل عنوان الدورة"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                    وصف الدورة
                  </label>
                  <textarea
                    name="description"
                    value={courseForm.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2 resize-none"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                      '--tw-ring-color': colors.accent + '30'
                    }}
                    placeholder="أدخل وصف الدورة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      المادة *
                    </label>
                    <select
                      name="subject"
                      value={courseForm.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                    >
                      <option value="">اختر المادة</option>
                      <option value="لغة عربية">لغة عربية</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      الصف *
                    </label>
                    <select
                      name="grade"
                      value={courseForm.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                    >
                      <option value="">اختر الصف</option>
                      <option value="7">أولى إعدادي</option>
                      <option value="8">ثانية إعدادي</option>
                      <option value="9">ثالثة إعدادي</option>
                      <option value="10">أولى ثانوي</option>
                      <option value="11">ثانية ثانوي</option>
                      <option value="12">ثالثة ثانوي</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      سعر الدورة (جنية) *
                    </label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                      <input
                        type="number"
                        name="price"
                        value={courseForm.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      رابط صورة الدورة
                    </label>
                    <div className="relative">
                      <Image size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                      <input
                        type="url"
                        name="imageUrl"
                        value={courseForm.imageUrl}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </LuxuryCard>

            {/* Videos Section */}
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                    <Video size={20} color={colors.accent} />
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                    فيديوهات الدورة
                  </h2>
                  <span className="px-2 py-1 rounded-full text-sm" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                    {videos.length}
                  </span>
                </div>
                
                <LuxuryButton
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform  transition-all duration-300 border-0"
                >
                  <Plus size={18} className="animate-pulse" />
                  إضافة فيديو
                </LuxuryButton>
              </div>

              <div className="space-y-3">
                {videos.length === 0 ? (
                  <div className="text-center py-8" style={{ color: colors.textMuted }}>
                    <Video size={48} className="mx-auto mb-4 opacity-50" />
                    <p>لا توجد فيديوهات في هذه الدورة</p>
                  </div>
                ) : (
                  videos.map((video) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-4 p-4 rounded-lg border-2 transition-colors duration-150
 hover:shadow-md"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background
                      }}
                    >
                      <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                        <Play size={20} color={colors.accent} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" style={{ color: colors.text }}>
                          {video.title}
                        </h3>
                        <p className="text-sm truncate" style={{ color: colors.textMuted }}>
                          {video.url}
                        </p>
                        {video.duration > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={12} style={{ color: colors.textMuted }} />
                            <span className="text-xs" style={{ color: colors.textMuted }}>
                              {video.duration} دقيقة
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <LuxuryButton
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(video.url, '_blank')}
                          className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-150
 "
                        >
                          <ExternalLink size={16} />
                        </LuxuryButton>
                        <LuxuryButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditVideo(video)}
                          className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 transition-colors duration-150
 "
                        >
                          <Edit size={16} />
                        </LuxuryButton>
                        <LuxuryButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors duration-150
 "
                        >
                          <Trash2 size={16} />
                        </LuxuryButton>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </LuxuryCard>

            {/* Exams Section - Modern dynamic builder (add/remove options, add question anywhere) */}
            <LuxuryCard className="p-6">
              <IntegratedExamBuilder
                exams={exams}
                onExamsChange={setExams}
                isDarkMode={theme.isDarkMode}
              />
            </LuxuryCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <LuxuryCard className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                إحصائيات الدورة
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video size={16} style={{ color: colors.accent }} />
                    <span style={{ color: colors.text }}>الفيديوهات</span>
                  </div>
                  <span className="font-semibold" style={{ color: colors.accent }}>
                    {videos.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck size={16} style={{ color: colors.accent }} />
                    <span style={{ color: colors.text }}>الامتحانات</span>
                  </div>
                  <span className="font-semibold" style={{ color: colors.accent }}>
                    {exams.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} style={{ color: colors.accent }} />
                    <span style={{ color: colors.text }}>السعر</span>
                  </div>
                  <span className="font-semibold" style={{ color: colors.accent }}>
                    {courseForm.price} جنية
                  </span>
                </div>
              </div>
            </LuxuryCard>

            {/* Course Image */}
            <LuxuryCard className="p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                صورة الدورة
              </h3>
              <div className="relative">
                {courseForm.imageUrl ? (
                  <div className="space-y-3">
                    <img
                      src={courseForm.imageUrl}
                      alt={courseForm.title}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <Image size={48} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">خطأ في تحميل الصورة</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <LuxuryButton
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(courseForm.imageUrl, '_blank')}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-150
"
                      >
                        <Eye size={14} className="mr-1" />
                        عرض
                      </LuxuryButton>
                      <LuxuryButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setCourseForm(prev => ({ ...prev, imageUrl: '' }))}
                        className="flex-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-colors duration-150
"
                      >
                        <Trash2 size={14} className="mr-1" />
                        حذف
                      </LuxuryButton>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Image size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">لا توجد صورة</p>
                      <p className="text-xs mt-1">أضف رابط الصورة في النموذج</p>
                    </div>
                  </div>
                )}
              </div>
            </LuxuryCard>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
            >
              <LuxuryCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold" style={{ color: colors.text }}>
                    {editingVideo ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
                  </h3>
                  <LuxuryButton
                    variant="ghost"
                    onClick={closeVideoModal}
                    className="p-2"
                  >
                    <X size={20} />
                  </LuxuryButton>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      عنوان الفيديو *
                    </label>
                    <input
                      type="text"
                      value={newVideo.title}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      placeholder="أدخل عنوان الفيديو"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      رابط الفيديو *
                    </label>
                    <input
                      type="url"
                      value={newVideo.url}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      مدة الفيديو (بالدقائق)
                    </label>
                    <input
                      type="number"
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      رابط الصورة المصغرة
                    </label>
                    <input
                      type="url"
                      value={newVideo.thumbnail}
                      onChange={(e) => setNewVideo(prev => ({ ...prev, thumbnail: e.target.value }))}
                      className="w-full px-4 py-3 rounded-lg border-2 transition-colors duration-150
 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': colors.accent + '30'
                      }}
                      placeholder="https://img.youtube.com/vi/..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <LuxuryButton
                    variant="ghost"
                    onClick={closeVideoModal}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 font-semibold transition-colors duration-150
 "
                  >
                    إلغاء
                  </LuxuryButton>
                  <LuxuryButton
                    onClick={editingVideo ? handleUpdateVideo : handleAddVideo}
                    className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transform  transition-all duration-300 border-0"
                  >
                    {editingVideo ? 'تحديث' : 'إضافة'}
                  </LuxuryButton>
                </div>
              </LuxuryCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EditCourse;
