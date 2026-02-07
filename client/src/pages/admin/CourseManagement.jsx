import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../hooks/use-toast';
import { getVideoThumbnail, getCourseCoverImage, formatVideoDurationFromMinutes, getDefaultVideoThumbnail } from '../../utils/videoUtils';
import { extractVideoId, getEmbedUrlFromAnyYouTubeUrl, isValidYouTubeUrl } from '../../utils/youtubeUtils';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Play,
  Pause,
  Volume2,
  VolumeX,
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  Download,
  Upload,
  Save,
  X,
  Check,
  AlertCircle,
  PlayCircle,
  Trophy,
  Bookmark,
  Target,
  Award,
  BarChart3,
  Settings,
  DollarSign,
  Calendar,
  GraduationCap,
  TrendingUp,
  Shield,
  Zap,
  Image,
  Link,
  ExternalLink,
  GripVertical,
  FileImage,
  Youtube,
  FileCheck,
  HelpCircle,
  Info,
  Crown,
  Gem,
  Sparkles,
  Flame,
  Heart,
  ThumbsUp,
  MessageCircle,
  BookmarkCheck,
  Timer,
  Focus,
  Layers,
  Compass,
  Navigation,
  MapPin,
  Flag,
  CheckSquare,
  Square,
  PlaySquare,
  Volume1,
  Maximize,
  Minimize,
  RotateCw,
  RefreshCw,
  Settings2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Headphones,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  Cloud,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  Activity,
  HeartHandshake,
  HandHeart,
  Hand,
  Handshake,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  UserCircle,
  UserSquare,
  UserCog,
  UserSearch,
  UserStar
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import EnhancedCreateCourseModal from '../../components/admin/EnhancedCreateCourseModal';
import VideoModal from '../../components/admin/VideoModal';

