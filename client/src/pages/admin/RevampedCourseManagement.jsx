import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
  FileText,
  Users,
  Clock,
  Search,
  Filter,
  X,
  MoreVertical,
  Play,
  BookOpen,
  DollarSign,
  Calendar,
  GraduationCap,
  TrendingUp,
  Shield,
  Zap,
  Image,
  ExternalLink,
  FileImage,
  Youtube,
  FileCheck,
  HelpCircle,
  Info,
  Settings,
  BarChart3,
  Download,
  Upload,
  Save,
  Check,
  AlertCircle,
  PlayCircle,
  Trophy,
  Bookmark,
  Target,
  Award,
  Star,
  Pause,
  Volume2,
  VolumeX,
  Link,
  GripVertical
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import LuxuryCard from '../../components/ui/LuxuryCard';
import LuxuryButton from '../../components/ui/LuxuryButton';
import EnhancedCreateCourseModal from '../../components/admin/EnhancedCreateCourseModal';
import VideoModal from '../../components/admin/VideoModal';

// Course Preview Modal Component
const CoursePreviewModal = ({ course, isOpen, onClose }) => {
  const { colors } = useTheme();

  if (!course) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 border-b" style={{ borderColor: colors.border }}>
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X size={20} />
              </button>
              <h2 className="text-2xl font-bold text-center" style={{ color: colors.text }}>
                معاينة الدورة
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Course Cover */}
              <div className="mb-6">
                <div 
                  className="w-full h-48 rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: course.coverImage || course.imageUrl 
                      ? `url(${course.coverImage || course.imageUrl})` 
                      : `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {!(course.coverImage || course.imageUrl) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen size={64} color={colors.accent} />
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                    {course.title}
                  </h3>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {course.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.accent + '10' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Video size={20} color={colors.accent} />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        مقاطع الفيديو
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                      {course.videoCount || 0}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.secondary + '10' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={20} color={colors.secondary} />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        الاختبارات
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                      {course.testCount || 0}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.success + '10' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} color={colors.success} />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        الطلاب المسجلين
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.success }}>
                      {course.enrolledStudents || 0}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: colors.warning + '10' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} color={colors.warning} />
                      <span className="text-sm font-medium" style={{ color: colors.text }}>
                        السعر
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.warning }}>
                      {course.price} ج.م
                    </p>
                  </div>
                </div>

                {/* Course Details */}
                <div className="pt-4 border-t" style={{ borderColor: colors.border }}>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: colors.text }}>المادة:</span>
                      <span className="mr-2" style={{ color: colors.textMuted }}>{course.subject}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: colors.text }}>الصف:</span>
                      <span className="mr-2" style={{ color: colors.textMuted }}>{course.grade}</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: colors.text }}>المدة:</span>
                      <span className="mr-2" style={{ color: colors.textMuted }}>{course.duration} دقيقة</span>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: colors.text }}>الحالة:</span>
                      <span 
                        className="mr-2 px-2 py-1 rounded-full text-xs"
                        style={{
                          backgroundColor: course.isActive ? colors.success + '20' : colors.error + '20',
                          color: course.isActive ? colors.success : colors.error
                        }}
                      >
                        {course.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t flex gap-3" style={{ borderColor: colors.border }}>
              <LuxuryButton
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                إغلاق
              </LuxuryButton>
              <LuxuryButton
                variant="primary"
                onClick={() => {
                  onClose();
                  // Navigate to course details
                  window.open(`/courses/${course._id}`, '_blank');
                }}
                className="flex-1"
              >
                <ExternalLink size={16} className="ml-2" />
                عرض كطالب
              </LuxuryButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Course Card Component
const CourseCard = ({ course, onEdit, onDelete, onPreview }) => {
  const { colors } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <LuxuryCard 
        className="h-full overflow-hidden transition-all duration-300 hover:shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
          border: `1px solid ${colors.border}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Course Cover Image */}
        <div className="relative overflow-hidden" style={{ height: '200px' }}>
          <div 
            className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
            style={{
              backgroundImage: course.coverImage || course.imageUrl 
                ? `url(${course.coverImage || course.imageUrl})` 
                : `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!(course.coverImage || course.imageUrl) && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="p-6 rounded-full" style={{
                  background: `linear-gradient(135deg, ${colors.accent}30, ${colors.accent}20)`,
                  border: `2px solid ${colors.accent}50`
                }}>
                  <BookOpen size={48} color={colors.accent} />
                </div>
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: course.isActive ? colors.success + '20' : colors.error + '20',
                color: course.isActive ? colors.success : colors.error,
                border: `1px solid ${course.isActive ? colors.success + '30' : colors.error + '30'}`
              }}
            >
              {course.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          
          {/* Action Buttons Overlay */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex gap-2">
              <LuxuryButton
                variant="outline"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(course);
                }}
                style={{
                  backgroundColor: colors.surface + 'CC',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border}`
                }}
                title="معاينة الدورة"
              >
                <Eye size={16} color={colors.text} />
              </LuxuryButton>
              <LuxuryButton
                variant="outline"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                style={{
                  backgroundColor: colors.surface + 'CC',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${colors.border}`
                }}
                title="تعديل الدورة"
              >
                <Edit size={16} color={colors.text} />
              </LuxuryButton>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="p-6">
          {/* Subject Badge */}
          <div className="mb-3">
            <span 
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: colors.accent + '15',
                color: colors.accent,
                border: `1px solid ${colors.accent}30`
              }}
            >
              <BookOpen size={12} />
              {course.subject}
            </span>
          </div>
          
          {/* Course Title */}
          <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: colors.text }}>
            {course.title}
          </h3>
          
          {/* Course Description */}
          <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.textMuted }}>
            {course.description}
          </p>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl" style={{ backgroundColor: colors.accent + '05' }}>
            <div className="flex items-center gap-1 text-sm" style={{ color: colors.textMuted }}>
              <Video size={14} />
              <span>{course.videoCount || 0} فيديو</span>
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: colors.textMuted }}>
              <FileText size={14} />
              <span>{course.testCount || 0} اختبار</span>
            </div>
            <div className="flex items-center gap-1 text-sm" style={{ color: colors.textMuted }}>
              <Users size={14} />
              <span>{course.enrolledStudents || 0}</span>
            </div>
          </div>
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign size={16} color={colors.accent} />
              <span className="text-lg font-bold" style={{ color: colors.accent }}>
                {formatCurrency(course.price)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <LuxuryButton
                variant="outline"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
                title="تعديل الدورة"
              >
                <Edit size={16} color={colors.text} />
              </LuxuryButton>
              
              <LuxuryButton
                variant="outline"
                size="sm"
                className="p-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(course._id);
                }}
                style={{
                  borderColor: colors.error + '30',
                  color: colors.error
                }}
                title="حذف الدورة"
              >
                <Trash2 size={16} />
              </LuxuryButton>
            </div>
          </div>
        </div>
      </LuxuryCard>
    </motion.div>
  );
};

const RevampedCourseManagement = () => {
  const navigate = useNavigate();
  const { colors, spacing, borderRadius, typography, shadows, isDarkMode } = useTheme();
  
  // State management
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreating, setIsCreating] = useState(false);
  
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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/courses');
      if (response.data.success) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'خطأ في تحميل الدورات',
        description: 'حدث خطأ أثناء تحميل قائمة الدورات',
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e, enhancedFormData = null) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const formData = enhancedFormData || courseForm;
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('subject', formData.subject || '');
      formDataToSend.append('grade', formData.grade || '');
      formDataToSend.append('price', parseFloat(formData.price) || 0);
      formDataToSend.append('duration', parseFloat(formData.duration) || 0);
      formDataToSend.append('level', formData.level || 'beginner');
      formDataToSend.append('isActive', formData.isActive !== undefined ? formData.isActive : true);
      
      if (formData.thumbnail) {
        formDataToSend.append('imageUrl', formData.thumbnail);
      }

      const videos = [];
      if (formData.videos && Array.isArray(formData.videos)) {
        formData.videos.forEach((video, index) => {
          videos.push({
            title: video.title || `Video ${index + 1}`,
            url: video.videoUrl || video.url || '',
            order: index,
            duration: Math.max(1, video.duration || 1),
            thumbnail: video.thumbnail || ''
          });
        });
      }

      if (formData.exams && Array.isArray(formData.exams)) {
        formDataToSend.append('exams', JSON.stringify(formData.exams));
      }

      formDataToSend.append('videos', JSON.stringify(videos));

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
          description: `تم إنشاء دورة "${formData.title}" مع ${videos.length} فيديو و ${formData.exams?.length || 0} امتحان`,
          variant: 'success',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'خطأ في إنشاء الدورة',
        description: error.response?.data?.error || error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
        duration: 6000
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm(course);
    navigate(`/admin/courses/${course._id}/edit`);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدورة؟')) {
      try {
        const response = await axiosInstance.delete(`/api/admin/courses/${courseId}`);
        if (response.data.success) {
          fetchCourses();
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

  const handlePreviewCourse = (course) => {
    setSelectedCourse(course);
    setShowPreviewModal(true);
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && course.isActive) ||
                         (filterStatus === 'inactive' && !course.isActive);
    return matchesSearch && matchesFilter;
  });

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Enhanced Header */}
      <div className="relative overflow-hidden" style={{
        background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%)`,
        borderBottom: `1px solid ${colors.border}`,
        padding: `${spacing['2xl']} ${spacing.lg}`
      }}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" style={{
            background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl" style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}>
                <GraduationCap size={32} color={colors.accent} />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ color: colors.text }}>
                  إدارة الدورات
                </h1>
                <p className="text-lg" style={{ color: colors.textMuted }}>
                  إدارة جميع الدورات التعليمية والمواد الدراسية
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <LuxuryButton
                variant="outline"
                className="flex items-center gap-2"
              >
                <BarChart3 size={18} />
                إحصائيات
              </LuxuryButton>
              <LuxuryButton
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                  boxShadow: `0 8px 32px ${colors.accent}30`
                }}
              >
                <Plus size={20} />
                إضافة دورة جديدة
              </LuxuryButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <LuxuryCard className="overflow-hidden" style={{
          background: `linear-gradient(135deg, ${colors.surface} 0%, ${colors.background} 100%)`,
          border: `1px solid ${colors.border}`,
          boxShadow: shadows.lg
        }}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg" style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `1px solid ${colors.accent}30`
              }}>
                <Filter size={20} color={colors.accent} />
              </div>
              <h3 className="text-xl font-semibold" style={{ color: colors.text }}>
                البحث والتصفية
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="relative">
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  البحث في الدورات
                </label>
                <div className="relative">
                  <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    placeholder="ابحث بالعنوان أو المادة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text,
                      fontSize: typography.fontSize.sm,
                      '--tw-ring-color': colors.accent + '30'
                    }}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  حالة الدورة
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    fontSize: typography.fontSize.sm,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                >
                  <option value="all">جميع الدورات</option>
                  <option value="active">نشطة فقط</option>
                  <option value="inactive">غير نشطة</option>
                </select>
              </div>
              
              {/* Quick Actions */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  إجراءات سريعة
                </label>
                <div className="flex gap-2">
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                  >
                    <X size={16} />
                    مسح
                  </LuxuryButton>
                  <LuxuryButton
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
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

      {/* Enhanced Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onEdit={handleEditCourse}
              onDelete={handleDeleteCourse}
              onPreview={handlePreviewCourse}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Empty State */}
      {filteredCourses.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 rounded-full opacity-20" style={{
                background: `radial-gradient(circle, ${colors.accent} 0%, transparent 70%)`
              }}></div>
              <div className="relative p-8 rounded-full" style={{
                background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                border: `2px solid ${colors.accent}30`
              }}>
                <BookOpen size={80} color={colors.accent} />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              {searchTerm || filterStatus !== 'all' ? 'لا توجد نتائج' : 'لا توجد دورات'}
            </h3>
            
            <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: colors.textMuted }}>
              {searchTerm || filterStatus !== 'all' 
                ? 'لم نجد أي دورات تطابق معايير البحث الخاصة بك. جرب تغيير الكلمات المفتاحية أو المرشحات.'
                : 'ابدأ رحلتك التعليمية بإنشاء دورة جديدة وتقديم محتوى تعليمي متميز للطلاب.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {searchTerm || filterStatus !== 'all' ? (
                <LuxuryButton
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="flex items-center gap-2"
                >
                  <X size={18} />
                  مسح المرشحات
                </LuxuryButton>
              ) : (
                <LuxuryButton
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                    boxShadow: `0 8px 32px ${colors.accent}30`
                  }}
                >
                  <Plus size={20} />
                  إنشاء دورة جديدة
                </LuxuryButton>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Enhanced Create Course Modal */}
      <EnhancedCreateCourseModal
        showModal={showCreateModal}
        setShowModal={setShowCreateModal}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        handleCreateCourse={handleCreateCourse}
        isCreating={isCreating}
      />

      {/* Course Preview Modal */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onSubmit={() => {}}
        isLoading={false}
      />

    </div>
  );
};

export default RevampedCourseManagement;
