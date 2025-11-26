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
import EnhancedExamEditor from '../../components/admin/EnhancedExamEditor';

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
  const [showExamModal, setShowExamModal] = useState(false);

  // Prevent scroll jump when modal opens
  useEffect(() => {
    if (showExamModal) {
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    };
  }, [showExamModal]);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editingExam, setEditingExam] = useState(null);
  
  // New item forms
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    duration: 0,
    thumbnail: ''
  });
  const [newExam, setNewExam] = useState({
    title: '',
    url: '',
    type: 'internal_exam',
    totalMarks: 0, // سيتم حسابه تلقائياً
    duration: 30,
    passingScore: 60,
    questions: []
  });

  // Calculate total marks from questions
  const calculateTotalMarks = () => {
    return newExam.questions.reduce((total, question) => total + (question.points || question.marks || 1), 0);
  };

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

      // Normalize options - ensure they are strings
      let normalizedOptions = [];
      if (question.options && Array.isArray(question.options)) {
        normalizedOptions = question.options.map((opt, optIndex) => {
          // If option is an object, extract text
          if (typeof opt === 'object' && opt !== null) {
            return String(opt.text || opt.optionText || opt.value || '').trim();
          }
          // If option is a string, use it directly
          return String(opt).trim();
        }).filter(opt => opt.length > 0); // Remove empty options
      }

      // Normalize correctAnswer based on question type
      let normalizedCorrectAnswer = question.correctAnswer;

      if (question.type === 'true_false') {
        // For true/false questions, correctAnswer must be boolean
        // If it's a number (0 or 1), convert to boolean
        if (typeof normalizedCorrectAnswer === 'number') {
          // 0 = false (خطأ), 1 = true (صحيح)
          // But we need to check: optIndex 0 = صحيح (true), optIndex 1 = خطأ (false)
          // So if correctAnswer is 0, it means صحيح (true)
          // If correctAnswer is 1, it means خطأ (false)
          normalizedCorrectAnswer = normalizedCorrectAnswer === 0;
        } else if (typeof normalizedCorrectAnswer === 'string') {
          // Handle string values
          normalizedCorrectAnswer = normalizedCorrectAnswer === 'true' || 
                                     normalizedCorrectAnswer === 'صحيح' ||
                                     normalizedCorrectAnswer === '0';
        } else if (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined) {
          // Default to false if not set
          normalizedCorrectAnswer = false;
        }
        // Ensure it's a boolean
        normalizedCorrectAnswer = Boolean(normalizedCorrectAnswer);
      } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
        // For multiple choice, correctAnswer should be the index (number) or option text (string)
        if (normalizedCorrectAnswer === null || normalizedCorrectAnswer === undefined) {
          normalizedCorrectAnswer = null;
        } else if (typeof normalizedCorrectAnswer === 'number') {
          // Keep as number (index)
          normalizedCorrectAnswer = normalizedCorrectAnswer;
        } else if (typeof normalizedCorrectAnswer === 'string') {
          // Keep as string (option text)
          normalizedCorrectAnswer = normalizedCorrectAnswer.trim();
        }
      }

      // Ensure points is a valid number
      const points = Math.max(1, parseInt(question.points || question.marks || 1) || 1);

      return {
        id: question.id || `q_${Date.now()}_${qIndex}`,
        questionText,
        type: question.type || 'multiple_choice',
        options: normalizedOptions,
        correctAnswer: normalizedCorrectAnswer,
        points,
        // Preserve other fields if they exist
        ...(question.sampleAnswer && { sampleAnswer: question.sampleAnswer }),
        ...(question.explanation && { explanation: question.explanation }),
        ...(question.order !== undefined && { order: question.order })
      };
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
            const normalizedQuestions = exam.questions.map(q => {
              // Normalize options - convert objects to strings
              let normalizedOptions = [];
              if (q.options && Array.isArray(q.options)) {
                normalizedOptions = q.options.map(opt => {
                  if (typeof opt === 'object' && opt !== null) {
                    return String(opt.text || opt.optionText || opt.value || '').trim();
                  }
                  return String(opt).trim();
                }).filter(opt => opt.length > 0);
              }
              
              // Convert correctAnswer to display format (index) for UI
              // This ensures the correct answer is displayed when editing
              const displayCorrectAnswer = convertCorrectAnswerForDisplay({
                ...q,
                options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || [])
              });
              
              return {
                ...q,
                options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || []),
                correctAnswer: displayCorrectAnswer // Store as index for UI display
              };
            });
            
            return {
              ...exam,
              questions: normalizedQuestions
            };
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

      if (question.type === 'multiple_choice') {
        if (!question.options || question.options.length < 2) {
          return { valid: false, message: `السؤال ${i + 1} يجب أن يحتوي على خيارين على الأقل` };
        }
        
        // Validate all options are filled
        const emptyOptions = question.options.filter(opt => !opt || !String(opt).trim());
        if (emptyOptions.length > 0) {
          return { valid: false, message: `السؤال ${i + 1}: يرجى ملء جميع الخيارات` };
        }

        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          return { valid: false, message: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}` };
        }
      }

      if (question.type === 'true_false') {
        if (question.correctAnswer === undefined || question.correctAnswer === null) {
          return { valid: false, message: `يرجى اختيار الإجابة الصحيحة للسؤال ${i + 1}` };
        }
      }

      if (!question.points || question.points < 1) {
        return { valid: false, message: `السؤال ${i + 1}: عدد النقاط يجب أن يكون على الأقل 1` };
      }
    }

    return { valid: true };
  };

  // Exam management functions
  const handleAddExam = (examData = null) => {
    const exam = examData || newExam;
    
    if (!exam.title || !exam.title.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الامتحان',
        variant: 'destructive'
      });
      return;
    }

    // For internal exams, validate questions
    if (exam.type === 'internal_exam') {
      const validation = validateExamQuestions(exam.questions);
      if (!validation.valid) {
        toast({
          title: 'خطأ في البيانات',
          description: validation.message,
          variant: 'destructive'
        });
        return;
      }
    }

    // For external exams, validate URL
    if (exam.type !== 'internal_exam' && (!exam.url || !exam.url.trim())) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال رابط الامتحان الخارجي',
        variant: 'destructive'
      });
      return;
    }

    // Calculate total marks and ensure proper structure
    const totalMarks = exam.type === 'internal_exam' 
      ? (exam.questions?.reduce((total, question) => total + (question.points || 1), 0) || 0)
      : 0;

    const examToAdd = {
      ...exam,
      id: exam.id || `exam_${Date.now()}`,
      title: exam.title.trim(),
      url: exam.url?.trim() || '',
      totalMarks,
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      questions: exam.questions ? exam.questions.map(q => ({
        ...q,
        questionText: (q.questionText ? String(q.questionText).trim() : '') || '',
        options: q.options?.map(opt => (opt ? String(opt).trim() : '')) || [],
        points: q.points || 1
      })) : []
    };

    setExams(prev => [...prev, examToAdd]);
    setNewExam({ 
      title: '', 
      url: '', 
      type: 'internal_exam',
      totalMarks: 0,
      duration: 30,
      passingScore: 60,
      questions: []
    });
    setShowExamModal(false);
    
    toast({
      title: 'تم إضافة الامتحان',
      description: `تم إضافة امتحان "${exam.title}" بنجاح`,
      variant: 'success'
    });
  };

  const handleEditExam = (exam) => {
    // Deep clone exam to avoid reference issues
    // Normalize options and convert correctAnswer for display
    const clonedExam = {
      ...exam,
      questions: exam.questions ? exam.questions.map(q => {
        // Normalize options - ensure they are strings
        let normalizedOptions = [];
        if (q.options && Array.isArray(q.options)) {
          normalizedOptions = q.options.map(opt => {
            if (typeof opt === 'object' && opt !== null) {
              return String(opt.text || opt.optionText || opt.value || '').trim();
            }
            return String(opt).trim();
          }).filter(opt => opt.length > 0);
        }
        
        // Convert correctAnswer to display format (index)
        const displayCorrectAnswer = convertCorrectAnswerForDisplay({
          ...q,
          options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || [])
        });
        
        return {
          ...q,
          options: normalizedOptions.length > 0 ? normalizedOptions : (q.options || []),
          correctAnswer: displayCorrectAnswer // Store as index for UI display
        };
      }) : []
    };
    
    setEditingExam(clonedExam);
    setNewExam({
      title: clonedExam.title || '',
      url: clonedExam.url || '',
      type: clonedExam.type || 'internal_exam',
      totalMarks: clonedExam.totalMarks || 0,
      duration: clonedExam.duration || 30,
      passingScore: clonedExam.passingScore || 60,
      questions: clonedExam.questions || []
    });
    setShowExamModal(true);
  };

  const handleUpdateExam = (examData = null) => {
    const exam = examData || newExam;
    
    if (!exam.title || !exam.title.trim()) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال عنوان الامتحان',
        variant: 'destructive'
      });
      return;
    }

    // For internal exams, validate questions
    if (exam.type === 'internal_exam') {
      const validation = validateExamQuestions(exam.questions);
      if (!validation.valid) {
        toast({
          title: 'خطأ في البيانات',
          description: validation.message,
          variant: 'destructive'
        });
        return;
      }
    }

    // For external exams, validate URL
    if (exam.type !== 'internal_exam' && (!exam.url || !exam.url.trim())) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى إدخال رابط الامتحان الخارجي',
        variant: 'destructive'
      });
      return;
    }

    if (!editingExam || !editingExam.id) {
      toast({
        title: 'خطأ',
        description: 'لم يتم العثور على الامتحان للتحديث',
        variant: 'destructive'
      });
      return;
    }

    // Calculate total marks and ensure proper structure
    const totalMarks = exam.type === 'internal_exam' 
      ? (exam.questions?.reduce((total, question) => total + (question.points || 1), 0) || 0)
      : 0;

    const updatedExam = {
      ...editingExam,
      ...exam,
      title: exam.title.trim(),
      url: exam.url?.trim() || '',
      totalMarks,
      duration: exam.duration || 30,
      passingScore: exam.passingScore || 60,
      questions: exam.questions ? exam.questions.map(q => ({
        ...q,
        questionText: (q.questionText ? String(q.questionText).trim() : '') || '',
        options: q.options?.map(opt => (opt ? String(opt).trim() : '')) || [],
        points: q.points || 1
      })) : []
    };

    setExams(prev => prev.map(examItem => 
      examItem.id === editingExam.id ? updatedExam : examItem
    ));

    setNewExam({ 
      title: '', 
      url: '', 
      type: 'internal_exam',
      totalMarks: 0,
      duration: 30,
      passingScore: 60,
      questions: []
    });
    setEditingExam(null);
    setShowExamModal(false);
    
    toast({
      title: 'تم تحديث الامتحان',
      description: `تم تحديث امتحان "${exam.title}" بنجاح`,
      variant: 'success'
    });
  };

  const handleDeleteExam = (examId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الامتحان؟')) {
      setExams(prev => prev.filter(exam => exam.id !== examId));
      toast({
        title: 'تم حذف الامتحان',
        description: 'تم حذف الامتحان بنجاح',
        variant: 'success'
      });
    }
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

  const closeExamModal = () => {
    setShowExamModal(false);
    setEditingExam(null);
    setNewExam({ 
      title: '', 
      url: '', 
      type: 'internal_exam',
      totalMarks: 0,
      duration: 30,
      passingScore: 60,
      questions: []
    });
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
                  videos.map((video, index) => (
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

            {/* Exams Section */}
            <LuxuryCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                    <FileCheck size={20} color={colors.accent} />
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                    امتحانات الدورة
                  </h2>
                  <span className="px-2 py-1 rounded-full text-sm" style={{ backgroundColor: colors.accent + '20', color: colors.accent }}>
                    {exams.length}
                  </span>
                </div>
                
                <LuxuryButton
                  onClick={() => setShowExamModal(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform  transition-all duration-300 border-0"
                >
                  <Plus size={18} className="animate-pulse" />
                  إضافة امتحان
                </LuxuryButton>
              </div>

              <div className="space-y-3">
                {exams.length === 0 ? (
                  <div className="text-center py-8" style={{ color: colors.textMuted }}>
                    <FileCheck size={48} className="mx-auto mb-4 opacity-50" />
                    <p>لا توجد امتحانات في هذه الدورة</p>
                  </div>
                ) : (
                  exams.map((exam, index) => (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border-2 transition-colors duration-150
 hover:shadow-md"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 p-3 rounded-lg" style={{ backgroundColor: colors.accent + '20' }}>
                          {exam.type === 'internal_exam' ? (
                            <BookOpen size={20} color={colors.accent} />
                          ) : (
                            <ExternalLink size={20} color={colors.accent} />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium truncate" style={{ color: colors.text }}>
                              {exam.title}
                            </h3>
                            <span className="inline-block px-2 py-1 rounded text-xs" style={{ 
                              backgroundColor: exam.type === 'internal_exam' ? colors.success + '20' : colors.accent + '20', 
                              color: exam.type === 'internal_exam' ? colors.success : colors.accent 
                            }}>
                              {exam.type === 'internal_exam' ? 'داخلي' : 
                               exam.type === 'google_form' ? 'Google Form' : 
                               exam.type === 'external' ? 'خارجي' : 'رابط'}
                            </span>
                            {exam.migratedFromGoogleForm && (
                              <span className="inline-block px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">
                                مهاجر
                              </span>
                            )}
                          </div>
                          
                          {exam.type === 'internal_exam' ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-4 text-sm" style={{ color: colors.textMuted }}>
                                <span>أسئلة: {exam.questions?.length || 0}</span>
                                <span>نقاط: {exam.totalPoints || 0}</span>
                                <span>علامات: {exam.totalMarks || 0}</span>
                                <span>مدة: {exam.duration || 0} دقيقة</span>
                                <span>نجاح: {exam.passingScore || 0}%</span>
                              </div>
                              {exam.questions && exam.questions.length > 0 && (
                                <div className="text-xs" style={{ color: colors.textMuted }}>
                                  آخر سؤال: {exam.questions[exam.questions.length - 1]?.questionText?.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="text-sm truncate" style={{ color: colors.textMuted }}>
                                {exam.url}
                              </p>
                              {exam.migrationNote && (
                                <p className="text-xs text-yellow-600">
                                  {exam.migrationNote}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {exam.type !== 'internal_exam' && exam.url && (
                            <LuxuryButton
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(exam.url, '_blank')}
                              className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors duration-150
 "
                            >
                              <ExternalLink size={16} />
                            </LuxuryButton>
                          )}
                          <LuxuryButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExam(exam)}
                            className="p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 hover:text-yellow-700 transition-colors duration-150
 "
                          >
                            <Edit size={16} />
                          </LuxuryButton>
                          <LuxuryButton
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors duration-150
 "
                          >
                            <Trash2 size={16} />
                          </LuxuryButton>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
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
                      className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center hidden"
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

      {/* Enhanced Exam Modal - Redesigned */}
      <AnimatePresence>
        {showExamModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowExamModal(false);
                setEditingExam(null);
                setNewExam({
                  title: '',
                  url: '',
                  type: 'internal_exam',
                  totalMarks: 0,
                  duration: 30,
                  passingScore: 60,
                  questions: []
                });
              }
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 md:p-6"
            style={{ direction: 'rtl' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col"
              style={{ backgroundColor: colors.background, borderRadius: borderRadius.lg }}
            >
              {/* Sticky Header */}
              <div 
                className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b-2 flex-shrink-0"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div 
                    className="p-2.5 sm:p-3 rounded-xl flex-shrink-0"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <FileCheck size={22} className="text-white sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 
                      className="text-lg sm:text-xl md:text-2xl font-bold truncate"
                      style={{ color: colors.text }}
                    >
                      {editingExam ? 'تعديل الامتحان' : 'إضافة امتحان جديد'}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm mt-0.5 truncate"
                      style={{ color: colors.textMuted }}
                    >
                      {editingExam ? 'قم بتعديل بيانات الامتحان' : 'أضف امتحان جديد للدورة'}
                    </p>
                  </div>
                </div>
                <LuxuryButton
                  variant="ghost"
                  onClick={() => {
                    setShowExamModal(false);
                    setEditingExam(null);
                    setNewExam({
                      title: '',
                      url: '',
                      type: 'internal_exam',
                      totalMarks: 0,
                      duration: 30,
                      passingScore: 60,
                      questions: []
                    });
                  }}
                  className="p-2 sm:p-2.5 rounded-xl hover:bg-opacity-80 flex-shrink-0 transition-all duration-200"
                  style={{ 
                    backgroundColor: colors.error + '15',
                    color: colors.error
                  }}
                >
                  <X size={18} className="sm:w-5 sm:h-5" />
                </LuxuryButton>
              </div>

              {/* Scrollable Content */}
              <div 
                className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6"
                style={{ backgroundColor: colors.background }}
              >
                {/* Exam Type Selection */}
                <div className="mb-6 sm:mb-8">
                  <label 
                    className="block text-sm sm:text-base font-bold mb-3 sm:mb-4"
                    style={{ color: colors.text }}
                  >
                    نوع الامتحان *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        newExam.type === 'internal_exam'
                          ? 'shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: newExam.type === 'internal_exam' ? '#10b981' : colors.border,
                        backgroundColor: newExam.type === 'internal_exam' 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : colors.background
                      }}
                      onClick={() => setNewExam(prev => ({ ...prev, type: 'internal_exam' }))}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div 
                          className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            newExam.type === 'internal_exam' 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <BookOpen 
                            size={20} 
                            className={newExam.type === 'internal_exam' ? 'text-white' : 'text-gray-600 dark:text-gray-400'} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-bold text-sm sm:text-base mb-1"
                            style={{ color: colors.text }}
                          >
                            امتحان داخلي
                          </h4>
                          <p 
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: colors.textMuted }}
                          >
                            امتحان مع أسئلة مخصصة
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        newExam.type === 'google_form'
                          ? 'shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: newExam.type === 'google_form' ? '#10b981' : colors.border,
                        backgroundColor: newExam.type === 'google_form' 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : colors.background
                      }}
                      onClick={() => setNewExam(prev => ({ ...prev, type: 'google_form' }))}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div 
                          className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            newExam.type === 'google_form' 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <ExternalLink 
                            size={20} 
                            className={newExam.type === 'google_form' ? 'text-white' : 'text-gray-600 dark:text-gray-400'} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-bold text-sm sm:text-base mb-1"
                            style={{ color: colors.text }}
                          >
                            Google Form
                          </h4>
                          <p 
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: colors.textMuted }}
                          >
                            رابط Google Form
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        newExam.type === 'external'
                          ? 'shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        borderColor: newExam.type === 'external' ? '#10b981' : colors.border,
                        backgroundColor: newExam.type === 'external' 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : colors.background
                      }}
                      onClick={() => setNewExam(prev => ({ ...prev, type: 'external' }))}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div 
                          className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                            newExam.type === 'external' 
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        >
                          <ExternalLink 
                            size={20} 
                            className={newExam.type === 'external' ? 'text-white' : 'text-gray-600 dark:text-gray-400'} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-bold text-sm sm:text-base mb-1"
                            style={{ color: colors.text }}
                          >
                            رابط خارجي
                          </h4>
                          <p 
                            className="text-xs sm:text-sm leading-relaxed"
                            style={{ color: colors.textMuted }}
                          >
                            رابط امتحان خارجي
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div>
                    <label 
                      className="block text-sm sm:text-base font-bold mb-2"
                      style={{ color: colors.text }}
                    >
                      عنوان الامتحان *
                    </label>
                    <input
                      type="text"
                      value={newExam.title}
                      onChange={(e) => setNewExam(prev => ({ ...prev, title: e.target.value }))}
                      className="stable-field w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                      style={{
                        borderColor: colors.border,
                        backgroundColor: colors.background,
                        color: colors.text,
                        '--tw-ring-color': '#10b981'
                      }}
                      placeholder="أدخل عنوان الامتحان"
                    />
                  </div>

                  {newExam.type !== 'internal_exam' && (
                    <div>
                      <label 
                        className="block text-sm sm:text-base font-bold mb-2"
                        style={{ color: colors.text }}
                      >
                        رابط الامتحان *
                      </label>
                      <input
                        type="url"
                        value={newExam.url}
                        onChange={(e) => setNewExam(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': '#10b981'
                        }}
                        placeholder="https://forms.google.com/..."
                      />
                    </div>
                  )}
                </div>

                {/* Exam Settings */}
                {newExam.type === 'internal_exam' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div>
                      <label 
                        className="block text-sm sm:text-base font-bold mb-2"
                        style={{ color: colors.text }}
                      >
                        مدة الامتحان (دقيقة)
                      </label>
                      <div className="relative">
                        <Clock 
                          size={18} 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          style={{ color: colors.textMuted }}
                        />
                        <input
                          type="number"
                          value={newExam.duration}
                          onChange={(e) => setNewExam(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                          min="1"
                          className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                            '--tw-ring-color': '#10b981'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm sm:text-base font-bold mb-2"
                        style={{ color: colors.text }}
                      >
                        درجة النجاح (%)
                      </label>
                      <div className="relative">
                        <div 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold"
                          style={{ color: colors.textMuted }}
                        >
                          %
                        </div>
                        <input
                          type="number"
                          value={newExam.passingScore}
                          onChange={(e) => setNewExam(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 60 }))}
                          min="0"
                          max="100"
                          className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background,
                            color: colors.text,
                            '--tw-ring-color': '#10b981'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm sm:text-base font-bold mb-2"
                        style={{ color: colors.text }}
                      >
                        إجمالي الدرجات
                      </label>
                      <div 
                        className="w-full px-4 py-3 rounded-xl border-2 font-bold text-center"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.accent + '15',
                          color: colors.accent
                        }}
                      >
                        {newExam.questions?.reduce((total, question) => total + (question.points || 1), 0) || 0} نقطة
                      </div>
                      <p 
                        className="text-xs mt-1.5 text-center"
                        style={{ color: colors.textMuted }}
                      >
                        يتم حسابها تلقائياً
                      </p>
                    </div>
                  </div>
                )}

                {/* Questions Section */}
                {newExam.type === 'internal_exam' && (
                  <div className="mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: colors.accent + '20' }}
                        >
                          <FileText size={20} color={colors.accent} />
                        </div>
                        <h4 
                          className="text-base sm:text-lg font-bold"
                          style={{ color: colors.text }}
                        >
                          أسئلة الامتحان
                          <span 
                            className="mr-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: colors.accent + '20',
                              color: colors.accent
                            }}
                          >
                            {newExam.questions?.length || 0}
                          </span>
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <LuxuryButton
                          onClick={() => {
                            const newQuestion = {
                              id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                              questionText: '',
                              type: 'multiple_choice',
                              options: ['', '', '', ''],
                              correctAnswer: null,
                              points: 1
                            };
                            setNewExam(prev => ({
                              ...prev,
                              questions: [...(prev.questions || []), newQuestion]
                            }));
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                          <Plus size={16} className="ml-1.5 inline" />
                          اختيار من متعدد
                        </LuxuryButton>
                        <LuxuryButton
                          onClick={() => {
                            const newQuestion = {
                              id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                              questionText: '',
                              type: 'true_false',
                              options: ['صحيح', 'خطأ'],
                              correctAnswer: null,
                              points: 1
                            };
                            setNewExam(prev => ({
                              ...prev,
                              questions: [...(prev.questions || []), newQuestion]
                            }));
                          }}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                        >
                          <Plus size={16} className="ml-1.5 inline" />
                          صح وخطأ
                        </LuxuryButton>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                      {newExam.questions?.map((question, index) => (
                        <motion.div
                          key={question.id || `q_${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                          style={{
                            borderColor: colors.border,
                            backgroundColor: colors.background
                          }}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b"
                            style={{ borderColor: colors.border }}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                              <div 
                                className="px-3 py-1 rounded-lg font-bold text-sm"
                                style={{ 
                                  backgroundColor: colors.accent + '20',
                                  color: colors.accent
                                }}
                              >
                                سؤال {index + 1}
                              </div>
                              <span 
                                className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  question.type === 'multiple_choice' 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                }`}
                              >
                                {question.type === 'multiple_choice' ? 'اختيار من متعدد' : 'صح وخطأ'}
                              </span>
                            </div>
                            <LuxuryButton
                              onClick={() => {
                                setNewExam(prev => ({
                                  ...prev,
                                  questions: prev.questions?.filter(q => q.id !== question.id) || []
                                }));
                              }}
                              className="p-2 rounded-lg hover:scale-110 transition-transform duration-200"
                              style={{ 
                                backgroundColor: colors.error + '15',
                                color: colors.error
                              }}
                            >
                              <Trash2 size={16} />
                            </LuxuryButton>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label 
                                className="block text-sm font-semibold mb-2"
                                style={{ color: colors.text }}
                              >
                                نص السؤال *
                              </label>
                              <textarea
                                value={question.questionText || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setNewExam(prev => {
                                    const updatedQuestions = (prev.questions || []).map((q, i) => 
                                      i === index ? { ...q, questionText: value } : q
                                    );
                                    return { ...prev, questions: updatedQuestions };
                                  });
                                }}
                                rows={2}
                                className="stable-field w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
                                style={{
                                  borderColor: colors.border,
                                  backgroundColor: colors.background,
                                  color: colors.text,
                                  '--tw-ring-color': '#10b981'
                                }}
                                placeholder="أدخل نص السؤال هنا..."
                              />
                            </div>

                            {/* Options */}
                            <div>
                              <label 
                                className="block text-sm font-semibold mb-3"
                                style={{ color: colors.text }}
                              >
                                الخيارات:
                              </label>
                              <div className="space-y-2.5">
                                {question.options?.map((option, optIndex) => (
                                  <motion.div
                                    key={optIndex}
                                    whileHover={{ x: -4 }}
                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                                      question.correctAnswer === optIndex
                                        ? 'shadow-md'
                                        : ''
                                    }`}
                                    style={{
                                      borderColor: question.correctAnswer === optIndex 
                                        ? '#10b981' 
                                        : colors.border,
                                      backgroundColor: question.correctAnswer === optIndex 
                                        ? 'rgba(16, 185, 129, 0.1)' 
                                        : colors.background
                                    }}
                                  >
                                    <button
                                      type="button"
                                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 hover:scale-110 ${
                                        question.correctAnswer === optIndex
                                          ? 'border-emerald-500 bg-emerald-500 shadow-md'
                                          : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 bg-white dark:bg-gray-800'
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setNewExam(prev => {
                                          const updatedQuestions = (prev.questions || []).map((q, i) => 
                                            i === index ? { ...q, correctAnswer: optIndex } : q
                                          );
                                          return { ...prev, questions: updatedQuestions };
                                        });
                                      }}
                                      aria-label={`اختر الخيار ${optIndex + 1} كإجابة صحيحة`}
                                    >
                                      {question.correctAnswer === optIndex && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                      )}
                                    </button>
                                    <input
                                      type="text"
                                      value={option || ''}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setNewExam(prev => {
                                          const updatedQuestions = (prev.questions || []).map((q, i) => {
                                            if (i === index) {
                                              const updatedOptions = [...(q.options || [])];
                                              updatedOptions[optIndex] = value;
                                              return { ...q, options: updatedOptions };
                                            }
                                            return q;
                                          });
                                          return { ...prev, questions: updatedQuestions };
                                        });
                                      }}
                                      className={`stable-field flex-1 px-2 py-2.5 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                        question.correctAnswer === optIndex
                                          ? 'border-emerald-500'
                                          : ''
                                      }`}
                                      style={{
                                        borderColor: question.correctAnswer === optIndex 
                                          ? '#10b981' 
                                          : colors.border,
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        '--tw-ring-color': '#10b981'
                                      }}
                                      placeholder={question.type === 'true_false' 
                                        ? (optIndex === 0 ? 'صحيح' : 'خطأ') 
                                        : `الخيار ${optIndex + 1}`}
                                      readOnly={question.type === 'true_false'}
                                    />
                                    {question.correctAnswer === optIndex && (
                                      <div 
                                        className="flex items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-lg"
                                        style={{ 
                                          backgroundColor: '#10b981',
                                          color: 'white'
                                        }}
                                      >
                                        <div className="w-2 h-2 rounded-full bg-white"></div>
                                        <span className="text-xs font-bold">صحيح</span>
                                      </div>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Points */}
                            <div className="flex items-center gap-3 pt-2 border-t"
                              style={{ borderColor: colors.border }}
                            >
                              <label 
                                className="text-sm font-semibold whitespace-nowrap"
                                style={{ color: colors.text }}
                              >
                                عدد النقاط:
                              </label>
                              <input
                                type="number"
                                value={question.points || 1}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  setNewExam(prev => {
                                    const updatedQuestions = (prev.questions || []).map((q, i) => 
                                      i === index ? { ...q, points: Math.max(1, value) } : q
                                    );
                                    return { ...prev, questions: updatedQuestions };
                                  });
                                }}
                                min="1"
                                className="w-24 px-3 py-2 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                                style={{
                                  borderColor: colors.border,
                                  backgroundColor: colors.background,
                                  color: colors.text,
                                  '--tw-ring-color': '#10b981'
                                }}
                                placeholder="نقاط"
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {(!newExam.questions || newExam.questions.length === 0) && (
                        <div 
                          className="text-center py-12 sm:py-16 rounded-xl border-2 border-dashed"
                          style={{ 
                            borderColor: colors.border,
                            backgroundColor: colors.background + '80'
                          }}
                        >
                          <FileCheck 
                            size={56} 
                            className="mx-auto mb-4 opacity-40"
                            style={{ color: colors.textMuted }}
                          />
                          <p 
                            className="text-base font-medium mb-1"
                            style={{ color: colors.text }}
                          >
                            لا توجد أسئلة بعد
                          </p>
                          <p 
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            اضغط على أحد الأزرار أعلاه لإضافة سؤال جديد
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 border-t-2 flex-shrink-0"
                style={{ 
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <LuxuryButton
                  variant="ghost"
                  onClick={() => {
                    setShowExamModal(false);
                    setEditingExam(null);
                    setNewExam({
                      title: '',
                      url: '',
                      type: 'internal_exam',
                      totalMarks: 0,
                      duration: 30,
                      passingScore: 60,
                      questions: []
                    });
                  }}
                  className="flex-1 sm:flex-none sm:min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                  style={{ 
                    backgroundColor: colors.border + '30',
                    color: colors.text
                  }}
                >
                  إلغاء
                </LuxuryButton>
                <LuxuryButton
                  onClick={() => {
                    if (editingExam) {
                      handleUpdateExam(newExam);
                    } else {
                      handleAddExam(newExam);
                    }
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                >
                  {editingExam ? 'تحديث الامتحان' : 'إضافة الامتحان'}
                </LuxuryButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditCourse;