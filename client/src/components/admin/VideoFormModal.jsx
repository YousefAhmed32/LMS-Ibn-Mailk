import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Link as LinkIcon, Clock, Eye, EyeOff, Calendar } from 'lucide-react';
import LuxuryCard from '../ui/LuxuryCard';
import LuxuryButton from '../ui/LuxuryButton';

const VideoFormModal = ({ isOpen, onClose, onSave, video, colors }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    duration: 0,
    status: 'visible'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        url: video.url || '',
        duration: video.duration || 0,
        status: video.status || 'visible'
      });
    } else {
      setFormData({
        title: '',
        url: '',
        duration: 0,
        status: 'visible'
      });
    }
    setErrors({});
  }, [video, isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان الفيديو مطلوب';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'رابط الفيديو مطلوب';
    } else if (!isValidYouTubeURL(formData.url)) {
      newErrors.url = 'الرابط يجب أن يكون من YouTube';
    }

    if (formData.duration < 0) {
      newErrors.duration = 'المدة يجب أن تكون 0 أو أكبر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidYouTubeURL = (url) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <LuxuryCard className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  <Video size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: colors?.text || '#1f2937' }}>
                    {video ? 'تعديل الفيديو' : 'إضافة فيديو جديد'}
                  </h2>
                  <p className="text-sm" style={{ color: colors?.textMuted || '#6b7280' }}>
                    أدخل بيانات الفيديو من YouTube
                  </p>
                </div>
              </div>
              <LuxuryButton variant="ghost" onClick={onClose} className="p-2">
                <X size={20} />
              </LuxuryButton>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors?.text || '#1f2937' }}>
                  عنوان الفيديو *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-xl border-2 ${
                    errors.title ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                  } focus:border-cyan-500 bg-white dark:bg-gray-800 transition-colors`}
                  placeholder="مثال: مقدمة في النحو - الدرس الأول"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors?.text || '#1f2937' }}>
                  رابط الفيديو (YouTube) *
                </label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${
                      errors.url ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                    } focus:border-cyan-500 bg-white dark:bg-gray-800 transition-colors`}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                {errors.url && (
                  <p className="text-red-500 text-sm mt-1">{errors.url}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  💡 يمكنك نسخ الرابط من شريط العنوان أو زر "مشاركة" في YouTube
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors?.text || '#1f2937' }}>
                  مدة الفيديو (بالدقائق)
                </label>
                <div className="relative">
                  <Clock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    min="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-cyan-500 bg-white dark:bg-gray-800"
                    placeholder="15"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: colors?.text || '#1f2937' }}>
                  حالة الفيديو
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.status === 'visible' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="visible"
                      checked={formData.status === 'visible'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-green-600" />
                        <span className="font-medium">مرئي</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">متاح للطلاب فوراً</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.status === 'hidden' 
                      ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="hidden"
                      checked={formData.status === 'hidden'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <EyeOff size={16} className="text-gray-600" />
                        <span className="font-medium">مخفي</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">غير مرئي للطلاب</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.status === 'scheduled' 
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-yellow-300'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      value="scheduled"
                      checked={formData.status === 'scheduled'}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-yellow-600" />
                        <span className="font-medium">مجدول</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">حدد موعد النشر لاحقاً</p>
                    </div>
                  </label>
                </div>
                {formData.status === 'scheduled' && (
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                    💡 بعد حفظ الفيديو، يمكنك تحديد موعد النشر من خلال زر "جدولة"
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <LuxuryButton
                variant="ghost"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl"
              >
                إلغاء
              </LuxuryButton>
              <LuxuryButton
                onClick={handleSubmit}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg"
              >
                {video ? '💾 حفظ التعديلات' : '➕ إضافة الفيديو'}
              </LuxuryButton>
            </div>
          </LuxuryCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VideoFormModal;
