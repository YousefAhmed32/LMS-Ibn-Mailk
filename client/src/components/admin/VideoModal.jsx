import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  X, 
  Video, 
  Upload, 
  Link, 
  Clock, 
  FileText,
  Plus,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';

const VideoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  isLoading = false 
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    videoUrl: initialData?.url || '',
    duration: initialData?.duration || 0,
    order: initialData?.order || 0,
    thumbnail: initialData?.thumbnail || ''
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الفيديو مطلوب';
    }
    
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'رابط الفيديو مطلوب';
    } else if (!isValidYouTubeUrl(formData.videoUrl)) {
      newErrors.videoUrl = 'يرجى إدخال رابط YouTube صحيح';
    }
    
    if (formData.duration < 1) {
      newErrors.duration = 'مدة الفيديو يجب أن تكون على الأقل دقيقة واحدة';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const getVideoThumbnail = (url) => {
    if (!url) return '';
    
    const videoId = url.includes('youtu.be/') 
      ? url.split('youtu.be/')[1]?.split('?')[0]
      : url.includes('v=') 
        ? url.split('v=')[1]?.split('&')[0]
        : null;
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const videoData = {
      title: formData.title,
      description: formData.description,
      url: formData.videoUrl, // Map videoUrl to url for backend
      duration: formData.duration,
      order: formData.order,
      thumbnail: getVideoThumbnail(formData.videoUrl)
    };
    
    
    onSubmit(videoData);
  };



  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          style={{
            background: colors.surface,
            borderRadius: borderRadius.lg,
            boxShadow: shadows.xl
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: colors.accent + '20' }}>
                <Video size={24} color={colors.accent} />
              </div>
              <h2 style={{ 
                color: colors.text, 
                fontSize: typography.fontSize.xl,
                fontWeight: 'bold'
              }}>
                {initialData ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.textMuted }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  عنوان الفيديو *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.title ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  placeholder="أدخل عنوان الفيديو"
                />
                {errors.title && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: colors.error }}>
                    <AlertCircle size={14} />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                  المدة (بالدقائق) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.duration ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  placeholder="مدة الفيديو بالدقائق"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm flex items-center gap-1" style={{ color: colors.error }}>
                    <AlertCircle size={14} />
                    {errors.duration}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                وصف الفيديو
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                  '--tw-ring-color': colors.accent + '30'
                }}
                placeholder="وصف مختصر للفيديو"
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                رابط الفيديو (YouTube) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.videoUrl ? colors.error : colors.border,
                    backgroundColor: colors.background,
                    color: colors.text,
                    '--tw-ring-color': colors.accent + '30'
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <Link size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textMuted }} />
              </div>
              {errors.videoUrl && (
                <p className="mt-1 text-sm flex items-center gap-1" style={{ color: colors.error }}>
                  <AlertCircle size={14} />
                  {errors.videoUrl}
                </p>
              )}
              
              {/* Video Preview */}
              {formData.videoUrl && isValidYouTubeUrl(formData.videoUrl) && (
                <div className="mt-4">
                  <p className="text-sm mb-2" style={{ color: colors.textMuted }}>معاينة الفيديو:</p>
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <img
                      src={getVideoThumbnail(formData.videoUrl)}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <Video size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>




            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t" style={{ borderColor: colors.border }}>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-lg border-2 transition-all duration-200 font-medium"
                style={{
                  borderColor: colors.border,
                  color: colors.textMuted
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.background
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {initialData ? 'تحديث الفيديو' : 'إضافة الفيديو'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoModal;
