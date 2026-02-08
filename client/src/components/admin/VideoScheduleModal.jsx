import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Calendar, Clock, Bell, Zap, AlertCircle } from 'lucide-react';
import LuxuryCard from '../ui/LuxuryCard';
import LuxuryButton from '../ui/LuxuryButton';

const VideoScheduleModal = ({ isOpen, video, onClose, onSave, subscribedStudentsCount = 0 }) => {
  const [scheduleData, setScheduleData] = useState({
    publishDate: '',
    autoPublish: true,
    notifyStudents: true
  });

  const [errors, setErrors] = useState([]);

  // Update scheduleData when video changes
  useEffect(() => {
    if (video && isOpen) {
      setScheduleData({
        publishDate: video?.publishSettings?.publishDate
          ? new Date(video.publishSettings.publishDate).toISOString().slice(0, 16)
          : '',
        autoPublish: video?.publishSettings?.autoPublish ?? true,
        notifyStudents: video?.publishSettings?.notifyStudents ?? true
      });
      setErrors([]);
    }
  }, [video, isOpen]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Validation
  const validate = () => {
    const newErrors = [];
    const selectedDate = new Date(scheduleData.publishDate);
    const now = new Date();

    if (!scheduleData.publishDate) {
      newErrors.push('يجب تحديد تاريخ ووقت النشر');
    } else if (selectedDate <= now) {
      newErrors.push('التاريخ يجب أن يكون في المستقبل');
    } else if (selectedDate - now < 60 * 60 * 1000) {
      // تحذير إذا كان الموعد خلال أقل من ساعة
      newErrors.push('⚠️ تحذير: الموعد المحدد خلال أقل من ساعة');
    }

    setErrors(newErrors);
    return newErrors.length === 0 || newErrors.every(e => e.startsWith('⚠️'));
  };

  const handleSave = () => {
    if (!validate()) return;

    const hasWarnings = errors.some(e => e.startsWith('⚠️'));
    if (hasWarnings) {
      const confirmed = window.confirm('هل أنت متأكد من المتابعة؟\n' + errors.join('\n'));
      if (!confirmed) return;
    }

    onSave({
      ...video,
      status: 'scheduled',
      publishSettings: {
        publishDate: new Date(scheduleData.publishDate).toISOString(),
        autoPublish: scheduleData.autoPublish,
        notifyStudents: scheduleData.notifyStudents
      }
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
          style={{ zIndex: 9999 }}
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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">جدولة الفيديو</h2>
                <p className="text-sm text-gray-500">"{video?.title}"</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="إغلاق"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Date & Time Picker */}
            <div>
              <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar size={16} className="text-purple-600" />
                📅 تاريخ ووقت النشر
              </label>
              <input
                type="datetime-local"
                value={scheduleData.publishDate}
                onChange={(e) => setScheduleData(prev => ({ ...prev, publishDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 bg-white dark:bg-gray-800 transition-colors"
              />
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border-2 border-cyan-200/50 dark:border-cyan-700/30 cursor-pointer hover:shadow-md transition-all">
                <input
                  type="checkbox"
                  checked={scheduleData.autoPublish}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, autoPublish: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-cyan-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Zap size={18} className="text-cyan-600" />
                  <div>
                    <span className="font-medium">نشر تلقائي في الموعد المحدد</span>
                    <p className="text-xs text-gray-500">سيتم نشر الفيديو تلقائياً دون تدخل يدوي</p>
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200/50 dark:border-green-700/30 cursor-pointer hover:shadow-md transition-all">
                <input
                  type="checkbox"
                  checked={scheduleData.notifyStudents}
                  onChange={(e) => setScheduleData(prev => ({ ...prev, notifyStudents: e.target.checked }))}
                  className="w-5 h-5 rounded border-2 border-green-500"
                />
                <div className="flex items-center gap-2 flex-1">
                  <Bell size={18} className="text-green-600" />
                  <div>
                    <span className="font-medium">إرسال إشعار للطلاب المشتركين</span>
                    <p className="text-xs text-gray-500">سيتم إشعار {subscribedStudentsCount} طالب مشترك</p>
                  </div>
                </div>
              </label>
            </div>

            {/* Preview */}
            {scheduleData.publishDate && (
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200/50 dark:border-purple-700/30">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-purple-600" />
                  📊 معاينة الجدولة
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>📅 سيتم نشر الفيديو في:</strong><br />
                    {new Date(scheduleData.publishDate).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p>
                    <strong>⏰ الساعة:</strong> {new Date(scheduleData.publishDate).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {scheduleData.autoPublish && (
                    <p className="text-cyan-600 dark:text-cyan-400">
                      ⚡ النشر سيتم <strong>تلقائياً</strong> في الموعد المحدد
                    </p>
                  )}
                  {scheduleData.notifyStudents && (
                    <p className="text-green-600 dark:text-green-400">
                      🔔 سيتم إرسال إشعار لـ <strong>{subscribedStudentsCount} طالب مشترك</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700/30 rounded-xl">
                {errors.map((error, i) => (
                  <p key={i} className={`text-sm ${error.startsWith('⚠️') ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {error}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={!scheduleData.publishDate}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold shadow-xl rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              💾 حفظ الجدولة
            </button>
          </div>
        </LuxuryCard>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoScheduleModal;
