import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from '../../hooks/use-toast';
import { isValidExternalUrl, validateYouTubeUrl } from '../../utils/urlValidation';
import IntegratedExamBuilder from './IntegratedExamBuilder';
import VideoManagementSection from './VideoManagementSection';
import useFormDraft from '../../hooks/useFormDraft';
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
  CheckCircle,
  AlertCircle,
  Shield,
  TrendingUp,
  ArrowLeft
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
  const [isDragOver, setIsDragOver] = useState(false);

  // Draft persistence
  const draftData = { courseForm, courseVideos, courseExams };
  const { hasDraft, draftDate, restoreDraft, discardDraft, clearDraft } = useFormDraft(
    'create-course-draft', draftData, { enabled: showModal }
  );

  useEffect(() => {
    if (showModal && hasDraft && draftDate) {
      const dateStr = draftDate.toLocaleString('ar-SA');
      const shouldRestore = window.confirm(`لديك مسودة محفوظة من ${dateStr}. هل تريد استعادتها؟`);
      if (shouldRestore) {
        const data = restoreDraft();
        if (data) {
          if (data.courseForm) setCourseForm(data.courseForm);
          if (data.courseVideos) setCourseVideos(data.courseVideos);
          if (data.courseExams) setCourseExams(data.courseExams);
          toast({ title: 'تم استعادة المسودة', description: 'تم استعادة بيانات النموذج السابقة' });
        }
      } else {
        discardDraft();
      }
    }
  }, [showModal]);

  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;
    
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

  // Video management is now handled by VideoManagementSection component

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
    setIsDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enhancedCourseForm = {
      ...courseForm,
      videos: courseVideos.map((video, index) => ({
        id: video.id || `video_${Date.now()}_${index}`,
        title: video.title,
        url: video.url,
        videoId: video.videoId,
        thumbnail: video.thumbnail,
        duration: video.duration || 0,
        order: video.order !== undefined ? video.order : index,
        status: video.status || 'visible', // ✅ احفظ الحالة
        
        // ✅ إرسال publishSettings بشكل صحيح
        publishSettings: video.publishSettings ? {
          publishDate: video.publishSettings.publishDate || null,
          autoPublish: video.publishSettings.autoPublish !== undefined ? video.publishSettings.autoPublish : true,
          notifyStudents: video.publishSettings.notifyStudents !== undefined ? video.publishSettings.notifyStudents : true
        } : {
          autoPublish: true,
          notifyStudents: true
        },
        
        publishedAt: video.publishedAt,
        createdAt: video.createdAt || new Date().toISOString(),
        lastModified: video.lastModified || new Date().toISOString(),
        provider: video.provider || 'youtube'
      })),
      exams: courseExams
    };

    console.log('📦 FULL COURSE DATA:', enhancedCourseForm);

    // Validation
    if (enhancedCourseForm.exams?.length > 0) {
      for (let examIndex = 0; examIndex < enhancedCourseForm.exams.length; examIndex++) {
        const exam = enhancedCourseForm.exams[examIndex];
        if (!exam.questions?.length) continue;
        
        for (let qIndex = 0; qIndex < exam.questions.length; qIndex++) {
          const q = exam.questions[qIndex];
          
          if (q.type === 'mcq' || q.type === 'multiple_choice') {
            if (!q.options || !Array.isArray(q.options) || q.options.length === 0) {
              toast({
                title: 'خطأ في الامتحان',
                description: `السؤال ${qIndex + 1} في الامتحان "${exam.title}": لا يحتوي على خيارات`,
                variant: 'destructive',
                duration: 6000
              });
              return;
            }
            
            if (!q.correctAnswer) {
              toast({
                title: 'خطأ في الامتحان',
                description: `السؤال ${qIndex + 1} في الامتحان "${exam.title}": لا يحتوي على إجابة صحيحة محددة`,
                variant: 'destructive',
                duration: 6000
              });
              return;
            }
            
            const optionIds = q.options.map(opt => opt.id || opt._id).filter(Boolean);
            if (!optionIds.includes(q.correctAnswer)) {
              toast({
                title: 'خطأ في الامتحان',
                description: `السؤال ${qIndex + 1} في الامتحان "${exam.title}": الإجابة الصحيحة غير موجودة في الخيارات`,
                variant: 'destructive',
                duration: 8000
              });
              return;
            }
          }
          
          if (q.type === 'true_false') {
            if (q.correctAnswer !== true && q.correctAnswer !== false) {
              toast({
                title: 'خطأ في الامتحان',
                description: `السؤال ${qIndex + 1} (صح/خطأ) في الامتحان "${exam.title}": لا يحتوي على إجابة صحيحة`,
                variant: 'destructive',
                duration: 6000
              });
              return;
            }
          }
        }
      }
    }

    try {
      await handleCreateCourse(e, enhancedCourseForm);
      clearDraft();
      resetForm();
    } catch (err) {
      console.error('Create course failed:', err);
    }
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{
            background: theme.isDarkMode 
              ? 'linear-gradient(135deg, #0f0f14 0%, #1a1a24 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)'
          }}
        >
          {/* ✅ FULL-SCREEN HEADER */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="flex-shrink-0 border-b backdrop-blur-xl"
            style={{
              borderColor: colors.border,
              background: theme.isDarkMode ? 'rgba(15, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{ background: colors.background, color: colors.textSoft }}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">رجوع</span>
                  </button>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, #059669 100%)`,
                      boxShadow: `0 0 24px ${colors.accent}35`
                    }}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black" style={{ color: colors.text }}>
                      إنشاء دورة جديدة
                    </h1>
                    <p className="text-sm mt-0.5" style={{ color: colors.textSoft }}>
                      قم بإنشاء دورة تعليمية احترافية شاملة
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all hover:scale-110 active:scale-90"
                  style={{ background: colors.error + '25', color: colors.error }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ✅ FULL-SCREEN CONTENT */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-3xl border p-8"
                  style={{
                    background: colors.surfaceCard,
                    borderColor: colors.border,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`
                    }}>
                      <BookOpen size={24} color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                        المعلومات الأساسية
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        أدخل بيانات الدورة الأساسية
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        عنوان الدورة *
                      </label>
                      <input
                        type="text"
                        required
                        value={courseForm.title}
                        onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="مثال: دورة اللغة العربية الشاملة"
                      />
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        وصف الدورة *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 resize-y min-h-[150px]"
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                          color: colors.text,
                          '--tw-ring-color': colors.accent + '30'
                        }}
                        placeholder="وصف تفصيلي للدورة التعليمية... (يمكنك الكتابة بحرية بدون قيود)"
                      />
                      <p className="text-xs mt-2" style={{ color: colors.textMuted }}>
                        💡 يمكنك كتابة وصف طويل ومفصل للدورة بدون أي قيود على عدد الأحرف
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        المادة *
                      </label>
                      <select
                        required
                        value={courseForm.subject}
                        onChange={(e) => setCourseForm({ ...courseForm, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4"
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
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        الصف الدراسي *
                      </label>
                      <select
                        required
                        value={courseForm.grade}
                        onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4"
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
                    
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                        السعر (جنيه) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={courseForm.price}
                        onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-4"
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
                </motion.div>

                {/* Course Image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-3xl border p-8"
                  style={{
                    background: colors.surfaceCard,
                    borderColor: colors.border,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`
                    }}>
                      <Image size={24} color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                        صورة الدورة
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        أضف صورة جذابة تمثل الدورة
                      </p>
                    </div>
                  </div>
                  
                  <div
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                      isDragOver ? 'scale-105' : ''
                    }`}
                    style={{
                      borderColor: isDragOver ? colors.accent : colors.border,
                      backgroundColor: isDragOver ? colors.accent + '15' : colors.background
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {courseImagePreview ? (
                      <div className="space-y-6">
                        <div className="relative inline-block">
                          <img
                            src={courseImagePreview}
                            alt="Preview"
                            className="w-64 h-40 object-cover rounded-2xl shadow-2xl"
                            style={{ border: `3px solid ${colors.accent}30` }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCourseImage(null);
                              setCourseImagePreview(null);
                              setCourseForm({ ...courseForm, thumbnail: '' });
                            }}
                            className="absolute -top-3 -right-3 p-2 rounded-full hover:scale-110 transition-transform"
                            style={{ backgroundColor: colors.error, color: 'white' }}
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full" style={{
                          backgroundColor: colors.success + '20',
                          border: `1px solid ${colors.success}30`
                        }}>
                          <CheckCircle size={18} color={colors.success} />
                          <span className="text-sm font-semibold" style={{ color: colors.success }}>
                            تم رفع الصورة بنجاح
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                          backgroundColor: colors.accent + '25',
                          border: `3px solid ${colors.accent}40`
                        }}>
                          <FileImage size={40} color={colors.accent} />
                        </div>
                        <div>
                          <p className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                            اسحب وأفلت الصورة هنا
                          </p>
                          <p className="text-base" style={{ color: colors.textMuted }}>
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
                          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl cursor-pointer transition-all hover:scale-105"
                          style={{
                            backgroundColor: colors.accent + '25',
                            border: `2px solid ${colors.accent}40`,
                            color: colors.accent
                          }}
                        >
                          <Upload size={20} />
                          <span className="font-semibold">اختيار صورة</span>
                        </label>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Videos - Advanced Management */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <VideoManagementSection
                    videos={courseVideos}
                    onVideosChange={setCourseVideos}
                    colors={colors}
                  />
                </motion.div>

                {/* Exams */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-3xl border p-8"
                  style={{
                    background: colors.surfaceCard,
                    borderColor: colors.border,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`
                    }}>
                      <FileCheck size={24} color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                        امتحانات الدورة
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        أنشئ امتحانات داخلية مع أسئلة متعددة
                      </p>
                    </div>
                  </div>
                  
                  <IntegratedExamBuilder
                    exams={courseExams}
                    onExamsChange={handleExamsChange}
                    isDarkMode={theme.isDarkMode}
                  />
                </motion.div>

                {/* Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-3xl border p-8"
                  style={{
                    background: colors.surfaceCard,
                    borderColor: colors.border,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl" style={{
                      background: `linear-gradient(135deg, ${colors.accent}25, ${colors.accent}15)`,
                      border: `2px solid ${colors.accent}40`
                    }}>
                      <Settings size={24} color={colors.accent} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold" style={{ color: colors.text }}>
                        إعدادات الدورة
                      </h3>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        تحكم في حالة الدورة
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 p-6 rounded-2xl" style={{
                    backgroundColor: colors.background,
                    border: `2px solid ${colors.border}`
                  }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={courseForm.isActive}
                      onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                      className="w-6 h-6 rounded-lg"
                      style={{ accentColor: colors.accent }}
                    />
                    <div>
                      <label htmlFor="isActive" className="text-lg font-bold" style={{ color: colors.text }}>
                        تفعيل الدورة
                      </label>
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        ستكون مرئية ومتاحة للطلاب
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full ml-auto" style={{
                      backgroundColor: courseForm.isActive ? colors.success + '20' : colors.warning + '20',
                      border: `1px solid ${courseForm.isActive ? colors.success + '30' : colors.warning + '30'}`
                    }}>
                      {courseForm.isActive ? (
                        <>
                          <Shield size={16} color={colors.success} />
                          <span className="text-sm font-semibold" style={{ color: colors.success }}>مفعلة</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color={colors.warning} />
                          <span className="text-sm font-semibold" style={{ color: colors.warning }}>غير مفعلة</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-900 via-white dark:via-gray-900 to-transparent pt-8 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    disabled={isCreating}
                    className="px-8 py-4 rounded-xl border-2 transition-all hover:scale-105 disabled:opacity-50"
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
                    className="px-8 py-4 rounded-xl text-white transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-3"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}CC)`,
                      boxShadow: `0 8px 32px ${colors.accent}30`
                    }}
                  >
                    {isCreating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإنشاء...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
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