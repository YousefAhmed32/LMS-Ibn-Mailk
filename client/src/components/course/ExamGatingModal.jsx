import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  AlertTriangle, 
  Play, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';

const ExamGatingModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  videoProgress = {},
  examInfo = {},
  isLoading = false
}) => {
  const theme = useTheme();
  const { colors, spacing, borderRadius, typography, shadows } = theme;
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  if (!isOpen) return null;

  const { percent = 0, isCompleted = false } = videoProgress;
  const { title: examTitle, description: examDescription } = examInfo;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.surfaceCard,
            borderRadius: borderRadius.xl,
            boxShadow: shadows.xl,
            border: `1px solid ${colors.border}`
          }}
        >
          {/* Header */}
          <div className="p-6 border-b" style={{ borderColor: colors.border }}>
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-full"
                style={{ 
                  backgroundColor: isCompleted ? colors.success + '20' : colors.warning + '20',
                  color: isCompleted ? colors.success : colors.warning
                }}
              >
                {isCompleted ? (
                  <CheckCircle size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <div>
                <h3 
                  className="font-semibold"
                  style={{ 
                    color: colors.text,
                    fontSize: typography.fontSize.lg
                  }}
                >
                  {isCompleted ? 'Ready for Exam' : 'Video Not Complete'}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: colors.textMuted }}
                >
                  {isCompleted ? 'You can proceed to the exam' : 'Complete the video first for best results'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Progress Information */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{ 
                backgroundColor: colors.background,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Play size={16} style={{ color: colors.textMuted }} />
                  <span 
                    className="text-sm font-medium"
                    style={{ color: colors.text }}
                  >
                    Video Progress
                  </span>
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ 
                    color: isCompleted ? colors.success : colors.warning
                  }}
                >
                  {Math.round(percent)}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: isCompleted ? colors.success : colors.warning
                  }}
                />
              </div>
              
              <p 
                className="text-xs mt-2"
                style={{ color: colors.textMuted }}
              >
                {isCompleted 
                  ? '✅ Video completed! You can take the exam.' 
                  : `⚠️ You've watched ${Math.round(percent)}% of the video. Complete it for better exam performance.`
                }
              </p>
            </div>

            {/* Exam Information */}
            {examTitle && (
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ 
                  backgroundColor: colors.accent + '10',
                  border: `1px solid ${colors.accent}30`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={16} style={{ color: colors.accent }} />
                  <span 
                    className="font-medium"
                    style={{ color: colors.accent }}
                  >
                    {examTitle}
                  </span>
                </div>
                {examDescription && (
                  <p 
                    className="text-sm"
                    style={{ color: colors.textMuted }}
                  >
                    {examDescription}
                  </p>
                )}
              </div>
            )}

            {/* Warning Message */}
            {!isCompleted && (
              <div 
                className="p-4 rounded-lg mb-6"
                style={{ 
                  backgroundColor: colors.warning + '10',
                  border: `1px solid ${colors.warning}30`
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} style={{ color: colors.warning, marginTop: 2 }} />
                  <div>
                    <p 
                      className="font-medium mb-1"
                      style={{ color: colors.warning }}
                    >
                      Recommendation
                    </p>
                    <p 
                      className="text-sm"
                      style={{ color: colors.textMuted }}
                    >
                      We recommend completing at least 70% of the video before taking the exam for the best learning experience and exam performance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div 
            className="p-6 border-t flex gap-3"
            style={{ borderColor: colors.border }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCancel}
              disabled={isLoading || isConfirming}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor: colors.background,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                cursor: isLoading || isConfirming ? 'not-allowed' : 'pointer',
                opacity: isLoading || isConfirming ? 0.6 : 1
              }}
            >
              <ArrowLeft size={16} />
              <span>Go Back to Video</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={isLoading || isConfirming}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor: isCompleted ? colors.success : colors.warning,
                color: '#FFFFFF',
                border: 'none',
                cursor: isLoading || isConfirming ? 'not-allowed' : 'pointer',
                opacity: isLoading || isConfirming ? 0.6 : 1
              }}
            >
              {isLoading || isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>
                    {isCompleted ? 'Start Exam' : 'Proceed Anyway'}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExamGatingModal;