const CourseManagement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = theme;
  
  // State management
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    price: 0,
    duration: 0,
    thumbnail: '',
    isActive: true,
    exams: []
  });

  // Enhanced form states
  const [courseImage, setCourseImage] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [courseExams, setCourseExams] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newExamUrl, setNewExamUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: 0,
    order: 0
  });
  

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    } else {
      fetchCourses();
    }
  }, [id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching courses from /api/admin/courses');
      const response = await axiosInstance.get('/api/admin/courses');
      console.log('✅ Courses API response:', response.data);
      if (response.data.success) {
        setCourses(response.data.data || []);
        console.log('📚 Courses loaded:', response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      setLoading(true);
      const [courseResponse, videosResponse] = await Promise.all([
        axiosInstance.get(`/api/admin/courses/${courseId}`),
        axiosInstance.get(`/api/admin/courses/${courseId}/videos`)
      ]);
      
      if (courseResponse.data.success) {
        setSelectedCourse(courseResponse.data.data);
      }
      
      if (videosResponse.data.success) {
        const videosData = videosResponse.data.data || [];
        setVideos(videosData);
        
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      // If videos endpoint fails, try to get videos from course data
      if (courseResponse?.data?.success && courseResponse.data.data?.videos) {
        const courseVideos = courseResponse.data.data.videos;
        setVideos(courseVideos);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e, enhancedFormData = null) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // Use enhanced form data if provided, otherwise use current courseForm
      const formData = enhancedFormData || courseForm;
      
      // Validate required fields before sending
      const validationErrors = [];
      
      if (!formData.title || formData.title.trim() === '') {
        validationErrors.push('Course title is required');
      }
      
      if (!formData.subject || formData.subject.trim() === '') {
        validationErrors.push('Subject is required');
      }
      
      if (!formData.grade || formData.grade.trim() === '') {
        validationErrors.push('Grade is required');
      }
      
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        validationErrors.push('Valid price is required (must be a number >= 0)');
      }
      
      if (validationErrors.length > 0) {
        toast({
          title: 'Validation Error',
          description: validationErrors.join(', '),
          variant: 'destructive',
          duration: 6000
        });
        return;
      }
      
      // Create FormData for file upload support
      const formDataToSend = new FormData();
      
      // Add basic course information with proper validation
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description?.trim() || '');
      formDataToSend.append('subject', formData.subject.trim());
      formDataToSend.append('grade', formData.grade.trim());
      formDataToSend.append('price', price.toString());
      formDataToSend.append('duration', parseInt(formData.duration) || 0);
      formDataToSend.append('level', formData.level || 'beginner');
      formDataToSend.append('isActive', formData.isActive !== undefined ? formData.isActive : true);
      
      // Handle image upload if present
      if (courseImage) {
        formDataToSend.append('image', courseImage);
      } else if (formData.thumbnail) {
        formDataToSend.append('imageUrl', formData.thumbnail);
      }

      // Process videos from enhanced form data
      const videos = [];
      if (formData.videos && Array.isArray(formData.videos)) {
        formData.videos.forEach((video, index) => {
          videos.push({
            title: video.title || `Video ${index + 1}`,
            url: video.videoUrl || video.url || '',
            order: index,
            duration: Math.max(1, video.duration || 1), // Minimum 1 minute
            thumbnail: video.thumbnail || ''
          });
        });
      }

      /**
       * Normalize exam data before sending to server
       * Converts correctAnswer to proper format and ensures data consistency
       */
   /**
 * Normalize exam data before sending to server
 * Converts correctAnswer to proper format and ensures data consistency
 */
const normalizeExamForServer = (exam) => {
  if (!exam || exam.type !== 'internal_exam' || !exam.questions) {
    return exam;
  }

  const normalizedQuestions = exam.questions.map((question, qIndex) => {
    // Clean question text
    const questionText = question.questionText 
      ? String(question.questionText).trim() 
      : '';

    // ✅ CRITICAL FIX: Handle options based on source format
    let normalizedOptions = [];
    let normalizedCorrectAnswer = null;

    if (question.type === 'mcq' || question.type === 'multiple_choice') {
      // Check if question has options array (from IntegratedExamBuilder)
      if (question.options && Array.isArray(question.options)) {
        normalizedOptions = question.options.map((opt, optIndex) => {
          // If option is an object with id and text
          if (typeof opt === 'object' && opt !== null) {
            return {
              id: opt.id || `opt_${qIndex}_${optIndex}`,
              text: String(opt.text || opt.optionText || '').trim(),
              optionText: String(opt.text || opt.optionText || '').trim()
            };
          }
          // If option is a string
          return {
            id: `opt_${qIndex}_${optIndex}`,
            text: String(opt).trim(),
            optionText: String(opt).trim()
          };
        }).filter(opt => opt.text.length > 0);

        // ✅ correctAnswer should be the option ID
        if (question.correctAnswer) {
          // If correctAnswer is already an option ID string, use it
          if (typeof question.correctAnswer === 'string') {
            normalizedCorrectAnswer = question.correctAnswer;
          }
          // If correctAnswer is a number (index), convert to option ID
          else if (typeof question.correctAnswer === 'number') {
            if (normalizedOptions[question.correctAnswer]) {
              normalizedCorrectAnswer = normalizedOptions[question.correctAnswer].id;
            }
          }
        }
      }
    } else if (question.type === 'true_false') {
      // For true/false questions, correctAnswer must be boolean
      normalizedOptions = [];
      
      if (typeof question.correctAnswer === 'boolean') {
        normalizedCorrectAnswer = question.correctAnswer;
      } else if (typeof question.correctAnswer === 'number') {
        normalizedCorrectAnswer = question.correctAnswer === 0 || question.correctAnswer === 1 
          ? Boolean(question.correctAnswer) 
          : false;
      } else if (typeof question.correctAnswer === 'string') {
        normalizedCorrectAnswer = question.correctAnswer === 'true' || 
                                 question.correctAnswer === 'صحيح' ||
                                 question.correctAnswer === '0';
      } else {
        normalizedCorrectAnswer = false;
      }
    } else if (question.type === 'essay') {
      normalizedOptions = [];
      normalizedCorrectAnswer = null; // Essay questions don't have correct answers
    }

    // Ensure points is a valid number
    const points = Math.max(1, parseInt(question.points || question.marks || 10) || 10);

    return {
      id: question.id || `q_${Date.now()}_${qIndex}`,
      questionText,
      type: question.type || 'mcq',
      options: normalizedOptions,
      correctAnswer: normalizedCorrectAnswer,
      points,
      marks: points,
      ...(question.sampleAnswer && { sampleAnswer: question.sampleAnswer }),
      ...(question.explanation && { explanation: question.explanation }),
      order: qIndex + 1
    };
  });

  return {
    ...exam,
    questions: normalizedQuestions
  };
};

      // Process exams from enhanced form data
      const exams = [];
      if (formData.exams && Array.isArray(formData.exams)) {
        try {
          formData.exams.forEach((exam, index) => {
            // Normalize exam data before adding
            const normalizedExam = normalizeExamForServer(exam);
            
            // Validate that all questions have correctAnswer
            if (normalizedExam.type === 'internal_exam' && normalizedExam.questions) {
              for (let i = 0; i < normalizedExam.questions.length; i++) {
                const q = normalizedExam.questions[i];
                if (q.type === 'multiple_choice' || q.type === 'mcq') {
                  if (q.correctAnswer === null || q.correctAnswer === undefined) {
                    throw new Error(`السؤال ${i + 1} في الامتحان "${normalizedExam.title || `Exam ${index + 1}`}" لا يحتوي على إجابة صحيحة محددة`);
                  }
                }
                if (q.type === 'true_false') {
                  if (q.correctAnswer === null || q.correctAnswer === undefined) {
                    throw new Error(`السؤال ${i + 1} في الامتحان "${normalizedExam.title || `Exam ${index + 1}`}" لا يحتوي على إجابة صحيحة محددة`);
                  }
                }
              }
            }
            
            exams.push({
              title: normalizedExam.title || `Exam ${index + 1}`,
              type: normalizedExam.type || 'internal_exam',
              url: normalizedExam.url || '',
              totalMarks: normalizedExam.totalMarks || normalizedExam.totalPoints || 0,
              duration: normalizedExam.duration || 30,
              passingScore: normalizedExam.passingScore || 60,
              questions: normalizedExam.questions || [],
              migratedFromGoogleForm: normalizedExam.migratedFromGoogleForm || false,
              migrationNote: normalizedExam.migrationNote || ''
            });
          });
        } catch (error) {
          toast({
            title: 'خطأ في بيانات الامتحانات',
            description: error.message || 'يرجى التأكد من أن جميع الأسئلة تحتوي على إجابة صحيحة محددة',
            variant: 'destructive',
            duration: 8000
          });
          setIsCreating(false);
          return;
        }
      }

      // Add videos and exams as JSON strings
      formDataToSend.append('videos', JSON.stringify(videos));
      formDataToSend.append('exams', JSON.stringify(exams));

      console.log('Sending course data:', {
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        price: price,
        duration: parseInt(formData.duration) || 0,
        videosCount: videos.length,
        examsCount: exams.length
      });

      const response = await axiosInstance.post('/api/admin/courses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setShowCreateModal(false);
        fetchCourses();
        toast({
          title: 'تم إنشاء الدورة بنجاح',
          description: `تم إنشاء دورة "${formData.title}" مع ${videos.length} فيديو و ${exams.length} امتحان`,
          variant: 'success',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      
      // Handle different types of errors
      let errorMessage = 'حدث خطأ غير متوقع';
      let errorTitle = 'خطأ في إنشاء الدورة';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.errors && Array.isArray(errorData.errors)) {
          // Handle validation errors
          errorMessage = errorData.errors.map(err => err.message || err).join(', ');
          errorTitle = 'خطأ في التحقق من البيانات';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
        duration: 6000
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.patch(`/api/admin/courses/${selectedCourse._id}`, courseForm);
      if (response.data.success) {
        setShowEditModal(false);
        fetchCourseDetails(selectedCourse._id);
        toast({
          title: 'تم تحديث الدورة بنجاح',
          description: `تم تحديث دورة "${courseForm.title}" بنجاح`,
          variant: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: 'خطأ في تحديث الدورة',
        description: error.response?.data?.error || error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
        duration: 6000
      });
    }
  };

  const handleToggleCourseStatus = async (courseId, newStatus) => {
    try {
      // Use the dedicated status endpoint
      const response = await axiosInstance.patch(`/api/admin/courses/${courseId}/status`, {
        isActive: Boolean(newStatus)
      });
      
      if (response.data.success) {
        // Update the course in the local state
        setCourses(prevCourses => 
          prevCourses.map(course => 
            course._id === courseId 
              ? { ...course, isActive: newStatus }
              : course
          )
        );
        
        // Also update selectedCourse if it's the same course
        if (selectedCourse && selectedCourse._id === courseId) {
          setSelectedCourse(prev => ({ ...prev, isActive: newStatus }));
        }
        
        toast({
          title: newStatus ? 'تم تفعيل الدورة بنجاح' : 'تم إلغاء تفعيل الدورة بنجاح',
          description: newStatus 
            ? 'الدورة متاحة الآن للطلاب' 
            : 'الدورة غير متاحة للطلاب حالياً',
          variant: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error toggling course status:', error);
      
      // If API call fails, still update the UI optimistically
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course._id === courseId 
            ? { ...course, isActive: newStatus }
            : course
        )
      );
      
      if (selectedCourse && selectedCourse._id === courseId) {
        setSelectedCourse(prev => ({ ...prev, isActive: newStatus }));
      }
      
      toast({
        title: 'تم تحديث الحالة محلياً',
        description: newStatus 
          ? 'تم تفعيل الدورة في الواجهة (قد تحتاج لإعادة تحميل الصفحة)' 
          : 'تم إلغاء تفعيل الدورة في الواجهة (قد تحتاج لإعادة تحميل الصفحة)',
        variant: 'default',
        duration: 5000
      });
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      try {
        const response = await axiosInstance.delete(`/api/admin/courses/${courseId}`);
        if (response.data.success) {
          fetchCourses();
          if (selectedCourse && selectedCourse._id === courseId) {
            navigate('/admin/courses');
          }
          toast({
            title: 'تم حذف الدورة بنجاح',
            description: 'تم حذف الدورة من النظام بنجاح',
            variant: 'success',
            duration: 4000
          });
        }
      } catch (error) {
        console.error('Error deleting course:', error);
        toast({
          title: 'خطأ في حذف الدورة',
          description: error.response?.data?.error || error.message || 'حدث خطأ غير متوقع',
          variant: 'destructive',
          duration: 6000
        });
      }
    }
  };

  const handleAddVideo = async (videoData) => {
    try {
      const response = await axiosInstance.post(`/api/admin/courses/${selectedCourse._id}/videos`, videoData);
      if (response.data.success) {
        setShowVideoModal(false);
        fetchCourseDetails(selectedCourse._id);
        toast({
          title: 'تم إضافة الفيديو بنجاح',
          description: `تم إضافة فيديو "${videoData.title}" للدورة بنجاح`,
          variant: 'success',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: 'خطأ في إضافة الفيديو',
        description: error.response?.data?.error || error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
        duration: 6000
      });
    }
  };


  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive);
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalItems = filteredCourses.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  // Enhanced helper functions
  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'نوع ملف غير مدعوم',
        description: 'يرجى اختيار صورة بصيغة JPG, PNG أو WebP',
        variant: 'destructive',
        duration: 5000
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: 'حجم الملف كبير جداً',
        description: 'يرجى اختيار صورة بحجم أقل من 5 ميجابايت',
        variant: 'destructive',
        duration: 5000
      });
      return false;
    }
    
    return true;
  };

  const handleImageUpload = (file) => {
    if (!validateImageFile(file)) return;
    
    setCourseImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCourseImagePreview(e.target.result);
      setCourseForm({ ...courseForm, thumbnail: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  // Validation uses youtubeUtils (supports watch, youtu.be, shorts, embed, params)
  const validateYouTubeUrl = (url) => isValidYouTubeUrl(url);

  const validateGoogleFormUrl = (url) => {
    const googleFormRegex = /^https:\/\/docs\.google\.com\/forms\/d\/[a-zA-Z0-9_-]+\/edit/;
    return googleFormRegex.test(url);
  };

  const addVideo = () => {
    if (!newVideoUrl.trim()) {
      toast({
        title: 'يرجى إدخال رابط الفيديو',
        description: 'الرجاء إدخال رابط فيديو YouTube صحيح',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    if (!validateYouTubeUrl(newVideoUrl)) {
      toast({
        title: 'رابط فيديو غير صحيح',
        description: 'يرجى إدخال رابط فيديو YouTube صحيح',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    const videoId = extractVideoId(newVideoUrl);
    const embedUrl = getEmbedUrlFromAnyYouTubeUrl(newVideoUrl) || `https://www.youtube.com/embed/${videoId}`;

    const newVideo = {
      id: Date.now(),
      url: embedUrl,
      videoId: videoId,
      title: `فيديو ${courseVideos.length + 1}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    };

    setCourseVideos([...courseVideos, newVideo]);
    setNewVideoUrl('');
    
    toast({
      title: 'تم إضافة الفيديو بنجاح',
      description: 'تم إضافة الفيديو إلى قائمة المحتوى',
      variant: 'success',
      duration: 3000
    });
  };

  const removeVideo = (videoId) => {
    setCourseVideos(courseVideos.filter(video => video.id !== videoId));
    toast({
      title: 'تم حذف الفيديو',
      description: 'تم حذف الفيديو من قائمة المحتوى',
      variant: 'success',
      duration: 3000
    });
  };

  const addExam = () => {
    if (!newExamUrl.trim()) {
      toast({
        title: 'يرجى إدخال رابط الاختبار',
        description: 'الرجاء إدخال رابط Google Form صحيح',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    if (!validateGoogleFormUrl(newExamUrl)) {
      toast({
        title: 'رابط اختبار غير صحيح',
        description: 'يرجى إدخال رابط Google Form صحيح',
        variant: 'destructive',
        duration: 4000
      });
      return;
    }

    const newExam = {
      id: Date.now(),
      url: newExamUrl,
      title: `اختبار ${courseExams.length + 1}`,
      type: 'google_form'
    };

    setCourseExams([...courseExams, newExam]);
    setNewExamUrl('');
    
    toast({
      title: 'تم إضافة الاختبار بنجاح',
      description: 'تم إضافة الاختبار إلى قائمة المحتوى',
      variant: 'success',
      duration: 3000
    });
  };

  const removeExam = (examId) => {
    setCourseExams(courseExams.filter(exam => exam.id !== examId));
    toast({
      title: 'تم حذف الاختبار',
      description: 'تم حذف الاختبار من قائمة المحتوى',
      variant: 'success',
      duration: 3000
    });
  };

  const resetForm = () => {
    setCourseForm({
      title: '',
      description: '',
      subject: '',
      grade: '',
      price: 0,
      duration: 0,
      thumbnail: '',
      isActive: true
    });
    setCourseImage(null);
    setCourseImagePreview(null);
    setCourseVideos([]);
    setCourseExams([]);
    setNewVideoUrl('');
    setNewExamUrl('');
    setIsDragOver(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: colors.background
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen size={32} color={colors.accent} />
        </motion.div>
      </div>
    );
  }

  // Course Details View
  if (selectedCourse) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 p-8">
          <div className=" absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{
              background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
            }}></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <LuxuryButton
                  variant="outline"
                  onClick={() => navigate('/admin/courses')}
                  className="flex items-center gap-2"
                >
                  ← العودة للقائمة
                </LuxuryButton>
              </div>
              
              <div className="flex-1 text-center lg:text-right">
                {/* Course Cover Image */}
                {(selectedCourse.coverImage || selectedCourse.imageUrl) && (
                  <div className="mb-6">
                    <img
                      src={getCourseCoverImage(selectedCourse)}
                      alt={selectedCourse.title}
                      className="w-full max-w-md mx-auto h-48 md:h-64 object-cover rounded-xl shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-center lg:justify-end gap-4 mb-4">
                  <div className="p-3 rounded-2xl" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `1px solid ${colors.accent}30`
                  }}>
                    <BookOpen size={32} color={colors.accent} />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                      {selectedCourse.title}
                    </h1>
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      {selectedCourse.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <LuxuryButton
                  variant="outline"
                  onClick={() => {
                    setCourseForm(selectedCourse);
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Edit size={18} />
                  تعديل الدورة
                </LuxuryButton>
                
                <LuxuryButton
                  variant="primary"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`
                  }}
                >
                  <Plus size={18} />
                  إضافة فيديو
                </LuxuryButton>

              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Course Info Cards */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LuxuryCard className="h-full" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.md
              }}>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `2px solid ${colors.accent}30`
                  }}>
                    <Video size={32} color={colors.accent} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {videos.length}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    فيديو تعليمي
                  </p>
                </div>
              </LuxuryCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <LuxuryCard className="h-full" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.md
              }}>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `2px solid ${colors.accent}30`
                  }}>
                    <FileText size={32} color={colors.accent} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {videos.length}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    الفيديوهات
                  </p>
                </div>
              </LuxuryCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <LuxuryCard className="h-full" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.md
              }}>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `2px solid ${colors.accent}30`
                  }}>
                    <Users size={32} color={colors.accent} />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {selectedCourse.enrolledStudents || 0}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    طالب مسجل
                  </p>
                </div>
              </LuxuryCard>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <LuxuryCard className="h-full" style={{
                background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
                border: `1px solid ${colors.border}`,
                boxShadow: shadows.md
              }}>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{
                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    border: `2px solid ${colors.accent}30`
                  }}>
                    <DollarSign size={32} color={colors.accent} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                    {formatCurrency(selectedCourse.price)}
                  </h3>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    سعر الدورة
                  </p>
                </div>
              </LuxuryCard>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Videos and Exams Section */}
        <LuxuryCard style={{ marginBottom: spacing['2xl'] }}>
          <div style={{ padding: spacing.xl }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.xl
            }}>
              <div>
                <h2 style={{ 
                  color: colors.text, 
                  margin: 0, 
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: '700',
                  marginBottom: spacing.sm
                }}>
                  محتوى الدورة الكامل
                </h2>
                <p style={{ 
                  color: colors.textMuted, 
                  margin: 0,
                  fontSize: typography.fontSize.lg
                }}>
                  الفيديوهات والامتحانات والمواد التعليمية
                </p>
              </div>
              <div style={{ display: 'flex', gap: spacing.md }}>
                <LuxuryButton
                  variant="primary"
                  size="md"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-2 hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`,
                    borderRadius: borderRadius.lg,
                    padding: `${spacing.md} ${spacing.lg}`,
                    fontWeight: '700'
                  }}
                >
                  <Plus size={20} />
                  إضافة فيديو جديد
                </LuxuryButton>
              </div>
            </div>
            
            {/* Enhanced Content Tabs */}
            <div className="mb-8">
              <div className="flex gap-2 mb-6">
                <button
                  className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                    border: `2px solid ${colors.accent}40`,
                    color: colors.accent,
                    boxShadow: `0 4px 15px ${colors.accent}20`
                  }}
                >
                  <Video size={20} className="inline mr-2" />
                  الفيديوهات ({videos.length})
                </button>
                <button
                  className="px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                    border: `2px solid ${colors.border}40`,
                    color: colors.textMuted
                  }}
                >
                  <FileText size={20} className="inline mr-2" />
                  الامتحانات ({selectedCourse.exams?.length || 0})
                </button>
              </div>
            </div>
            
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {videos.map((video, index) => {
                  const thumbnail = getVideoThumbnail(video.url, video.thumbnail);
                  
                  return (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gold-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-gold-400/10"
                    >
                      {/* Enhanced Video Thumbnail */}
                      <div className="relative aspect-video bg-gray-900 overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title || `Video ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 bg-gray-900 flex items-center justify-center"
                          style={{ display: thumbnail ? 'none' : 'flex' }}
                        >
                          <PlayCircle size={48} className="text-gray-500" />
                        </div>
                        
                        {/* Enhanced Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                            <Play size={32} className="text-white" />
                          </div>
                        </div>

                        {/* Enhanced Duration Badge */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-2 rounded-xl text-sm font-bold">
                            {formatVideoDurationFromMinutes(video.duration)}
                          </div>
                        )}
                        
                        {/* Video Order Badge */}
                        <div className="absolute top-3 left-3 bg-accent text-white px-3 py-2 rounded-xl text-sm font-bold">
                          #{index + 1}
                        </div>
                      </div>

                      {/* Enhanced Video Info */}
                      <div className="p-6">
                        <h4 className="text-white font-bold mb-3 line-clamp-2 text-lg">
                          {video.title || `Video ${index + 1}`}
                        </h4>
                        {video.description && (
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {video.description}
                          </p>
                        )}
                        
                        {/* Enhanced Action Buttons */}
                        <div className="flex gap-2">
                          <LuxuryButton 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            onClick={() => {
                              // Handle play video
                              window.open(video.url, '_blank');
                            }}
                            style={{
                              background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                              border: `2px solid ${colors.accent}40`,
                              borderRadius: borderRadius.lg,
                              padding: `${spacing.sm} ${spacing.md}`,
                              fontWeight: '600',
                              color: colors.accent
                            }}
                          >
                            <Play size={16} />
                            تشغيل
                          </LuxuryButton>
                          <LuxuryButton 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            onClick={() => {
                              setVideoForm({
                                title: video.title || '',
                                description: video.description || '',
                                videoUrl: video.url || '',
                                duration: video.duration || 0,
                                order: video.order || index
                              });
                              setShowVideoModal(true);
                            }}
                            style={{
                              background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                              border: `2px solid ${colors.border}40`,
                              borderRadius: borderRadius.lg,
                              padding: `${spacing.sm} ${spacing.md}`,
                              fontWeight: '600'
                            }}
                          >
                            <Edit size={16} />
                            تعديل
                          </LuxuryButton>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: spacing['2xl'] }}>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6" style={{
                  background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                  border: `3px solid ${colors.accent}30`,
                  boxShadow: `0 8px 25px ${colors.accent}20`
                }}>
                  <Video size={40} color={colors.accent} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  لا توجد فيديوهات في هذه الدورة
                </h3>
                <p className="text-lg font-medium mb-6 text-gray-700 dark:text-gray-300">
                  ابدأ بإضافة فيديوهات تعليمية للدورة
                </p>
                <LuxuryButton
                  variant="primary"
                  onClick={() => setShowVideoModal(true)}
                  className="flex items-center gap-3 mx-auto hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`,
                    borderRadius: borderRadius.lg,
                    padding: `${spacing.md} ${spacing.lg}`,
                    fontWeight: '700',
                    fontSize: typography.fontSize.md
                  }}
                >
                  <Plus size={22} />
                  إضافة فيديو جديد
                </LuxuryButton>
              </div>
            )}
          </div>
        </LuxuryCard>

      </div>
    );
  }

  // Courses List View
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-950">
      {/* Enhanced Header with Gradient Background */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-700  ">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{
              background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
            }}></div>
          </div>
          
          <div className="relative z-10  mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl" style={{
                  background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                  border: `2px solid ${colors.accent}30`,
                  boxShadow: `0 8px 25px ${colors.accent}20`
                }}>
                  <Crown size={40} color={colors.accent} />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold mb-3 p-5 text-gray-900 dark:text-white">
                    إدارة الدورات المتقدمة
                  </h1>
                  <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
                    إدارة شاملة لجميع الدورات التعليمية والمواد الدراسية
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
              
                <LuxuryButton
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-3 shadow-lg hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`,
                    borderRadius: borderRadius.lg,
                    padding: `${spacing.md} ${spacing.lg}`,
                    fontWeight: '700',
                    fontSize: typography.fontSize.md
                  }}
                >
                  <Plus size={22} />
                  إضافة دورة جديدة
                </LuxuryButton>
              </div>
            </div>
          </div>
        </div>

      {/* Luxury Filters Section */}
      <div className=" mx-auto px-6 py-8">
        <LuxuryCard className="overflow-hidden" style={{
          background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
          border: `1px solid ${colors.border}40`,
          boxShadow: `0 20px 40px ${colors.shadow}20, 0 8px 16px ${colors.shadow}10`,
          backdropFilter: 'blur(20px)',
          borderRadius: borderRadius.xl
        }}>
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 rounded-xl" style={{
                background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                border: `2px solid ${colors.accent}30`,
                boxShadow: `0 8px 25px ${colors.accent}20`
              }}>
                <Search size={24} color={colors.accent} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  البحث والتصفية المتقدمة
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ابحث وفلتر الدورات بسهولة وسرعة
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Enhanced Search Input */}
              <div className="relative md:col-span-2">
                <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">
                  البحث المتقدم في الدورات
                </label>
                <div className="relative">
                  <Search size={22} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <input
                    type="text"
                    placeholder="ابحث بالعنوان، المادة، أو الوصف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-12 pl-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:scale-105"
                  />
                </div>
              </div>
              
              {/* Enhanced Status Filter */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">
                  حالة الدورة
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 hover:scale-105"
                >
                  <option value="all">جميع الدورات</option>
                  <option value="active">نشطة فقط</option>
                  <option value="inactive">غير نشطة</option>
                </select>
              </div>
              
              {/* Enhanced Quick Actions */}
              <div>
                <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-white">
                  إجراءات سريعة
                </label>
                <div className="flex gap-3">
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    style={{
                      background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                      border: `1px solid ${colors.border}40`,
                      borderRadius: borderRadius.lg,
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontWeight: '600'
                    }}
                  >
                    <X size={16} />
                    مسح
                  </LuxuryButton>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:scale-105 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                      border: `1px solid ${colors.border}40`,
                      borderRadius: borderRadius.lg,
                      padding: `${spacing.sm} ${spacing.md}`,
                      fontWeight: '600'
                    }}
                  >
                    <Download size={16} />
                    تصدير
                  </LuxuryButton>
                </div>
              </div>
            </div>
          </div>
        </LuxuryCard>
      </div>

      {/* Luxury Courses Grid */}
      <div className=" mx-auto px-6 pb-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            الدورات المتاحة
          </h2>
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
            {totalItems} دورة متاحة
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <LuxuryCard className="h-full overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-105" style={{
                background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
                border: `2px solid ${colors.border}60`,
                boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)`,
                backdropFilter: 'blur(20px)',
                borderRadius: borderRadius.xl
              }}>
                {/* Luxury Course Thumbnail */}
                <div className="relative overflow-hidden" style={{
                  height: '200px',
                  background: getCourseCoverImage(course) !== getDefaultVideoThumbnail() ? `url(${getCourseCoverImage(course)})` : `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: `${borderRadius.xl} ${borderRadius.xl} 0 0`
                }}>
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40" />
                  
                  {getCourseCoverImage(course) === getDefaultVideoThumbnail() && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 rounded-xl" style={{
                        background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}20)`,
                        border: `2px solid ${colors.accent}50`,
                        boxShadow: `0 8px 25px ${colors.accent}30`
                      }}>
                        <Crown size={48} color={colors.accent} />
                      </div>
                    </div>
                  )}
                  
                  {/* Luxury Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-2 rounded-lg text-sm font-bold" style={{
                      backgroundColor: course.isActive ? colors.success + '25' : colors.error + '25',
                      color: course.isActive ? colors.success : colors.error,
                      border: `2px solid ${course.isActive ? colors.success + '40' : colors.error + '40'}`,
                      boxShadow: `0 4px 15px ${course.isActive ? colors.success + '20' : colors.error + '20'}`,
                      backdropFilter: 'blur(10px)'
                    }}>
                      {course.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  {/* Luxury Action Buttons Overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex gap-2">
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        className="p-2 hover:scale-110 transition-transform"
                        onClick={() => navigate(`/admin/courses/${course._id}`)}
                        style={{
                          backgroundColor: colors.surfaceCard + 'CC',
                          backdropFilter: 'blur(15px)',
                          border: `2px solid ${colors.border}40`,
                          borderRadius: borderRadius.lg,
                          boxShadow: `0 8px 25px ${colors.shadow}20`
                        }}
                      >
                        <Eye size={16} color={colors.text} />
                      </LuxuryButton>
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        className="p-2 hover:scale-110 transition-transform"
                        onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                        style={{
                          backgroundColor: colors.surfaceCard + 'CC',
                          backdropFilter: 'blur(15px)',
                          border: `2px solid ${colors.border}40`,
                          borderRadius: borderRadius.lg,
                          boxShadow: `0 8px 25px ${colors.shadow}20`
                        }}
                      >
                        <Edit size={16} color={colors.text} />
                      </LuxuryButton>
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        className="p-2 hover:scale-110 transition-transform"
                        onClick={() => handleDeleteCourse(course._id)}
                        style={{
                          backgroundColor: colors.error + '25',
                          backdropFilter: 'blur(15px)',
                          border: `2px solid ${colors.error}40`,
                          borderRadius: borderRadius.lg,
                          boxShadow: `0 8px 25px ${colors.error}20`
                        }}
                      >
                        <Trash2 size={16} color={colors.error} />
                      </LuxuryButton>
                    </div>
                  </div>
                </div>
                
                {/* Luxury Course Content */}
                <div className="p-5">
                  {/* Luxury Subject Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold" style={{
                      backgroundColor: colors.accent + '25',
                      color: colors.accent,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 4px 15px ${colors.accent}20`
                    }}>
                      <BookOpen size={14} />
                      {course.subject || 'غير محدد'}
                    </span>
                  </div>
                  
                  {/* Luxury Course Title */}
                  <h3 className="text-lg font-bold mb-3 line-clamp-2" style={{ 
                    color: colors.text,
                    fontSize: typography.fontSize.lg,
                    fontWeight: '700'
                  }}>
                    {course.title}
                  </h3>
                  
                  {/* Luxury Course Description */}
                  <p className="text-sm mb-5 line-clamp-2 font-medium" style={{ 
                    color: colors.textMuted,
                    fontSize: typography.fontSize.sm
                  }}>
                    {course.description || 'لا يوجد وصف متاح'}
                  </p>
                  
                  {/* Luxury Course Stats */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg" style={{
                          background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                          border: `1px solid ${colors.accent}30`
                        }}>
                          <GraduationCap size={16} color={colors.accent} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                          الصف: {course.grade || 'غير محدد'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg" style={{
                          background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                          border: `1px solid ${colors.accent}30`
                        }}>
                          <DollarSign size={16} color={colors.accent} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: colors.accent }}>
                          {formatCurrency(course.price || 0)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg" style={{
                          background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                          border: `1px solid ${colors.accent}30`
                        }}>
                          <Video size={16} color={colors.accent} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                          {course.videos?.length || 0} فيديو
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg" style={{
                          background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                          border: `1px solid ${colors.accent}30`
                        }}>
                          <Clock size={16} color={colors.accent} />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: colors.text }}>
                          {formatDuration(course.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Luxury Action Buttons */}
                  <div className="space-y-3">
                    {/* Toggle Active/Inactive Button */}
                    <LuxuryButton
                      variant={course.isActive ? "outline" : "primary"}
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                      onClick={() => handleToggleCourseStatus(course._id, !course.isActive)}
                      style={{
                        background: course.isActive 
                          ? `linear-gradient(135deg, ${colors.warning}25, ${colors.warning}15)`
                          : `linear-gradient(135deg, ${colors.success}25, ${colors.success}15)`,
                        border: `2px solid ${course.isActive ? colors.warning + '40' : colors.success + '40'}`,
                        borderRadius: borderRadius.lg,
                        padding: `${spacing.sm} ${spacing.md}`,
                        fontWeight: '600',
                        fontSize: typography.fontSize.sm,
                        color: course.isActive ? colors.warning : colors.success
                      }}

                      
                    >
                      {course.isActive ? (
                        <>
                          <Pause size={16} />
                          إلغاء التفعيل
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          تفعيل الدورة
                        </>
                      )}
                    </LuxuryButton>
                    
                    {/* Other Action Buttons */}
                    <div className="flex gap-3">
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        onClick={() => navigate(`/admin/courses/${course._id}/edit`)}

                        style={{
                          background: `linear-gradient(135deg, ${colors.surfaceCard}80, ${colors.surfaceCard}40)`,
                          border: `2px solid ${colors.border}40`,
                          borderRadius: borderRadius.lg,
                          padding: `${spacing.sm} ${spacing.md}`,
                          fontWeight: '600',
                          fontSize: typography.fontSize.sm
                        }}
                      >
                        <Edit size={14} />
                        تعديل 
                      </LuxuryButton>
                      
                      
                      <LuxuryButton
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                        onClick={() => handleDeleteCourse(course._id)}
                        style={{
                          background: `linear-gradient(135deg, ${colors.error}25, ${colors.error}15)`,
                          border: `2px solid ${colors.error}40`,
                          borderRadius: borderRadius.lg,
                          padding: `${spacing.sm} ${spacing.md}`,
                          fontWeight: '600',
                          fontSize: typography.fontSize.sm,
                          color: colors.error
                        }}
                      >
                        <Trash2 size={14} />
                        حذف
                      </LuxuryButton>
                    </div>
                  </div>
                </div>
              </LuxuryCard>
            </motion.div>
          ))}
        </div>
        
        {/* Luxury Empty State */}
        {totalItems === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <LuxuryCard style={{
              background: `linear-gradient(135deg, ${colors.surfaceCard}dd, ${colors.surfaceCard}aa)`,
              border: `2px solid ${colors.border}60`,
              boxShadow: `0 8px 25px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.05)`,
              backdropFilter: 'blur(20px)',
              borderRadius: borderRadius.xl,
              padding: spacing['2xl']
            }}>
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl mb-6" style={{
                  background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                  border: `3px solid ${colors.accent}30`,
                  boxShadow: `0 8px 25px ${colors.accent}20`
                }}>
                  <Crown size={48} color={colors.accent} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
                  لا توجد دورات متاحة
                </h3>
                <p className="text-lg font-medium mb-8" style={{ color: colors.textMuted }}>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'لم يتم العثور على دورات تطابق معايير البحث'
                    : 'ابدأ بإنشاء دورة جديدة لإدارة المحتوى التعليمي'
                  }
                </p>
                <LuxuryButton
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-3 mx-auto hover:scale-105 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}dd)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`,
                    borderRadius: borderRadius.lg,
                    padding: `${spacing.md} ${spacing.lg}`,
                    fontWeight: '700',
                    fontSize: typography.fontSize.md
                  }}
                >
                  <Plus size={22} />
                  إضافة دورة جديدة
                </LuxuryButton>
              </div>
            </LuxuryCard>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Items per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">عرض:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span className="text-sm text-gray-600 dark:text-gray-400">من أصل {totalItems}</span>
          </div>

          {/* Pagination info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            عرض {startIndex + 1} إلى {Math.min(endIndex, totalItems)} من {totalItems} دورة
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              الأولى
            </button>
            
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              السابقة
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded-md border transition-colors ${
                      currentPage === pageNum
                        ? 'bg-luxury-gold text-white border-luxury-gold'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              التالية
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              الأخيرة
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Modals */}

      {/* Enhanced Create Course Modal */}
      <EnhancedCreateCourseModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        handleCreateCourse={handleCreateCourse}
        isCreating={isCreating}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onSubmit={handleAddVideo}
        isLoading={false}
      />

    </div>
  );
};

export default CourseManagement;

