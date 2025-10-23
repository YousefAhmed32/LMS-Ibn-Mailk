import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { isValidExternalUrl, validateYouTubeUrl } from '../../utils/urlValidation';
import IntegratedExamBuilder from './IntegratedExamBuilder';
import {
  Plus,
  X,
  Save,
  BookOpen,
  Image,
  Youtube,
  FileCheck,
  Settings,
  Upload,
  FileImage,
  ExternalLink,
  Trash2,
  HelpCircle,
  Info,
  Crown,
  Sparkles,
  Star,
  Zap,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  GraduationCap,
  Users,
  Award,
  Target,
  TrendingUp,
  Lightbulb,
  Rocket
} from 'lucide-react';
import LuxuryButton from '../ui/LuxuryButton';

const EnhancedCreateCourseModal = ({ 
  showModal, 
  setShowModal, 
  courseForm, 
  setCourseForm, 
  handleCreateCourse,
  isCreating 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  // Enhanced form states
  const [courseImage, setCourseImage] = useState(null);
  const [courseImagePreview, setCourseImagePreview] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [courseExams, setCourseExams] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Helper functions
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

    const videoId = newVideoUrl.includes('youtu.be/') 
      ? newVideoUrl.split('youtu.be/')[1].split('?')[0]
      : newVideoUrl.split('v=')[1]?.split('&')[0];

    const newVideo = {
      id: Date.now(),
      url: newVideoUrl,
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

  // Handle exam changes from IntegratedExamBuilder
  const handleExamsChange = (updatedExams) => {
    setCourseExams(updatedExams);
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
    setIsDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Update courseForm with videos and exams data
    const enhancedCourseForm = {
      ...courseForm,
      videos: courseVideos.map(video => ({
        title: video.title,
        videoUrl: video.url,
        thumbnail: video.thumbnail
      })),
      exams: courseExams // Use the new exam structure directly
    };
    
    // Call the parent's handleCreateCourse with enhanced data
    await handleCreateCourse(e, enhancedCourseForm);
    
    // Reset form after successful creation
    if (!isCreating) {
      resetForm();
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full max-w-4xl h-[85vh] overflow-hidden rounded-lg shadow-xl mx-4 flex flex-col"
            style={{
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`
            }}
          >
            {/* Clean Header */}
            <div className="p-4 border-b flex items-center justify-between" style={{ 
              borderColor: colors.border,
              backgroundColor: colors.surface
            }}>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{
                  backgroundColor: colors.accent + '20',
                  color: colors.accent
                }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: colors.text }}>
                    إنشاء دورة جديدة
                  </h2>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    أضف دورة تعليمية جديدة
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ color: colors.textMuted }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar clean-ui no-ghost-scroll" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg" style={{
                      backgroundColor: colors.accent + '20',
                      color: colors.accent
                    }}>
                      <BookOpen size={18} />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                      المعلومات الأساسية
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        عنوان الدورة *
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="أدخل عنوان الدورة"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        وصف الدورة *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 resize-none"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="أدخل وصف الدورة"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        المادة *
                      </label>
                      <select
                        required
                        value={courseForm.subject}
                        onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
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
                        الصف الدراسي *
                      </label>
                      <select
                        required
                        value={courseForm.grade}
                        onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                      >
                        <option value="">اختر الصف</option>
                        <option value="7">أولي إعدادي</option>
                        <option value="8">ثاني إعدادي</option>
                        <option value="9">ثالث إعدادي</option>
                        <option value="10">أولي ثانوي</option>
                        <option value="11">ثاني ثانوي</option>
                        <option value="12">ثالث ثانوي</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        السعر *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="أدخل سعر الدورة"
                      />
                    </div>
                    
           
                  </div>
                </div>
                {/* Enhanced Course Image Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 4px 16px ${colors.accent}20`
                    }}>
                      <Image size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: colors.text }}>
                        صورة الدورة
                      </h3>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: colors.textMuted }}>
                        أضف صورة جذابة تمثل الدورة التعليمية
                      </p>
                    </div>
                  </div>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 text-center transition-all duration-300 ${
                      isDragOver ? 'scale-105' : ''
                    }`}
                    style={{
                      borderColor: isDragOver ? colors.accent : colors.border,
                      backgroundColor: isDragOver ? colors.accent + '15' : colors.background + '50',
                      boxShadow: `0 8px 32px ${colors.shadow}15`
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {courseImagePreview ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-4 sm:space-y-6"
                      >
                        <div className="relative inline-block">
                          <img
                            src={courseImagePreview}
                            alt="Course preview"
                            className="w-48 h-32 sm:w-56 sm:h-36 lg:w-64 lg:h-40 object-cover rounded-xl sm:rounded-2xl shadow-2xl"
                            style={{
                              border: `3px solid ${colors.accent}30`
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCourseImage(null);
                              setCourseImagePreview(null);
                              setCourseForm({ ...courseForm, thumbnail: '' });
                            }}
                            className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 p-1 sm:p-2 rounded-full hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: colors.error,
                              color: 'white',
                              boxShadow: `0 4px 16px ${colors.error}40`
                            }}
                          >
                            <X size={14} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-full" style={{
                          backgroundColor: colors.success + '20',
                          border: `1px solid ${colors.success}30`
                        }}>
                          <CheckCircle size={14} className="sm:w-4 sm:h-4" color={colors.success} />
                          <span className="text-xs sm:text-sm font-semibold" style={{ color: colors.success }}>
                            تم رفع الصورة بنجاح
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center" style={{
                          backgroundColor: colors.accent + '25',
                          border: `3px solid ${colors.accent}40`,
                          boxShadow: `0 8px 32px ${colors.accent}20`
                        }}>
                          <FileImage size={32} className="sm:w-10 sm:h-10" color={colors.accent} />
                        </div>
                        <div>
                          <p className="text-lg sm:text-xl font-bold mb-1 sm:mb-2" style={{ color: colors.text }}>
                            اسحب وأفلت الصورة هنا
                          </p>
                          <p className="text-sm sm:text-base font-medium" style={{ color: colors.textMuted }}>
                            أو انقر لاختيار ملف (JPG, PNG, WebP - حد أقصى 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                          id="course-image-upload"
                        />
                        <label
                          htmlFor="course-image-upload"
                          className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: colors.accent + '25',
                            border: `2px solid ${colors.accent}40`,
                            color: colors.accent,
                            boxShadow: `0 8px 32px ${colors.accent}20`
                          }}
                        >
                          <Upload size={16} className="sm:w-5 sm:h-5" />
                          <span className="font-semibold text-sm sm:text-base">اختيار صورة</span>
                        </label>
                      </div>
                    )}
                  </div>
                </motion.div>
                {/* Enhanced Videos Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 4px 16px ${colors.accent}20`
                    }}>
                      <Youtube size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: colors.text }}>
                        فيديوهات الدورة
                      </h3>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: colors.textMuted }}>
                        أضف فيديوهات YouTube التعليمية للدورة
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <input
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="flex-1 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:scale-105"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30',
                          boxShadow: `0 4px 16px ${colors.shadow}10`
                        }}
                        placeholder="أدخل رابط فيديو YouTube"
                      />
                      <LuxuryButton
                        type="button"
                        onClick={addVideo}
                        className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                          boxShadow: `0 8px 32px ${colors.accent}30`
                        }}
                      >
                        <Plus size={16} className="sm:w-5 sm:h-5" />
                        <span className="font-semibold text-sm sm:text-base">إضافة</span>
                      </LuxuryButton>
                    </div>
                    
                    {courseVideos.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{
                          backgroundColor: colors.accent + '15',
                          border: `1px solid ${colors.accent}30`
                        }}>
                          <TrendingUp size={18} color={colors.accent} />
                          <span className="text-sm font-semibold" style={{ color: colors.accent }}>
                            {courseVideos.length} فيديو تم إضافتها
                          </span>
                        </div>
                        {courseVideos.map((video, index) => (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-center gap-6 p-6 rounded-2xl hover:scale-105 transition-transform"
                            style={{
                              backgroundColor: colors.background,
                              border: `2px solid ${colors.border}`,
                              boxShadow: `0 8px 32px ${colors.shadow}15`
                            }}
                          >
                            <div className="flex-shrink-0 relative">
                              <img
                                src={video.thumbnail}
                                alt="Video thumbnail"
                                className="w-20 h-16 object-cover rounded-xl"
                                style={{
                                  border: `2px solid ${colors.accent}30`
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
                                <Youtube size={24} color="white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{
                                  backgroundColor: colors.accent + '20',
                                  color: colors.accent
                                }}>
                                  #{index + 1}
                                </span>
                                <p className="font-bold truncate" style={{ color: colors.text }}>
                                  {video.title}
                                </p>
                              </div>
                              <p className="text-sm truncate" style={{ color: colors.textMuted }}>
                                {video.url}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <LuxuryButton
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(video.url, '_blank')}
                                className="p-3 hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor: colors.surfaceCard + 'CC',
                                  backdropFilter: 'blur(15px)',
                                  border: `2px solid ${colors.border}40`,
                                  borderRadius: borderRadius.lg,
                                  boxShadow: `0 8px 25px ${colors.shadow}20`
                                }}
                              >
                                <ExternalLink size={18} />
                              </LuxuryButton>
                              <LuxuryButton
                                variant="outline"
                                size="sm"
                                onClick={() => removeVideo(video.id)}
                                className="p-3 hover:scale-110 transition-transform"
                                style={{
                                  backgroundColor: colors.error + '25',
                                  backdropFilter: 'blur(15px)',
                                  border: `2px solid ${colors.error}40`,
                                  borderRadius: borderRadius.lg,
                                  boxShadow: `0 8px 25px ${colors.error}20`,
                                  color: colors.error
                                }}
                              >
                                <Trash2 size={18} />
                              </LuxuryButton>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced Exam Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 4px 16px ${colors.accent}20`
                    }}>
                      <FileCheck size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: colors.text }}>
                        امتحانات الدورة
                      </h3>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: colors.textMuted }}>
                        أنشئ امتحانات داخلية مع أسئلة متعددة الخيارات
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 sm:space-y-6">
                    <IntegratedExamBuilder
                      exams={courseExams}
                      onExamsChange={handleExamsChange}
                      isDarkMode={theme.isDarkMode}
                    />
                  </div>
                </motion.div>




                {/* Enhanced Status Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative"
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`,
                      boxShadow: `0 4px 16px ${colors.accent}20`
                    }}>
                      <Settings size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold" style={{ color: colors.text }}>
                        إعدادات الدورة
                      </h3>
                      <p className="text-xs sm:text-sm font-medium" style={{ color: colors.textMuted }}>
                        تحكم في حالة ومرئية الدورة
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 p-6 rounded-2xl" style={{
                    backgroundColor: colors.background,
                    border: `2px solid ${colors.border}`,
                    boxShadow: `0 8px 32px ${colors.shadow}15`
                  }}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={courseForm.isActive}
                          onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                          className="w-6 h-6 rounded-lg"
                          style={{
                            accentColor: colors.accent
                          }}
                        />
                        {courseForm.isActive && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle size={16} color="white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <label htmlFor="isActive" className="text-lg font-bold" style={{ color: colors.text }}>
                          تفعيل الدورة
                        </label>
                        <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                          ستكون مرئية ومتاحة للطلاب
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{
                      backgroundColor: courseForm.isActive ? colors.success + '20' : colors.warning + '20',
                      border: `1px solid ${courseForm.isActive ? colors.success + '30' : colors.warning + '30'}`
                    }}>
                      {courseForm.isActive ? (
                        <>
                          <Shield size={16} color={colors.success} />
                          <span className="text-sm font-semibold" style={{ color: colors.success }}>
                            مفعلة
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color={colors.warning} />
                          <span className="text-sm font-semibold" style={{ color: colors.warning }}>
                            غير مفعلة
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: colors.border }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    disabled={isCreating}
                    className="px-4 py-2 rounded-lg border transition-colors hover:bg-gray-50 disabled:opacity-50"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      color: colors.text
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    style={{
                      backgroundColor: colors.accent
                    }}
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        إنشاء الدورة
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedCreateCourseModal;
